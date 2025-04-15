// GET /api/catalog/orders/{orderId} - Информация о заказе
export default async function handler(req, res) {
  const { orderId } = req.query;
  const { email } = req.query; // Для проверки владельца

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        customer: true,
        products: {
          include: { product: true },
        },
      },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.customer.email !== email) return res.status(403).json({ error: "Access denied" });

    const response = {
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      total: order.products.reduce((sum, p) => sum + p.product.price * p.count, 0),
      products: order.products.map((p) => ({
        id: p.product.id,
        name: p.product.name,
        price: p.product.price,
        quantity: p.count,
      })),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Order details error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
