import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

const validateEmail = (email) => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]{2,})*$/.test(email);
const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { page = 1, limit = 10, role, search, enabled } = req.query;

      const where = {
        enabled: enabled === "true" ? true : undefined,
        role: role || undefined,
        OR: search
          ? [{ email: { contains: search } }, { firstname: { contains: search } }, { lastname: { contains: search } }]
          : undefined,
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ]);

      return res.status(200).json({ users, total });
    }

    if (req.method === "DELETE") {
      const { userId } = req.query;

      try {
        const id = Number.parseInt(userId);

        if (Number.isNaN(id)) {
          throw new Error("Некорректный ID пользователя");
        }

        const user = await prisma.user.findUnique({
          where: { id },
        });

        if (!user) {
          return res.status(404).json({ message: "Пользователь не найден" });
        }

        await prisma.user.delete({
          where: { id: id },
        });

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error("Delete user error:", error);
        return res.status(500).json({ message: "Ошибка при удалении пользователя" });
      }
    }

    if (req.method === "POST") {
      const { email, password, role = "USER", enabled = true, firstname, lastname, phone } = req.body;

      // Валидация данных
      if (!email || !password) {
        return res.status(400).json({ message: "Заполните обязательные поля" });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Неверный формат email" });
      }

      if (phone && !validatePhone(phone)) {
        return res.status(400).json({ message: "Неверный формат телефона" });
      }

      // Проверка существующего пользователя
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ message: "Пользователь с таким email уже существует" });
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 12);

      // Создание пользователя
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          enabled,
          firstname,
          lastname,
          phone,
        },
      });

      return res.status(201).json(user);
    }

    return res.status(405).json({ error: "Метод недоступен" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      message: "Произошла ошибка на сервере",
    });
  }
}
