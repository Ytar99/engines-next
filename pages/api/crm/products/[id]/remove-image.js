import prisma from "@/lib/prisma";
import path from "path";
import { unlink } from "fs/promises";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "DELETE") {
      // Получаем текущий товар
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
      });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Проверяем наличие изображения
      if (!product.img) {
        return res.status(400).json({ error: "No image to remove" });
      }

      // Удаляем файл изображения
      const filePath = path.join(process.cwd(), "public", product.img);
      try {
        await unlink(filePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("File deletion error:", error);
          return res.status(500).json({ error: "Failed to delete file" });
        }
      }

      // Обновляем запись в БД
      const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: { img: null },
      });

      return res.status(200).json(updatedProduct);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Remove product image error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
