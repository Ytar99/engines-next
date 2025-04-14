// pages/api/products/index.js
import prisma from "@/lib/prisma";
import { validateProduct } from "@/lib/utils/validation";

export default async function handler(req, res) {
  try {
    // GET ALL PRODUCTS
    if (req.method === "GET") {
      const { page = 1, limit = 10, engineId, categoryId, search, minPrice, maxPrice } = req.query;

      const pageNum = Math.max(1, parseInt(page)) || 1;
      const limitNum = Math.min(100, Math.max(1, parseInt(limit))) || 10;

      const where = {
        AND: [
          {
            OR: search
              ? [
                  { name: { contains: search } },
                  { article: { contains: search } },
                  { description: { contains: search } },
                ]
              : undefined,
          },
          {
            price: {
              gte: minPrice ? parseFloat(minPrice) : undefined,
              lte: maxPrice ? parseFloat(maxPrice) : undefined,
            },
          },
          { engineId: engineId ? parseInt(engineId) : undefined },
          { categories: categoryId ? { some: { id: { equals: parseInt(categoryId) } } } : undefined },
        ].filter(Boolean),
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
          include: { engine: true, categories: true },
          orderBy: { createdAt: "desc" },
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

      // CREATE NEW PRODUCT
    } else if (req.method === "POST") {
      const validation = validateProduct(req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors });
      }

      const { categories, ...productBody } = req.body;
      const errors = [];

      // Проверка и обработка категорий
      let categoryConnections = [];
      if (categories) {
        if (!Array.isArray(categories)) {
          return res.status(400).json({ error: "Поле categories должно быть массивом" });
        }

        const categoryIds = categories.map((id) => parseInt(id));
        const invalidIds = categoryIds.filter((id) => isNaN(id));
        if (invalidIds.length > 0) {
          errors.push(`Некорректные ID категорий: ${invalidIds.join(", ")}`);
        }

        if (errors.length === 0 && categoryIds.length > 0) {
          const existingCategories = await prisma.category.findMany({
            where: { id: { in: categoryIds } },
          });
          const existingIds = existingCategories.map((c) => c.id);
          const missingIds = categoryIds.filter((id) => !existingIds.includes(id));
          if (missingIds.length > 0) {
            errors.push(`Категории не найдены: ${missingIds.join(", ")}`);
          } else {
            categoryConnections = categoryIds.map((id) => ({ id }));
          }
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({ error: errors.join("; ") });
      }

      // Check for existing article
      // const existingProduct = await prisma.product.findUnique({
      //   where: { article: req.body.article },
      // });

      // if (existingProduct) {
      //   return res.status(409).json({ error: "Товар с таким артикулом уже существует" });
      // }

      const productData = {
        ...productBody,
        price: parseFloat(productBody.price),
        count: parseInt(productBody.count),
        engineId: productBody.engineId ? parseInt(productBody.engineId) : null,
      };

      const newProduct = await prisma.product.create({
        data: {
          ...productData,
          categories: categoryConnections.length > 0 ? { connect: categoryConnections } : undefined,
        },
        include: { engine: true, categories: true },
      });

      return res.status(201).json({ data: newProduct });
    } else {
      return res.status(405).json({ error: "Метод не разрешен" });
    }
  } catch (error) {
    console.error("Products API error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
