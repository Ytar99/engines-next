import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { page = 1, limit = 10, search } = req.query;
      const pageNum = Math.max(1, parseInt(page)) || 1;
      const limitNum = Math.min(100, parseInt(limit) || 10);

      const where = {
        OR: [
          { email: { contains: search } },
          { firstname: { contains: search } },
          { lastname: { contains: search } },
          { phone: { contains: search } },
        ],
      };

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
          orderBy: { createdAt: "desc" },
        }),
        prisma.customer.count({ where }),
      ]);

      return res.json({
        data: customers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } else if (req.method === "POST") {
      const { email, firstname, lastname, phone } = req.body;
      if (!email) return res.status(400).json({ error: "Email обязателен" });

      const existing = await prisma.customer.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ error: "Email уже существует" });

      const customer = await prisma.customer.create({
        data: { email, firstname, lastname, phone },
      });

      return res.status(201).json({ data: customer });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Customers API error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
