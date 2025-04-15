// POST /api/cart - Добавить товар в корзину
export default async function handler(req, res) {
  const { productId, quantity } = req.body;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, price: true, count: true },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.count < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    const cartItem = {
      productId: product.id,
      quantity,
      price: product.price,
      addedAt: new Date(),
    };

    // Пример обновления сессии
    req.session.cart = [...(req.session.cart || []), cartItem];
    await req.session.save();

    return res.status(201).json(req.session.cart);
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
