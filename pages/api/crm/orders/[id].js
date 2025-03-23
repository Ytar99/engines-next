// pages/api/orders/[id].js
import prisma from "@/lib/prisma";
import { validateOrderStatus } from "@/lib/utils/validation";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    // GET Order
    if (req.method === "GET") {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              firstname: true,
              lastname: true,
            },
          },
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  article: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      if (!order) return res.status(404).json({ error: "Заявка не найдена" });

      // Transform products data
      const transformedProducts = order.products.map((op) => ({
        productId: op.productId,
        article: op.product.article,
        name: op.product.name,
        price: op.product.price,
        count: op.count,
      }));

      return res.status(200).json({
        data: {
          ...order,
          products: transformedProducts,
        },
      });
    }

    // UPDATE Order
    if (req.method === "PUT") {
      const existingOrder = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: { products: true },
      });

      if (!existingOrder) {
        return res.status(404).json({ error: "Заявка не найдена" });
      }

      const data = req.body;
      const { customerId, status, products } = data;

      // Валидация базовой структуры
      const validation = validateOrder(data);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors });
      }

      // Check customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) return res.status(400).json({ error: "Покупатель не найден" });

      // Check products availability
      for (const item of products) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) return res.status(400).json({ error: `Товар ${item.productId} не найден` });
        if (product.count < item.count) {
          return res.status(400).json({
            error: `Недостаточно товара ${product.name} (остаток: ${product.count})`,
          });
        }
      }

      // Transaction for order update
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Update order
        const order = await tx.order.update({
          where: { id: parseInt(id) },
          data: {
            customerId,
            status,
            products: {
              deleteMany: {},
              create: products.map((p) => ({
                productId: p.productId,
                count: p.count,
              })),
            },
          },
          include: {
            products: {
              include: {
                product: true,
              },
            },
          },
        });

        // Update product stock
        for (const item of products) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              count: {
                decrement: item.count,
              },
            },
          });
        }

        return order;
      });

      return res.status(200).json({ data: updatedOrder });
    }

    // DELETE Order
    if (req.method === "DELETE") {
      await prisma.order.delete({
        where: { id: parseInt(id) },
      });
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Метод не разрешен" });
  } catch (error) {
    console.error("Order API error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Заявка не найдена" });
    }

    return res.status(500).json({
      error: error.message || "Внутренняя ошибка сервера",
    });
  }
}
