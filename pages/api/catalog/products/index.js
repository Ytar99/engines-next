// GET /api/catalog/products - Поиск товаров
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { text, page = 1, limit = 25, sortBy = "name", sortOrder = "asc", engineId, minPrice, maxPrice } = req.query;

  try {
    const pageNum = parseInt(page);
    const limitNum = Math.min(100, parseInt(limit) || 25);
    const offset = (pageNum - 1) * limitNum;

    const where = {
      AND: [
        text
          ? {
              OR: [{ name: { contains: text } }, { article: { contains: text } }],
            }
          : {},
        engineId ? { engineId: parseInt(engineId) } : {},
        minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
        maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: offset,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          engine: true,
          categories: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return res.status(200).json({
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Product search error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
