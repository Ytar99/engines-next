import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(id) },
        include: { orders: true },
      });
      return customer ? res.json({ data: customer }) : res.status(404).json({ error: "Покупатель не найден" });
    } else if (req.method === "PUT") {
      const { email, ...data } = req.body;
      const existing = await prisma.customer.findUnique({ where: { id: parseInt(id) } });
      if (!existing) return res.status(404).json({ error: "Покупатель не найден" });

      if (email && email !== existing.email) {
        const emailExists = await prisma.customer.findUnique({ where: { email } });
        if (emailExists) return res.status(400).json({ error: "Покупатель с таким email уже существует" });
      }

      const updated = await prisma.customer.update({
        where: { id: parseInt(id) },
        data: { email, ...data },
      });
      return res.json({ data: updated });
    } else if (req.method === "DELETE") {
      await prisma.customer.delete({ where: { id: parseInt(id) } });
      return res.status(204).end();
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Customer API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
