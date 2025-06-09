require("dotenv").config();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { createCanvas } = require("canvas");

function generateRandomImage() {
  const width = 300;
  const height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Генерация случайного цвета RGB
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  // Заливка холста случайным цветом
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, width, height);

  // Конвертация в JPEG и кодирование в base64
  const buffer = canvas.toBuffer("image/jpeg");
  const base64 = buffer.toString("base64");

  return `data:image/jpeg;base64,${base64}`;
}

const USER_ROLES = Object.freeze({
  ADMIN: "ADMIN",
  USER: "USER",
});

const prisma = new PrismaClient();

function logToConsole(text = "", type = "info") {
  const colors = { info: "\x1b[36m", warn: "\x1b[33m", error: "\x1b[31m" };
  const prefix = colors[type] ? `[${colors[type]}${type.toUpperCase()}\x1b[0m]: ` : "[LOG]: ";
  console.log(prefix + text);
}

// Реалистичные данные для генерации
const FIRST_NAMES = ["Александр", "Иван", "Сергей", "Андрей", "Дмитрий", "Максим", "Евгений"];
const LAST_NAMES = ["Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов", "Васильев"];
const ENGINE_NAMES = ["4ISBe", "6ISBe", "QSK45", "Cummins X15", "MTU 2000", "4BT", "6BT", "ISF3.8", "ISF2.8", "QSB6.7"];
const CATEGORIES = [
  { name: "Все товары", slug: "all" },
  { name: "Болты", slug: "bolty" },
  { name: "Вкладыши", slug: "vkladyshi" },
  { name: "Датчики", slug: "datchiki" },
  { name: "Гильзы", slug: "gilzy" },
  { name: "Прокладки", slug: "prokladki" },
  { name: "Турбины", slug: "turbiny" },
  { name: "Фильтры", slug: "filtry" },
  { name: "Форсунки", slug: "forsunki" },
  { name: "Поршни", slug: "porshni" },
  { name: "Компрессоры", slug: "kompressory" },
  { name: "ТНВД", slug: "tnvd" },
  { name: "Ремни", slug: "remni" },
  { name: "Шпильки", slug: "shpilki" },
  { name: "Термостаты", slug: "termostaty" },
  { name: "Клапаны", slug: "klapany" },
  { name: "Маслоохладители", slug: "maslohladiteli" },
  { name: "Трубки", slug: "trubki" },
  { name: "Сальники", slug: "salniki" },
  { name: "Шатуны", slug: "shatuny" },
  { name: "Шестерни", slug: "shesterni" },
  { name: "ГБЦ", slug: "gbc" },
  { name: "Оригинальные запчасти", slug: "original" },
];

const PRODUCT_TEMPLATES = [
  // Для ISBe
  { article: "3927063", name: "Болт ГБЦ M12х1.75х130", price: 200, categories: ["bolty", "gbc"], engine: "6ISBe" },
  { article: "4891179", name: "Болт шатуна", price: 150, categories: ["bolty"], engine: "4ISBe" },
  {
    article: "4929827",
    name: "Венец маховика 149 зубьев 6ISBe",
    price: 3000,
    categories: ["shesterni"],
    engine: "6ISBe",
  },
  {
    article: "4955745",
    name: "Вкладыши коренные (комплект)",
    price: 3600,
    categories: ["vkladyshi"],
    engine: "Cummins X15",
  },
  { article: "4955521", name: "Вкладыши коренные (комплект)", price: 4000, categories: ["vkladyshi"], engine: "6ISBe" },

  // Для BT
  {
    article: "3920779",
    name: "Болт M12x1.75x70 ГБЦ 4BT, 6BT",
    price: 200,
    categories: ["bolty", "gbc"],
    engine: "4BT",
  },
  {
    article: "3802010",
    name: "Вкладыш коленвала коренной (комплект)",
    price: 3400,
    categories: ["vkladyshi"],
    engine: "6BT",
  },
  { article: "4938600", name: "Генератор", price: 12500, categories: ["electrika"], engine: "4BT" },

  // Для 3.8
  {
    article: "4940194",
    name: "Болт M12x1.75x150 ГБЦ ISF3.8",
    price: 200,
    categories: ["bolty", "gbc"],
    engine: "ISF3.8",
  },
  {
    article: "5263830",
    name: "Генератор ISF3.8 (24V, 110A)",
    price: 19000,
    categories: ["electrika"],
    engine: "ISF3.8",
  },

  // Для 2.8
  {
    article: "5257728",
    name: "Болт M14x1.50x140 ГБЦ ISF2.8",
    price: 220,
    categories: ["bolty", "gbc"],
    engine: "ISF2.8",
  },
  { article: "5318121", name: "Генератор ISF2.8 12V 120A", price: 12000, categories: ["electrika"], engine: "ISF2.8" },

  // Оригинальные запчасти
  {
    article: "4076930-ORIG",
    name: "Датчик масла (ОРИГИНАЛ)",
    price: 1250,
    categories: ["datchiki", "original"],
    engine: "6ISBe",
  },
  {
    article: "4921684-ORIG",
    name: "Датчик положения распредвала (ОРИГИНАЛ)",
    price: 2500,
    categories: ["datchiki", "original"],
    engine: "4ISBe",
  },
];

PRODUCT_TEMPLATES.forEach((template) => {
  template.categories.unshift("all");
});

const ORDER_STATUS = ["NEW", "PROCESSING", "COMPLETED", "CANCELLED", "SHIPPED"];

async function main() {
  // Администратор
  const adminData = {
    email: process.env.DB_ADMIN_EMAIL,
    password: await bcrypt.hash(process.env.DB_ADMIN_PASSWORD, 10),
    role: USER_ROLES.ADMIN,
    firstname: "Админ",
    lastname: "Системный",
    phone: "79001234567",
  };

  if (!(await prisma.user.findUnique({ where: { email: adminData.email } }))) {
    await prisma.user.create({ data: adminData });
    logToConsole("Администратор создан", "info");
  }

  // Категории
  for (const { name, slug } of CATEGORIES) {
    if (!(await prisma.category.findUnique({ where: { slug } }))) {
      await prisma.category.create({
        data: {
          name,
          slug,
          // img: generateRandomImage()
        },
      });
      logToConsole(`Категория "${name}" создана`);
    }
  }

  // Двигатели
  for (const name of ENGINE_NAMES) {
    if (!(await prisma.engine.findUnique({ where: { name } }))) {
      await prisma.engine.create({ data: { name } });
      logToConsole(`Двигатель "${name}" создан`);
    }
  }

  // Пользователи
  for (let i = 0; i < 15; i++) {
    const email = `user${i + 1}@example.com`;
    if (await prisma.user.findUnique({ where: { email } })) continue;

    await prisma.user.create({
      data: {
        email,
        role: i === 0 ? USER_ROLES.ADMIN : USER_ROLES.USER,
        password: await bcrypt.hash(`Password${i + 1}`, 10),
        firstname: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)],
        lastname: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)],
        phone: `79${Math.random().toString().slice(2, 10)}`,
      },
    });
    logToConsole(`Пользователь ${email} создан`);
  }

  // Товары
  for (const template of PRODUCT_TEMPLATES) {
    if (await prisma.product.findFirst({ where: { article: template.article } })) continue;

    const categories = await prisma.category.findMany({
      where: { slug: { in: template.categories } },
    });

    await prisma.product.create({
      data: {
        article: template.article,
        name: template.name,
        price: template.price,
        count: Math.floor(Math.random() * 100),
        // img: generateRandomImage(),
        categories: { connect: categories.map((c) => ({ id: c.id })) },
        engine: template.engine
          ? {
              connect: { name: template.engine },
            }
          : undefined,
      },
    });
    logToConsole(`Товар "${template.name}" создан`);
  }

  // Клиенты
  for (let i = 0; i < 15; i++) {
    const email = `client${i + 1}@example.com`;
    if (await prisma.customer.findUnique({ where: { email } })) continue;

    await prisma.customer.create({
      data: {
        email,
        firstname: `Клиент_${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]}`,
        lastname: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)],
        phone: `79${Math.random().toString().slice(2, 10)}`,
      },
    });
    logToConsole(`Клиент ${email} создан`);
  }

  // Заявки
  const customers = await prisma.customer.findMany();

  for (let i = 0; i < 15; i++) {
    const order = await prisma.order.create({
      data: {
        customerId: customers[Math.floor(Math.random() * customers.length)].id,
        status: ORDER_STATUS[Math.floor(Math.random() * ORDER_STATUS.length)],
      },
    });
    logToConsole(`Заявка #${order.id} создана`);
  }

  // Связи заявок с товарами
  const orders = await prisma.order.findMany();
  const products = await prisma.product.findMany();

  for (const order of orders) {
    const selectedProducts = new Set();
    const count = Math.floor(Math.random() * 5) + 1;

    while (selectedProducts.size < count) {
      selectedProducts.add(products[Math.floor(Math.random() * products.length)]);
    }

    for (const product of selectedProducts) {
      try {
        await prisma.orderProduct.create({
          data: {
            orderId: order.id,
            productId: product.id,
            count: Math.floor(Math.random() * 5) + 1,
          },
        });
      } catch (e) {
        logToConsole("Ошибка при добавлении товара в заявку", "error");
      }
    }
    logToConsole(`Добавлено ${count} товаров в заявку #${order.id}`);
  }
}

main()
  .catch((e) => logToConsole(e.message, "error"))
  .finally(() => prisma.$disconnect());
