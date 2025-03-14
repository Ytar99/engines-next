// pages/api/engines/index.js
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const engines = await prisma.engine.findMany({
        orderBy: { name: "asc" },
      });
      return res.status(200).json({ data: engines });
    } else if (req.method === "POST") {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "Название обязательно" });

      const engine = await prisma.engine.create({
        data: { name },
      });
      return res.status(201).json({ data: engine });
    } else {
      return res.status(405).json({ error: "Метод не разрешен" });
    }
  } catch (error) {
    console.error("Engines API error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
