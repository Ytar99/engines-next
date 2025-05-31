import { mkdirSync, createWriteStream } from "fs";
import { unlink } from "fs/promises";
import prisma from "@/lib/prisma";
import path from "path";

// Отключаем встроенный парсер Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public", "images", "categories");

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Получаем текущую категорию
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Если уже есть изображение - удаляем старый файл
    if (category.img) {
      const oldFilePath = path.join(process.cwd(), "public", category.img);
      try {
        await unlink(oldFilePath);
      } catch (error) {
        // Игнорируем ошибку "файл не найден"
        if (error.code !== "ENOENT") {
          console.error("Old image deletion error:", error);
        }
      }
    }

    // Создаем директорию если нужно
    mkdirSync(uploadDir, { recursive: true });

    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", resolve);
      req.on("error", reject);
    });

    const buffer = Buffer.concat(chunks);
    const boundary = req.headers["content-type"].split("=")[1];
    const payload = buffer.toString("latin1").split(boundary);

    // Парсинг multipart данных
    const filePart = payload.find((part) => part.includes('filename="'));
    if (!filePart) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Извлекаем имя файла
    const filenameMatch = filePart.match(/filename="([^"]+)"/);
    if (!filenameMatch) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    const filename = filenameMatch[1];
    const filePath = path.join(uploadDir, filename);

    // Извлекаем содержимое файла (игнорируем заголовки)
    const fileContent = filePart.split("\r\n\r\n")[1].replace(/\r\n$/, "");
    await createWriteStream(filePath).write(Buffer.from(fileContent, "latin1"));

    // Обновляем запись в БД
    const imagePath = `/images/categories/${filename}`;
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { img: imagePath },
    });

    return res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Image upload error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
