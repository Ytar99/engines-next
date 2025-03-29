import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "POST") {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(id) },
        include: { products: true },
      });

      if (!category) return res.status(404).json({ error: "Категория не найдена" });

      // Используем транзакцию для массового обновления
      await prisma.$transaction(
        category.products.map((product) =>
          prisma.product.update({
            where: { id: product.id },
            data: {
              categories: {
                disconnect: { id: parseInt(id) },
              },
            },
          })
        )
      );

      return res.status(200).json({
        success: true,
        message: `Категория отвязана от ${category.products.length} продуктов`,
      });
    } else {
      return res.status(405).json({ error: "Метод не разрешен" });
    }
  } catch (error) {
    console.error("Unlink all error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
