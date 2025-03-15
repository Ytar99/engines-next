// pages/api/engines/index.js
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { page = 1, limit = 10, search } = req.query;

      const pageNum = Math.max(1, parseInt(page)) || 1;
      const limitNum = Math.min(100, Math.max(1, parseInt(limit))) || 10;

      const where = {
        name: search ? { contains: search } : undefined,
      };

      const [engines, total] = await Promise.all([
        prisma.engine.findMany({
          where,
          skip: (page - 1) * limit,
          take: limitNum,
          include: { products: true },
          orderBy: { name: "asc" },
        }),
        prisma.engine.count({ where }),
      ]);

      return res.status(200).json({
        data: engines,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } else if (req.method === "POST") {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "Название обязательно" });

      const engine = await prisma.engine.create({
        data: { name },
      });
      return res.status(201).json({ data: engine });
    } else {
      return res.status(405).json({ error: "Метод не разрешен" });
    }
  } catch (error) {
    console.error("Engines API error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
