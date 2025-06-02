import path from "path";
import fs from "fs";
import archiver from "archiver";
import { getDatabasePath } from "@/lib/utils/database";

export default async function handler(req, res) {
  try {
    // Пути к данным
    const dbPath = getDatabasePath();
    const imgCategoriesPath = path.join(process.cwd(), "public/images/categories");
    const imgProductsPath = path.join(process.cwd(), "public/images/products");

    // Проверка существования файлов
    if (!fs.existsSync(dbPath)) throw new Error("Database file not found");

    // Создание архива
    const archive = archiver("zip", {
      zlib: { level: 9 }, // максимальное сжатие
      forceLocalTime: true, // важный параметр для корректных заголовков
    });

    // Обработчики событий архива
    archive.on("warning", (err) => {
      if (err.code === "ENOENT") {
        console.warn("Archive warning:", err);
      } else {
        throw err;
      }
    });

    archive.on("error", (err) => {
      throw err;
    });

    // Устанавливаем заголовки ответа
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=backup.zip");

    // Подключаем архив к ответу
    archive.pipe(res);

    // Добавление БД в архив с явным указанием типа
    archive.file(dbPath, {
      name: "database.sqlite",
      store: true, // гарантирует сохранение без сжатия (лучше для бинарных)
    });

    // Добавление изображений
    if (fs.existsSync(imgCategoriesPath)) {
      archive.directory(imgCategoriesPath, "images/categories", {
        store: true, // без сжатия для изображений
      });
    }

    if (fs.existsSync(imgProductsPath)) {
      archive.directory(imgProductsPath, "images/products", {
        store: true, // без сжатия для изображений
      });
    }

    // Финализация архива
    await archive.finalize();
  } catch (error) {
    console.error("Backup error:", error);

    // Пытаемся отправить ошибку, если заголовки еще не отправлены
    if (!res.headersSent) {
      res.status(500).json({ error: "Backup failed: " + error.message });
    } else {
      // Если заголовки уже отправлены, просто завершаем соединение
      res.end();
    }
  }
}
