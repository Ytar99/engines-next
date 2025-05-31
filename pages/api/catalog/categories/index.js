// Категории
// GET /api/catalog/categories - Все категории (для главной)
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          img: true,
          // description: true,
          _count: { select: { products: true } },
        },
      });
      return res.status(200).json(categories);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Catalog categories error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
