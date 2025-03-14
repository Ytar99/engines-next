import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { validateEmail, validatePhone } from "@/lib/utils/validation";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    // GET USER
    if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          email: true,
          role: true,
          enabled: true,
          firstname: true,
          lastname: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user ? res.status(200).json({ data: user }) : res.status(404).json({ error: "Пользователь не найден" });
    }

    // UPDATE USER
    if (req.method === "PUT") {
      const existingUser = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingUser) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      const { email, password, ...rest } = req.body;
      const errors = [];

      // Валидация email
      if (email && email !== existingUser.email) {
        if (!validateEmail(email)) {
          errors.push("Неверный формат email");
        } else {
          const emailExists = await prisma.user.findUnique({ where: { email } });
          if (emailExists) {
            errors.push("Пользователь с таким email уже существует");
          }
        }
      }

      // Валидация телефона
      if (rest.phone && !validatePhone(rest.phone)) {
        errors.push("Неверный формат телефона");
      }

      if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
      }

      // Подготовка данных для обновления
      const updateData = { ...rest };
      if (email) updateData.email = email;

      // Хеширование пароля при наличии
      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }

      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData,
        select: {
          id: true,
          email: true,
          role: true,
          enabled: true,
          firstname: true,
          lastname: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.status(200).json({ data: updatedUser });
    }

    // DELETE USER
    if (req.method === "DELETE") {
      await prisma.user.delete({
        where: { id: parseInt(id) },
      });

      return res.status(204).end();
    }

    return res.status(405).json({ error: "Метод не разрешен" });
  } catch (error) {
    console.error("User API error:", error);

    // Обработка ошибок Prisma
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    return res.status(500).json({
      error: error.message || "Внутренняя ошибка сервера",
    });
  }
}
