// pages/api/engines/[id].js
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const engine = await prisma.engine.findUnique({
        where: { id: parseInt(id) },
      });
      return engine ? res.status(200).json({ data: engine }) : res.status(404).json({ error: "Двигатель не найден" });
    } else if (req.method === "PUT") {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "Название обязательно" });

      const engine = await prisma.engine.update({
        where: { id: parseInt(id) },
        data: { name },
      });
      return res.status(200).json({ data: engine });
    } else if (req.method === "DELETE") {
      await prisma.engine.delete({
        where: { id: parseInt(id) },
      });
      return res.status(204).end();
    } else {
      return res.status(405).json({ error: "Метод не разрешен" });
    }
  } catch (error) {
    console.error("Engine API error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
