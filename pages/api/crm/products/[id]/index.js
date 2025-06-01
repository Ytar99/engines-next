// pages/api/products/[id].js
import prisma from "@/lib/prisma";
import { validateProduct } from "@/lib/utils/validation";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    // GET SINGLE PRODUCT
    if (req.method === "GET") {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: { engine: true, categories: true },
      });

      return product ? res.status(200).json({ data: product }) : res.status(404).json({ error: "Товар не найден" });

      // UPDATE PRODUCT
    } else if (req.method === "PUT") {
      const existingProduct = await prisma.product.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingProduct) {
        return res.status(404).json({ error: "Товар не найден" });
      }

      const validation = validateProduct(req.body, true);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors });
      }

      const { categories, ...updateBody } = req.body;
      const errors = [];
      let categoryUpdates = {};

      // Обработка категорий
      if (categories !== undefined) {
        if (!Array.isArray(categories)) {
          return res.status(400).json({ error: "Поле categories должно быть массивом" });
        }

        const categoryIds = categories.map((id) => parseInt(id));
        const invalidIds = categoryIds.filter((id) => isNaN(id));
        if (invalidIds.length > 0) {
          errors.push(`Некорректные ID категорий: ${invalidIds.join(", ")}`);
        }

        if (errors.length === 0) {
          if (categoryIds.length > 0) {
            const existingCategories = await prisma.category.findMany({
              where: { id: { in: categoryIds } },
            });
            const existingIds = existingCategories.map((c) => c.id);
            const missingIds = categoryIds.filter((id) => !existingIds.includes(id));
            if (missingIds.length > 0) {
              errors.push(`Категории не найдены: ${missingIds.join(", ")}`);
            } else {
              categoryUpdates = { set: categoryIds.map((id) => ({ id })) };
            }
          } else {
            categoryUpdates = { set: [] }; // Удалить все категории
          }
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({ error: errors.join("; ") });
      }

      // Check for duplicate article
      // if (req.body.article && req.body.article !== existingProduct.article) {
      //   const duplicate = await prisma.product.findUnique({
      //     where: { article: req.body.article },
      //   });

      //   if (duplicate) {
      //     return res.status(409).json({ error: "Артикул уже используется" });
      //   }
      // }

      const updateData = {
        ...updateBody,
        price: "price" in updateBody ? parseFloat(updateBody.price) : undefined,
        count: "count" in updateBody ? parseInt(updateBody.count) : undefined,
        engineId: "engineId" in updateBody ? (updateBody.engineId ? parseInt(updateBody.engineId) : null) : undefined,
      };

      const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
          ...updateData,
          ...(Object.keys(categoryUpdates).length > 0 && { categories: categoryUpdates }),
        },
        include: { engine: true, categories: true },
      });

      return res.status(200).json({ data: updatedProduct });

      // DELETE PRODUCT
    } else if (req.method === "DELETE") {
      await prisma.product.delete({
        where: { id: parseInt(id) },
        include: { orderProducts: true },
      });

      return res.status(204).end();
    } else {
      return res.status(405).json({ error: "Метод не разрешен" });
    }
  } catch (error) {
    console.error("Product API error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Товар не найден" });
    }

    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
