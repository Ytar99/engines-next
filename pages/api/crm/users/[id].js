import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { email, password, role, enabled, firstname, lastname, phone } = req.body;

      // Проверка на существование пользователя
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });

      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      const oldUser = await prisma.user.findUnique({
        where: { email: email },
      });

      if (oldUser && oldUser.id !== user.id) {
        return res.status(409).json({ message: "Пользователь с таким email уже существует" });
      }

      // Подготовка данных для обновления
      const updateData = {
        email,
        role,
        enabled,
        firstname,
        lastname,
        phone,
      };

      // Если передан пароль, хешируем его
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }

      // Обновление пользователя
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: `Ошибка сервера: ${error.toString()}` });
    }
  }

  {
    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
