import prisma from "@/lib/prisma";
import { validateCategory } from "@/lib/utils/validation";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Пагинация и поиск
      const { page = 1, limit = 10, search } = req.query;

      const pageNum = Math.max(1, parseInt(page)) || 1;
      const limitNum = Math.min(100, Math.max(1, parseInt(limit))) || 10;

      const where = {
        OR: [{ name: { contains: search } }, { slug: { contains: search } }],
      };

      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          where,
          include: { products: true },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
          orderBy: { name: "asc" },
        }),
        prisma.category.count({ where }),
      ]);

      return res.status(200).json({
        data: categories,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } else if (req.method === "POST") {
      // Создание категории
      const { name, slug } = req.body;

      const validation = await validateCategory(req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors });
      }

      // if (!name || !slug) {
      //   return res.status(400).json({ error: "Все поля обязательны" });
      // }

      // // Проверка уникальности slug
      // const exists = await prisma.category.findUnique({ where: { slug } });
      // if (exists) {
      //   return res.status(400).json({ error: "URL-адрес уже существует" });
      // }

      const category = await prisma.category.create({
        data: { name, slug },
      });

      return res.status(201).json({ data: category });
    } else {
      return res.status(405).json({ error: "Метод не разрешен" });
    }
  } catch (error) {
    console.error("Categories API error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
