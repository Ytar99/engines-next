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
        include: { engine: true },
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
        ...req.body,
        price: "price" in req.body ? parseFloat(req.body.price) : undefined,
        count: "count" in req.body ? parseInt(req.body.count) : undefined,
        engineId: "engineId" in req.body ? (req.body.engineId ? parseInt(req.body.engineId) : null) : undefined,
      };

      const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: { engine: true },
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
