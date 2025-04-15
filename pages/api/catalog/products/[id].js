// GET /api/catalog/products/{id} - Детали товара
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        engine: true,
        categories: { select: { id: true, name: true, slug: true } },
      },
    });

    return product ? res.status(200).json(product) : res.status(404).json({ error: "Product not found" });
  } catch (error) {
    console.error("Product details error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
