import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { validateEmail, validatePhone } from "@/lib/utils/validation";

export default async function handler(req, res) {
  try {
    // Обработка GET запроса
    if (req.method === "GET") {
      const { page = 1, limit = 10, role, search, enabled } = req.query;

      // Валидация параметров
      const pageNum = Math.max(1, parseInt(page)) || 1;
      const limitNum = Math.min(100, Math.max(1, parseInt(limit))) || 10;

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
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            role: true,
            enabled: true,
            firstname: true,
            lastname: true,
            phone: true,
            createdAt: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      return res.status(200).json({
        data: users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    // Обработка DELETE запроса
    if (req.method === "DELETE") {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "Не указан ID пользователя" });
      }

      const id = parseInt(userId);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Некорректный ID пользователя" });
      }

      try {
        const user = await prisma.user.delete({
          where: { id },
        });
        return res.status(204).end();
      } catch (error) {
        if (error.code === "P2025") {
          return res.status(404).json({ error: "Пользователь не найден" });
        }
        throw error;
      }
    }

    // Обработка POST запроса
    if (req.method === "POST") {
      const { email, password, role = "USER", enabled = true, firstname, lastname, phone } = req.body;

      // Валидация входных данных
      const errors = [];
      if (!email) errors.push("Email обязателен");
      if (!password) errors.push("Пароль обязателен");
      if (!validateEmail(email)) errors.push("Неверный формат email");
      if (!validatePhone(phone)) errors.push("Неверный формат телефона");

      if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
      }

      // Проверка уникальности email
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: "Пользователь с таким email уже существует" });
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 12);

      // Создание пользователя
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          enabled,
          firstname,
          lastname,
          phone,
        },
        select: {
          id: true,
          email: true,
          role: true,
          enabled: true,
          createdAt: true,
        },
      });

      return res.status(201).json({ data: newUser });
    }

    return res.status(405).json({ error: "Метод не поддерживается" });
  } catch (error) {
    console.error("Ошибка API:", error);
    return res.status(500).json({
      error: error.message || "Внутренняя ошибка сервера",
    });
  }
}
