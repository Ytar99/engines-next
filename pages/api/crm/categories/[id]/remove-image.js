import path from "path";
import { unlink } from "fs/promises";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "DELETE") {
      // Получаем текущую категорию
      const category = await prisma.category.findUnique({
        where: { id: parseInt(id) },
      });

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Проверяем наличие изображения
      if (!category.img) {
        return res.status(400).json({ error: "No image to remove" });
      }

      // Удаляем файл изображения
      const filePath = path.join(process.cwd(), "public", category.img);
      try {
        await unlink(filePath);
      } catch (error) {
        // Если файл не найден, продолжаем выполнение
        if (error.code !== "ENOENT") {
          console.error("File deletion error:", error);
          return res.status(500).json({ error: "Failed to delete file" });
        }
      }

      // Обновляем запись в БД
      const updatedCategory = await prisma.category.update({
        where: { id: parseInt(id) },
        data: { img: null },
      });

      return res.status(200).json(updatedCategory);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Remove image error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
