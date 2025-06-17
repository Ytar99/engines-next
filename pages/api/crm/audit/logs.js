// unified-log-handler.js
import fs from "fs";
import path from "path";
import zlib from "zlib";

export default async function handler(req, res) {
  // Обработка POST запроса (запись лога)
  if (req.method === "POST") {
    const logSecret = req.headers["x-log-secret"];
    const validSecret = process.env.LOG_SECRET || "default-secret";

    if (logSecret !== validSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const logData = req.body;
      const logsDir = path.join(process.cwd(), "logs");

      // Создаем директорию для логов
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const logFilePath = path.join(logsDir, "audit.log");
      const logLine = JSON.stringify(logData) + "\n";

      // Асинхронно записываем в файл
      await fs.promises.appendFile(logFilePath, logLine);

      // Проверяем размер файла и ротируем при необходимости
      const stats = await fs.promises.stat(logFilePath);
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (stats.size > maxSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const newFileName = `audit-${timestamp}.log`;
        await fs.promises.rename(logFilePath, path.join(logsDir, newFileName));

        // Сжимаем старый файл для экономии места
        const compressedFileName = `${newFileName}.gz`;
        const gzip = zlib.createGzip();
        const input = fs.createReadStream(path.join(logsDir, newFileName));
        const output = fs.createWriteStream(path.join(logsDir, compressedFileName));

        await new Promise((resolve, reject) => {
          input
            .pipe(gzip)
            .pipe(output)
            .on("finish", () => {
              fs.unlinkSync(path.join(logsDir, newFileName));
              resolve();
            })
            .on("error", reject);
        });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error saving log:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  // Обработка GET запроса (чтение логов)
  else if (req.method === "GET") {
    try {
      const { method, status, userRole, access, search, dateFrom, dateTo, page = 0, limit = 10 } = req.query;

      const logsDir = path.join(process.cwd(), "logs");

      if (!fs.existsSync(logsDir)) {
        return res.status(200).json({ logs: [], total: 0 });
      }

      const files = fs
        .readdirSync(logsDir)
        .filter((file) => file.startsWith("audit") && (file.endsWith(".log") || file.endsWith(".gz")));

      let allLogs = [];

      for (const file of files) {
        const filePath = path.join(logsDir, file);
        let content;

        if (file.endsWith(".gz")) {
          const compressed = fs.readFileSync(filePath);
          content = zlib.gunzipSync(compressed).toString("utf-8");
        } else {
          content = fs.readFileSync(filePath, "utf-8");
        }

        content.split("\n").forEach((line) => {
          if (line.trim()) {
            try {
              const log = JSON.parse(line);

              // Фильтрация по датам
              const logDate = new Date(log.time);

              if (dateFrom && new Date(dateFrom) > logDate) return;
              if (dateTo && new Date(dateTo) < logDate) return;

              allLogs.push(log);
            } catch (e) {
              console.error("Error parsing log line:", line);
            }
          }
        });
      }

      // Сортировка по времени (новые сверху)
      allLogs.sort((a, b) => new Date(b.time) - new Date(a.time));

      // Применение фильтров
      const filteredLogs = allLogs.filter((log) => {
        if (method && log.method !== method) return false;
        if (status && log.status !== parseInt(status)) return false;
        if (userRole && log.user?.role !== userRole) return false;
        if (access && log.access !== access) return false;

        // Поиск по всем полям
        if (search) {
          const searchable = [
            log.method,
            log.path,
            log.status?.toString(),
            log.user?.id || "",
            log.user?.role || "",
            log.access,
            log.ip,
            new Date(log.time).toLocaleString(),
          ]
            .join(" ")
            .toLowerCase();

          if (!searchable.includes(search.toLowerCase())) {
            return false;
          }
        }

        return true;
      });

      // Пагинация
      const startIndex = parseInt(page) * parseInt(limit);
      const paginatedLogs = filteredLogs.slice(startIndex, startIndex + parseInt(limit));

      res.status(200).json({
        logs: paginatedLogs,
        total: filteredLogs.length,
      });
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      res.status(500).json({ error: "Failed to load audit logs" });
    }
  }
  // Обработка неподдерживаемых методов
  else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
