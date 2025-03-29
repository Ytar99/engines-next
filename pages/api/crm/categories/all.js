// Получение всех категорий без пагинации
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });
      return res.status(200).json({ data: categories });
    } else {
      return res.status(405).json({ error: "Метод не разрешен" });
    }
  } catch (error) {
    console.error("Categories API error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
