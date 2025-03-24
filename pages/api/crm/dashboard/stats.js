// pages/api/crm/dashboard/stats.js
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    // Основные метрики
    const [totalOrders, totalCustomers, totalProducts] = await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.product.count(),
    ]);

    // Расчет общей выручки
    const allOrders = await prisma.order.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    let totalRevenue = 0;
    allOrders.forEach((order) => {
      const orderTotal = order.products.reduce((sum, item) => {
        return sum + item.product.price * item.count;
      }, 0);
      totalRevenue += orderTotal;
    });

    // Выручка за последние 7 дней
    const revenueLast7Days = await prisma.$queryRaw`
      SELECT 
        DATE(o.createdAt) as date,
        SUM(op.count * p.price) as amount
      FROM "Order" o
      JOIN OrderProduct op ON o.id = op.orderId
      JOIN Product p ON op.productId = p.id
      WHERE o.createdAt >= DATE('now', '-7 days')
      GROUP BY DATE(o.createdAt)
      ORDER BY date ASC
    `;

    res.status(200).json({
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      revenueLast7Days: revenueLast7Days.map((item) => ({
        date: item.date,
        amount: item.amount || 0,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
