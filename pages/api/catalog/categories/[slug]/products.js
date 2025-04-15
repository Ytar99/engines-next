// GET /api/catalog/categories/{slug}/products - Товары категории с фильтрами
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { slug } = req.query;
  const {
    page = 1,
    limit = 20,
    sortBy = "name",
    sortOrder = "asc",
    engineId,
    original, // Будет добавлено позже
  } = req.query;

  try {
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) return res.status(404).json({ error: "Category not found" });

    const pageNum = parseInt(page);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    const where = {
      categories: { some: { id: category.id } },
      engineId: engineId ? parseInt(engineId) : undefined,
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
    console.error("Category products error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
