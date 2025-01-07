require("dotenv").config();

const { USER_ROLES } = require("@/app/_constants");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

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

async function main() {
  const hashedPassword = await bcrypt.hash(process.env.DB_ADMIN_PASSWORD, 10);

  const adminExists = await prisma.user.findUnique({
    where: {
      email: process.env.DB_ADMIN_EMAIL,
    },
  });

  if (!adminExists) {
    const adminUser = await prisma.user.create({
      data: {
        email: process.env.DB_ADMIN_EMAIL,
        password: hashedPassword,
        role: USER_ROLES.ADMIN,
      },
    });
    console.log("Запись Администратора создана:", adminUser);
  } else {
    logToConsole("Запись Администратора уже существует", "warn");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
