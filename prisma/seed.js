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
      result += "[\u001b[36m" + "Ошибка" + "\u001b[0m]: ";
      break;

    case "warn":
      result += "[\u001b[33m" + "Ошибка" + "\u001b[0m]: ";
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

function generateRandomProducts(N) {
  const products = [];
  const engines = ["2_8", "3_8", "BT", "ISBe"]; // Пример названий двигателей

  for (let i = 0; i < N; i++) {
    const article = (3927063 + i).toString(); // Уникальный артикул
    const name = `Товар ${i + 1}`; // Название товара
    const description = `Описание товара ${i + 1}`; // Описание товара
    const price = parseFloat((Math.random() * 500).toFixed(2)); // Случайная цена от 0 до 500
    const count = Math.floor(Math.random() * 100); // Случайное количество от 0 до 99
    const engineId = Math.floor(Math.random() * engines.length); // Случайный id двигателя
    const img = `https://example.com/images/product_${i + 1}.jpg`; // Путь к изображению товара

    const product = {
      article,
      name,
      description,
      price,
      count,
      engineName: engines[engineId],
      img,
    };
    products.push(product);
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
    console.log("Администратор создан");
  } else {
    logToConsole("Администратор уже существует", "warn");
  }

  // Создание двигателей
  const engines = [{ name: "2_8" }, { name: "BT" }, { name: "3_8" }, { name: "ISBe" }];

  for (const engine of engines) {
    const exists = await prisma.engine.findUnique({
      where: { name: engine.name },
    });
    if (!exists) {
      await prisma.engine.create({ data: engine });
      console.log(`Двигатель ${engine.name} создан`);
    }
  }

  // Создание товаров
  const products = generateRandomProducts(63);

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
        },
      });
      console.log(`Товар ${product.name} создан`);
    }
  }

  // Создание клиентов
  const customers = [
    {
      email: "client1@example.com",
      firstname: "Иван",
      lastname: "Иванов",
      phone: "9001112233",
    },
    {
      email: "client2@example.com",
      firstname: "Петр",
      lastname: "Петров",
      phone: "9004445566",
    },
  ];

  for (const customer of customers) {
    const exists = await prisma.customer.findUnique({
      where: { email: customer.email },
    });

    if (!exists) {
      await prisma.customer.create({ data: customer });
      console.log(`Клиент ${customer.email} создан`);
    }
  }

  // Создание заявок
  const allCustomers = await prisma.customer.findMany();
  const statuses = ["Completed", "Processing", "Cancelled"];

  const orders = [
    { customerId: allCustomers[0].id, status: "Processing" },
    { customerId: allCustomers[1].id, status: "Completed" },
    { customerId: allCustomers[1].id, status: "Cancelled" },
  ];

  for (const order of orders) {
    const exists = await prisma.order.findFirst({
      where: {
        customerId: order.customerId,
        status: order.status,
      },
    });

    if (!exists) {
      await prisma.order.create({ data: order });
      console.log(`Заявка для клиента ${order.customerId} создана`);
    }
  }

  // Создание связей заявка-товар
  const allOrders = await prisma.order.findMany();
  const allProducts = await prisma.product.findMany();

  for (const order of allOrders) {
    const productsToConnect = allProducts.slice(0, 2); // Берем первые 2 товара

    for (const product of productsToConnect) {
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
            count: Math.floor(Math.random() * 5) + 1,
          },
        });
        console.log(`Связь заявки ${order.id} с товаром ${product.id} создана`);
      }
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
