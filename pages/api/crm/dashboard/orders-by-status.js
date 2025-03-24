// pages/api/crm/dashboard/orders-by-status.js
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });

    const result = ordersByStatus.map((item) => ({
      status: item.status,
      count: item._count,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
