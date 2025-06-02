import prisma from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const form = formidable({});

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return res.status(500).json({ error: "Error parsing form" });
      }

      const file = files.image && files.image[0];
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      try {
        // Читаем файл в буфер
        const buffer = await fs.readFile(file.filepath);

        // Конвертируем в base64
        const base64String = `data:${file.mimetype || "image/jpeg"};base64,${buffer.toString("base64")}`;

        // Обновляем запись в БД
        const updatedProduct = await prisma.product.update({
          where: { id: parseInt(id) },
          data: { img: base64String },
        });

        // Удаляем временный файл
        await fs.unlink(file.filepath);

        return res.status(200).json(updatedProduct);
      } catch (error) {
        console.error("Upload processing error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    });
  } catch (error) {
    console.error("General error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
