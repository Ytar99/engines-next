import prisma from "@/lib/prisma";
import path from "path";
import { unlink } from "fs/promises";
import { mkdirSync, createWriteStream } from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public", "images", "products");

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Проверяем существование товара
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Создаем директорию если нужно
    mkdirSync(uploadDir, { recursive: true });

    // Если уже есть изображение - удаляем старый файл
    if (product.img) {
      const oldFilePath = path.join(process.cwd(), "public", product.img);
      try {
        await unlink(oldFilePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("Old image deletion error:", error);
        }
      }
    }

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

    // Генерируем уникальное имя файла
    const filename = filenameMatch[1];
    const filePath = path.join(uploadDir, filename);

    // Сохраняем файл
    const fileContent = filePart.split("\r\n\r\n")[1].replace(/\r\n$/, "");
    await createWriteStream(filePath).write(Buffer.from(fileContent, "latin1"));

    // Обновляем запись в БД
    const imagePath = `/images/products/${filename}`;
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { img: imagePath },
    });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Product image upload error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
