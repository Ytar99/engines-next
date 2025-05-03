import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;
  const { email } = req.query;

  try {
    // Валидация параметров
    if (!id || !email) {
      return res.status(400).json({ error: "Необходимы ID заказа и email" });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: {
          select: {
            email: true,
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                article: true,
                name: true,
                description: true,
                price: true,
                img: true,
              },
            },
          },
        },
      },
    });

    // Проверка доступа
    if (!order || order.customer.email !== email) {
      return res.status(404).json({ error: "Заказ не найден" });
    }

    // Форматирование ответа
    const safeOrder = {
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      products: order.products.map((op) => ({
        quantity: op.count,
        product: {
          id: op.product.id,
          article: op.product.article,
          name: op.product.name,
          description: op.product.description,
          price: op.product.price,
          image: op.product.img,
        },
      })),
    };

    return res.status(200).json(safeOrder);
  } catch (error) {
    console.error("Order details error:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
}
