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
  let cleanupRequired = false;

  try {
    // Создаем временную директорию
    tmpDir = path.join(os.tmpdir(), "restore_" + uuidv4());
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
      if (entryPath.includes("..") || path.isAbsolute(entryPath) || entryPath !== "database.sqlite") {
        throw new Error(`Invalid file in archive: ${entryPath}`);
      }
    }

    zip.extractAllTo(tmpDir, true);

    // Путь к файлу БД
    const dbPath = getDatabasePath();
    const dbDir = path.dirname(dbPath);

    // Проверка наличия файла БД в архиве
    const dbFile = path.join(tmpDir, "database.sqlite");
    if (!fs.existsSync(dbFile)) {
      throw new Error("Database file missing in archive");
    }

    // Создаем бэкап текущей БД
    const backupPath = path.join(dbDir, `backup_${uuidv4()}.sqlite`);

    // Закрываем соединения с БД
    await closeDatabaseConnections();

    // Копируем текущую БД в бэкап
    fs.copyFileSync(dbPath, backupPath);

    // Заменяем текущую БД на восстановленную
    fs.copyFileSync(dbFile, dbPath);

    // Очистка временных файлов
    fs.rmSync(tmpDir, { recursive: true, force: true });
    cleanupRequired = false;

    res.status(200).json({
      message: "Restore completed successfully",
      backupPath: backupPath, // Для информации
    });
  } catch (error) {
    console.error("Restore error:", error);

    // Попытка восстановления из бэкапа
    try {
      const dbPath = getDatabasePath();
      if (fs.existsSync(backupPath)) {
        await closeDatabaseConnections();
        fs.copyFileSync(backupPath, dbPath);
        console.log("Database rollback successful");
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
