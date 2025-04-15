// POST /api/cart/checkout - Оформить заказ
export default async function handler(req, res) {
  const { cart, customer } = req.body;

  try {
    // Валидация данных
    if (!cart?.length) return res.status(400).json({ error: "Cart is empty" });
    if (!customer?.email) return res.status(400).json({ error: "Email required" });

    // Проверка остатков
    const products = await prisma.product.findMany({
      where: { id: { in: cart.map((i) => i.productId) } },
      select: { id: true, count: true },
    });

    for (const item of cart) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return res.status(400).json({ error: `Product ${item.productId} not found` });
      if (product.count < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${item.productId}` });
      }
    }

    // Создание заказа в транзакции
    const order = await prisma.$transaction(async (tx) => {
      // Найти или создать клиента
      let customerRecord = await tx.customer.findUnique({
        where: { email: customer.email },
      });

      if (!customerRecord) {
        customerRecord = await tx.customer.create({
          data: {
            email: customer.email,
            firstname: customer.firstname,
            lastname: customer.lastname,
            phone: customer.phone,
          },
        });
      }

      // Создать заказ
      const newOrder = await tx.order.create({
        data: {
          customerId: customerRecord.id,
          status: "NEW",
          products: {
            create: cart.map((item) => ({
              productId: item.productId,
              count: item.quantity,
            })),
          },
        },
      });

      // Обновить остатки
      await Promise.all(
        cart.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { count: { decrement: item.quantity } },
          })
        )
      );

      return newOrder;
    });

    // Очистить корзину
    req.session.cart = [];
    await req.session.save();

    return res.status(201).json({ orderId: order.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
