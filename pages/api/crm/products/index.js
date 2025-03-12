// pages/api/products/index.js
import prisma from "@/lib/prisma";
import { validateProduct } from "@/lib/utils/validation";

export default async function handler(req, res) {
  try {
    // GET ALL PRODUCTS
    if (req.method === "GET") {
      const { page = 1, limit = 10, engineId, search, minPrice, maxPrice } = req.query;

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
        ].filter(Boolean),
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          include: { engine: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where }),
      ]);

      return res.status(200).json({
        data: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });

      // CREATE NEW PRODUCT
    } else if (req.method === "POST") {
      const validation = validateProduct(req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors });
      }

      // Check for existing article
      const existingProduct = await prisma.product.findUnique({
        where: { article: req.body.article },
      });

      if (existingProduct) {
        return res.status(409).json({ error: "Товар с таким артикулом уже существует" });
      }

      const productData = {
        ...req.body,
        price: parseFloat(req.body.price),
        count: parseInt(req.body.count),
        engineId: req.body.engineId ? parseInt(req.body.engineId) : null,
      };

      const newProduct = await prisma.product.create({
        data: productData,
        include: { engine: true },
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
