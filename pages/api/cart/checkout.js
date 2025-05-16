import { sealData, unsealData } from "iron-session";
import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { validateCustomer, validateOrder, validateOrderWithStock } from "@/lib/utils/validation";

const resend = new Resend(process.env.RESEND_API_KEY);
const getCheckOrderUrl = (orderId, email) =>
  process.env.NEXTAUTH_URL + `/check-order?orderId=${orderId}&email=${email}`;

const sessionOptions = {
  password: process.env.SESSION_SECRET,
  ttl: 60 * 60 * 24 * 7,
  cookieName: "cart_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

const getCartSession = async (req, res) => {
  const cookie = req.cookies[sessionOptions.cookieName];
  const session = cookie ? await unsealData(cookie, sessionOptions) : { cart: [] };

  return {
    getCart: () => session.cart || [],
    saveCart: async (newCart) => {
      const sealedData = await sealData({ cart: newCart }, sessionOptions);
      res.setHeader("Set-Cookie", [
        `${sessionOptions.cookieName}=${sealedData}; ` +
          `Path=/; Max-Age=${sessionOptions.ttl}; ` +
          `${sessionOptions.cookieOptions.secure ? "Secure; " : ""}` +
          `HttpOnly; SameSite=${sessionOptions.cookieOptions.sameSite}`,
      ]);
    },
  };
};

// Вспомогательные функции
async function getOrCreateCustomer(customerData, tx) {
  // Валидация данных клиента
  const validation = validateCustomer(customerData);
  if (!validation.valid) {
    throw { status: 400, message: validation.errors };
  }

  return tx.customer.upsert({
    where: { email: customerData.email },
    update: {
      firstname: customerData.firstname === "" ? undefined : customerData.firstname,
      lastname: customerData.lastname === "" ? undefined : customerData.lastname,
      phone: customerData.phone === "" ? undefined : customerData.phone,
    },
    create: {
      email: customerData.email,
      firstname: customerData.firstname,
      lastname: customerData.lastname,
      phone: customerData.phone,
    },
  });
}

async function createOrderTransaction(orderData, tx) {
  // Проверка остатков
  const stockValidation = await validateOrderWithStock(orderData, tx);
  if (!stockValidation.valid) {
    throw { status: 400, message: stockValidation.errors };
  }

  // Создание заказа
  const newOrder = await tx.order.create({
    data: {
      customerId: orderData.customerId,
      status: "NEW",
      products: {
        create: orderData.products.map((p) => ({
          productId: p.productId,
          count: p.count,
        })),
      },
    },
    include: {
      customer: true,
      products: {
        include: {
          product: true,
        },
      },
    },
  });

  // Обновление остатков
  await Promise.all(
    orderData.products.map((item) =>
      tx.product.update({
        where: { id: item.productId },
        data: { count: { decrement: item.count } },
      })
    )
  );

  return newOrder;
}

// Основной обработчик
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getCartSession(req, res);

  try {
    const cart = await session.getCart();
    const { customer: customerData } = req.body;

    // Валидация корзины
    if (!cart?.length) {
      return res.status(400).json({ error: "Корзина пуста" });
    }

    // Рассчет общей суммы
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Создание заказа в транзакции
    const order = await prisma.$transaction(async (tx) => {
      // Создание/обновление клиента
      const customer = await getOrCreateCustomer(customerData, tx);

      // Подготовка данных заказа
      const orderData = {
        customerId: customer.id,
        status: "NEW",
        products: cart.map((item) => ({
          productId: item.productId,
          count: item.quantity,
          price: item.price,
        })),
      };

      // Валидация заказа
      const orderValidation = validateOrder(orderData);
      if (!orderValidation.valid) {
        throw { status: 400, message: orderValidation.errors };
      }

      return createOrderTransaction(orderData, tx);
    });

    // Очистка корзины
    await session.saveCart([]);

    try {
      await resend.emails.send({
        from: "АвтоДВС <onboarding@resend.dev>",
        to: [order.customer.email],
        subject: `Заказ #${order.id} создан`,
        html: `
          <h1>Спасибо за заказ!</h1>
          <p>Номер вашего заказа: <strong>#${order.id}</strong></p>

          <h2>Детали заказа:</h2>
          <ul>
            ${order.products
              .map(
                (p) => `
              <li>
                ${p.product.name} × ${p.count}
                - ${p.product.price * p.count} ₽
              </li>
            `
              )
              .join("")}
          </ul>

          <p><strong>Итого: ${total.toLocaleString("ru-RU")} ₽</strong></p>

          <p>Статус заказа можно отслеживать на <a href="${getCheckOrderUrl(order.id, order.customer.email)}">странице проверки</a>.</p>
        `,
      });
    } catch (emailError) {
      console.error("Ошибка отправки письма:", emailError);
    }

    // Форматирование ответа
    const response = {
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      customer: {
        id: order.customer.id,
        email: order.customer.email,
        name: `${order.customer.firstname} ${order.customer.lastname}`.trim(),
      },
      products: order.products.map((p) => ({
        id: p.product.id,
        name: p.product.name,
        price: p.product.price,
        quantity: p.count,
      })),
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error("Checkout error:", error);
    const status = error.status || 500;
    const message = error.message || "Ошибка оформления заказа";
    return res.status(status).json({ error: message });
  }
}
