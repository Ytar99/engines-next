require("dotenv").config();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const USER_ROLES = Object.freeze({
  ADMIN: "ADMIN",
  USER: "USER",
});

const prisma = new PrismaClient();

function logToConsole(text = "", type = "info") {
  let result = "";

  switch (type) {
    case "info":
      result += "[\u001b[36m" + "Инфо" + "\u001b[0m]: ";
      break;
    case "warn":
      result += "[\u001b[33m" + "Предупреждение" + "\u001b[0m]: ";
      break;
    case "error":
      result += "[\u001b[31m" + "Ошибка" + "\u001b[0m]: ";
      break;
    default:
      result += "[" + "Лог" + "]: ";
      break;
  }

  result += text;
  console.log(result);
}

function generateRandomProducts(N, engineNames) {
  const products = [];

  for (let i = 0; i < N; i++) {
    const article = `ART-${Math.floor(100000 + Math.random() * 900000)}`;
    const name = `Товар ${i + 1}`;
    const description = `Подробное описание товара ${i + 1}`;
    const price = parseFloat((Math.random() * 500 + 50).toFixed(2));
    const count = Math.floor(Math.random() * 100);
    const engineName = engineNames[Math.floor(Math.random() * engineNames.length)];
    const img = `https://example.com/images/product_${i + 1}.jpg`;

    products.push({
      article,
      name,
      description,
      price,
      count,
      engineName,
      img,
    });
  }

  return products;
}

async function main() {
  // Создание администратора
  const hashedPassword = await bcrypt.hash(process.env.DB_ADMIN_PASSWORD, 10);
  const adminExists = await prisma.user.findUnique({
    where: { email: process.env.DB_ADMIN_EMAIL },
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: process.env.DB_ADMIN_EMAIL,
        password: hashedPassword,
        role: USER_ROLES.ADMIN,
      },
    });
    logToConsole("Администратор создан", "info");
  }

  // Создание 15 пользователей
  for (let i = 0; i < 15; i++) {
    const email = `user${i + 1}@example.com`;
    const exists = await prisma.user.findUnique({ where: { email } });

    if (!exists) {
      const role = i === 0 ? USER_ROLES.ADMIN : USER_ROLES.USER;
      const password = await bcrypt.hash(`Password${i + 1}`, 10);

      await prisma.user.create({
        data: {
          email,
          password,
          role,
          firstname: `Имя${i + 1}`,
          lastname: `Фамилия${i + 1}`,
          phone: `${Math.floor(9000000000 + Math.random() * 9999999)}`,
        },
      });
      logToConsole(`Пользователь ${email} создан`, "info");
    }
  }

  // Создание 15 двигателей
  const engineCount = 15;
  for (let i = 0; i < engineCount; i++) {
    const name = `Engine${i + 1}`;
    const exists = await prisma.engine.findUnique({ where: { name } });

    if (!exists) {
      await prisma.engine.create({ data: { name } });
      logToConsole(`Двигатель ${name} создан`, "info");
    }
  }

  // Получение списка двигателей для товаров
  const engines = await prisma.engine.findMany();
  const engineNames = engines.map((e) => e.name);

  // Создание товаров
  const products = generateRandomProducts(63, engineNames);
  for (const product of products) {
    const exists = await prisma.product.findFirst({
      where: { article: product.article },
    });

    if (!exists) {
      const engine = await prisma.engine.findUnique({
        where: { name: product.engineName },
      });

      await prisma.product.create({
        data: {
          article: product.article,
          name: product.name,
          description: product.description,
          price: product.price,
          count: product.count,
          engineId: engine?.id,
          img: product.img,
        },
      });
      logToConsole(`Товар ${product.name} создан`, "info");
    }
  }

  // Создание 15 клиентов
  for (let i = 0; i < 15; i++) {
    const email = `client${i + 1}@example.com`;
    const exists = await prisma.customer.findUnique({ where: { email } });

    if (!exists) {
      await prisma.customer.create({
        data: {
          email,
          firstname: `Клиент${i + 1}`,
          lastname: `Фамилия${i + 1}`,
          phone: `${Math.floor(9000000000 + Math.random() * 9999999)}`,
        },
      });
      logToConsole(`Клиент ${email} создан`, "info");
    }
  }

  // Создание 15 заявок
  const allCustomers = await prisma.customer.findMany();
  const statuses = ["COMPLETED", "PROCESSING", "CANCELLED"];

  for (let i = 0; i < 15; i++) {
    const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    await prisma.order.create({
      data: {
        customerId: customer.id,
        status: status,
      },
    });
    logToConsole(`Заявка ${i + 1} создана для клиента ${customer.email}`, "info");
  }

  // Создание связей заявка-товар
  const allOrders = await prisma.order.findMany();
  const allProducts = await prisma.product.findMany();

  for (const order of allOrders) {
    const productsCount = Math.floor(Math.random() * 5) + 1; // 1-5 товаров на заявку
    const selectedProducts = new Set();

    while (selectedProducts.size < productsCount) {
      const product = allProducts[Math.floor(Math.random() * allProducts.length)];
      selectedProducts.add(product);
    }

    for (const product of selectedProducts) {
      const exists = await prisma.orderProduct.findUnique({
        where: {
          orderId_productId: {
            orderId: order.id,
            productId: product.id,
          },
        },
      });

      if (!exists) {
        await prisma.orderProduct.create({
          data: {
            orderId: order.id,
            productId: product.id,
            count: Math.floor(Math.random() * 5) + 1, // 1-5 штук
          },
        });
        logToConsole(`Связь заявки ${order.id} с товаром ${product.id} создана`, "info");
      }
    }
  }
}

main()
  .catch((e) => {
    logToConsole(e.message, "error");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
