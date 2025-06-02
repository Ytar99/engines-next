import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(id) },
      });

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Просто обнуляем поле img в БД
      const updatedCategory = await prisma.category.update({
        where: { id: parseInt(id) },
        data: { img: null },
      });

      return res.status(200).json(updatedCategory);
    } catch (error) {
      console.error("Deletion error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
