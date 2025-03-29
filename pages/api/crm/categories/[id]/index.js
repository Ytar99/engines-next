import prisma from "@/lib/prisma";
import { validateCategory } from "@/lib/utils/validation";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      // Получение одной категории
      const category = await prisma.category.findUnique({
        where: { id: parseInt(id) },
        include: { products: true }, // Опционально: показать товары категории
      });

      return category
        ? res.status(200).json({ data: category })
        : res.status(404).json({ error: "Категория не найдена" });
    } else if (req.method === "PUT") {
      // Обновление категории
      const { name, slug } = req.body;

      const validation = await validateCategory({ name, slug }, parseInt(id));
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors });
      }

      // if (!name || !slug) {
      //   return res.status(400).json({ error: "Все поля обязательны" });
      // }

      // // Проверка уникальности нового slug
      // const exists = await prisma.category.findFirst({
      //   where: { slug, id: { not: parseInt(id) } },
      // });

      // if (exists) {
      //   return res.status(400).json({ error: "URL-адрес уже используется" });
      // }

      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: { name, slug },
      });

      return res.status(200).json({ data: category });
    } else if (req.method === "DELETE") {
      // Удаление категории (только если нет товаров)
      const category = await prisma.category.findUnique({
        where: { id: parseInt(id) },
        include: { products: true },
      });

      if (category.products.length > 0) {
        return res.status(400).json({
          error: "Нельзя удалить категорию с товарами",
        });
      }

      await prisma.category.delete({
        where: { id: parseInt(id) },
      });

      return res.status(204).end();
    } else {
      return res.status(405).json({ error: "Метод не разрешен" });
    }
  } catch (error) {
    console.error("Category API error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
