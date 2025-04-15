// GET /api/catalog/categories/{slug} - Конкретная категория
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { slug } = req.query;

  try {
    if (req.method === "GET") {
      const category = await prisma.category.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          slug: true,
          // description: true,
        },
      });

      return category ? res.status(200).json(category) : res.status(404).json({ error: "Category not found" });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Category details error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
