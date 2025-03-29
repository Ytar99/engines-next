import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id, productId } = req.query;

  try {
    if (req.method === "POST") {
      const [category, product] = await Promise.all([
        prisma.category.findUnique({ where: { id: parseInt(id) } }),
        prisma.product.findUnique({ where: { id: parseInt(productId) } }),
      ]);

      if (!category || !product) {
        return res.status(404).json({ error: "Ресурс не найден" });
      }

      const updatedProduct = await prisma.product.update({
        where: { id: parseInt(productId) },
        data: {
          categories: {
            connect: { id: parseInt(id) },
          },
        },
      });

      return res.status(200).json(updatedProduct);
    }

    if (req.method === "DELETE") {
      // Проверяем существование категории и продукта
      const [category, product] = await Promise.all([
        prisma.category.findUnique({ where: { id: parseInt(id) } }),
        prisma.product.findUnique({
          where: { id: parseInt(productId) },
          include: { categories: true },
        }),
      ]);

      if (!category) return res.status(404).json({ error: "Категория не найдена" });
      if (!product) return res.status(404).json({ error: "Продукт не найден" });

      // Проверяем существование связи
      const isLinked = product.categories.some((c) => c.id === parseInt(id));
      if (!isLinked) {
        return res.status(400).json({ error: "Категория не привязана к продукту" });
      }

      // Отвязываем категорию
      await prisma.product.update({
        where: { id: parseInt(productId) },
        data: {
          categories: {
            disconnect: { id: parseInt(id) },
          },
        },
      });

      return res.status(204).end();
    }

    return res.status(405).json({ error: "Метод не разрешен" });
  } catch (error) {
    console.error("Unlink product error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
