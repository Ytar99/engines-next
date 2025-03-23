import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { id } = req.query;

    // Проверка валидности ID
    if (isNaN(id)) {
      return res.status(400).json({ error: "Некорректный идентификатор покупателя" });
    }

    const customerId = Number(id);

    // Проверка существования покупателя
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: "Покупатель не найден" });
    }

    // Получение заявок с расширенной информацией о товарах
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ data: orders });
  } catch (error) {
    console.error("Customer orders API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
