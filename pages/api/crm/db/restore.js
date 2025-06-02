import path from "path";
import fs from "fs";
import os from "os";
import AdmZip from "adm-zip";
import { closeDatabaseConnections, getDatabasePath } from "@/lib/utils/database";
import { v4 as uuidv4 } from "uuid";
import busboy from "busboy";

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let tmpDir = "";
  let backupDir = "";
  let cleanupRequired = false;

  try {
    // Создаем временную директорию ВНУТРИ проекта
    tmpDir = path.join(process.cwd(), "tmp_restore_" + uuidv4());
    fs.mkdirSync(tmpDir, { recursive: true });
    cleanupRequired = true;

    const tmpZipPath = path.join(tmpDir, "upload.zip");

    // Обработка multipart/form-data
    const bb = busboy({
      headers: req.headers,
      limits: { fileSize: MAX_FILE_SIZE },
    });

    let fileReceived = false;
    const writeStream = fs.createWriteStream(tmpZipPath);

    // Обработка файла из формы
    bb.on("file", (name, file, info) => {
      fileReceived = true;
      file.pipe(writeStream);
    });

    bb.on("error", (err) => {
      writeStream.destroy();
      throw err;
    });

    bb.on("close", () => {
      if (!fileReceived) {
        writeStream.destroy();
        throw new Error("No file uploaded");
      }
      writeStream.end();
    });

    req.pipe(bb);

    // Ждем завершения записи файла
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
      bb.on("error", reject);
    });

    // Проверка сигнатуры ZIP
    const buffer = Buffer.alloc(4);
    const fd = fs.openSync(tmpZipPath, "r");
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);

    const signature = buffer.toString("hex");
    const validSignatures = new Set([
      "504b0304", // Standard ZIP
      "504b0506", // Empty archive
      "504b0708", // Spanned archive
    ]);

    if (!validSignatures.has(signature)) {
      throw new Error("Invalid ZIP file format");
    }

    // Распаковка архива
    const zip = new AdmZip(tmpZipPath);
    const zipEntries = zip.getEntries();

    // Проверка безопасности путей
    for (const entry of zipEntries) {
      const entryPath = entry.entryName;
      if (
        entryPath.includes("..") ||
        path.isAbsolute(entryPath) ||
        (!entryPath.startsWith("images/") && entryPath !== "database.sqlite")
      ) {
        throw new Error(`Invalid file path in archive: ${entryPath}`);
      }
    }

    zip.extractAllTo(tmpDir, true);

    // Пути к файлам
    const dbPath = getDatabasePath();
    const dbDir = path.dirname(dbPath);
    const imgDir = path.join(process.cwd(), "public/images");

    // Проверка наличия файла БД
    const dbFile = path.join(tmpDir, "database.sqlite");
    if (!fs.existsSync(dbFile)) {
      throw new Error("Database file missing in archive");
    }

    // Создаем бэкап для отката В ТОЙ ЖЕ ДИРЕКТОРИИ
    backupDir = path.join(dbDir, `backup_${uuidv4()}`);
    fs.mkdirSync(backupDir, { recursive: true });
    const dbBackupPath = path.join(backupDir, "database.sqlite");

    // Закрываем соединения с БД
    await closeDatabaseConnections();

    // Копируем текущую БД в бэкап
    fs.copyFileSync(dbPath, dbBackupPath);

    // Прямое копирование новой БД (без переименования)
    fs.copyFileSync(dbFile, dbPath);

    // Функция безопасного восстановления директорий
    const safeRestoreDir = (srcDir, destDir) => {
      if (!fs.existsSync(srcDir)) return;

      // Создаем бэкап оригинальной директории
      const backupPath = path.join(backupDir, path.basename(destDir));
      if (fs.existsSync(destDir)) {
        fs.cpSync(destDir, backupPath, { recursive: true });
      }

      // Прямая замена содержимого
      fs.rmSync(destDir, { recursive: true, force: true });
      fs.cpSync(srcDir, destDir, { recursive: true });
    };

    // Восстановление изображений
    safeRestoreDir(path.join(tmpDir, "images/categories"), path.join(imgDir, "categories"));

    safeRestoreDir(path.join(tmpDir, "images/products"), path.join(imgDir, "products"));

    // Очистка временных файлов
    fs.rmSync(tmpDir, { recursive: true, force: true });
    cleanupRequired = false;

    // Оставляем бэкап на случай если понадобится ручной откат
    console.log(`Backup kept at: ${backupDir}`);

    res.status(200).json({
      message: "Restore completed successfully",
      backupPath: backupDir, // Для информации
    });
  } catch (error) {
    console.error("Restore error:", error);

    // Попытка восстановления из бэкапа
    try {
      if (backupDir && fs.existsSync(backupDir)) {
        const dbBackupPath = path.join(backupDir, "database.sqlite");
        if (fs.existsSync(dbBackupPath)) {
          await closeDatabaseConnections();

          // Прямое копирование бэкапа поверх основной БД
          fs.copyFileSync(dbBackupPath, getDatabasePath());

          console.log("Database rollback successful");
        }
      }
    } catch (rollbackError) {
      console.error("Database rollback failed:", rollbackError);
    }

    // Очистка временных файлов
    if (cleanupRequired && tmpDir && fs.existsSync(tmpDir)) {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }
    }

    // Безопасный ответ об ошибке
    const errorResponse = {
      error: "Restore failed",
      message: error.message,
    };

    if (process.env.NODE_ENV === "development") {
      errorResponse.details = error.stack;
    }

    res.status(500).json(errorResponse);
  }
}
