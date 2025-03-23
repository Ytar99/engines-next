// pages/api/orders/index.js
import prisma from "@/lib/prisma";
import { validateOrder, validateOrderWithStock } from "@/lib/utils/validation";

export default async function handler(req, res) {
  try {
    // GET Orders list
    if (req.method === "GET") {
      const { page = 1, limit = 10, status, customerEmail, search, startDate, endDate } = req.query;

      // Валидация параметров
      const pageNum = Math.max(1, parseInt(page)) || 1;
      const limitNum = Math.min(100, Math.max(1, parseInt(limit))) || 10;
      const searchTerm = search?.trim();
      const searchId = searchTerm ? parseInt(searchTerm) : null;

      // Построение условий фильтрации
      const whereConditions = [];

      // Фильтр по статусу
      if (status) {
        whereConditions.push({ status });
      }

      // Фильтр по email клиента
      if (customerEmail) {
        whereConditions.push({
          customer: {
            email: {
              contains: customerEmail,
            },
          },
        });
      }

      // Поиск по ID заявки или email клиента
      if (searchTerm) {
        const searchFilters = [];

        if (!isNaN(searchId)) {
          searchFilters.push({ id: searchId });
        }

        searchFilters.push({
          customer: {
            email: {
              contains: searchTerm,
            },
          },
        });

        whereConditions.push({ OR: searchFilters });
      }

      // Фильтр по дате создания
      const dateFilter = {};
      const startDateObj = startDate ? new Date(startDate) : null;
      const endDateObj = endDate ? new Date(endDate) : null;

      if (startDateObj && !isNaN(startDateObj)) {
        dateFilter.gte = startDateObj;
      }
      if (endDateObj && !isNaN(endDateObj)) {
        dateFilter.lte = endDateObj;
      }

      if (Object.keys(dateFilter).length > 0) {
        whereConditions.push({ createdAt: dateFilter });
      }

      // Формируем итоговый WHERE-запрос
      const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

      // Запрос данных
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
          orderBy: { createdAt: "desc" },
          include: {
            customer: true,
            products: {
              include: {
                product: true,
              },
            },
          },
        }),
        prisma.order.count({ where }),
      ]);

      // Трансформация данных
      const transformedOrders = orders.map((order) => ({
        ...order,
        products: order.products.map((op) => ({
          ...op.product,
          quantity: op.count,
          orderProductId: `${op.orderId}_${op.productId}`,
        })),
        productsCount: order.products.reduce((acc, p) => acc + p.count, 0),
        total: order.products.reduce((acc, p) => acc + p.product.price * p.count, 0),
      }));

      res.status(200).json({
        data: transformedOrders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    // CREATE Order
    if (req.method === "POST") {
      const data = req.body;

      // Валидация базовой структуры
      const validation = validateOrder(data);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors });
      }

      // Проверка остатков
      const stockValidation = await validateOrderWithStock(data, prisma);
      if (!stockValidation.valid) {
        return res.status(400).json({ error: stockValidation.errors });
      }

      // Создание заявки в транзакции
      try {
        const newOrder = await prisma.$transaction(async (tx) => {
          // Создаем заявку с товарах
          const order = await tx.order.create({
            data: {
              customerId: data.customerId,
              status: data.status,
              products: {
                create: data.products.map((p) => ({
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

          // Обновляем остатки
          await Promise.all(
            data.products.map((item) =>
              tx.product.update({
                where: { id: item.productId },
                data: { count: { decrement: item.count } },
              })
            )
          );

          return order;
        });

        // Преобразование ответа
        const transformedOrder = {
          ...newOrder,
          products: newOrder.products.map((op) => ({
            ...op.product,
            quantity: op.count,
            orderId: op.orderId,
            productId: op.productId,
          })),
        };

        return res.status(201).json({ data: transformedOrder });
      } catch (transactionError) {
        console.error("Transaction error:", transactionError);
        throw transactionError;
      }
    }

    return res.status(405).json({ error: "Метод не поддерживается" });
  } catch (error) {
    console.error("Order API error:", error);

    // Обработка специфичных ошибок Prisma
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Конфликт уникальности" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Ресурс не найден" });
    }

    return res.status(500).json({
      error: error.message || "Внутренняя ошибка сервера",
    });
  }
}
