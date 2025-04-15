// pages/api/crm/customers/search.js
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email } = req.query;
    if (!email || email.length < 3) {
      return res.status(400).json({ error: "Минимум 3 символа для поиска" });
    }

    const customers = await prisma.customer.findMany({
      where: {
        email: { contains: email },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ data: customers });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
