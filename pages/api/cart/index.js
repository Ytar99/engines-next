// pages/api/cart.js
import { sealData, unsealData } from "iron-session";
import prisma from "@/lib/prisma";

const sessionSecret = process.env.SESSION_SECRET;
const sessionOptions = {
  password: sessionSecret,
  ttl: 60 * 60 * 24 * 7, // 1 неделя
  cookieName: "cart_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

const getCartSession = async (req, res) => {
  const cookie = req.cookies[sessionOptions.cookieName];
  const session = cookie ? await unsealData(cookie, sessionOptions) : { cart: [] };

  // Нормализация структуры корзины
  const normalizedCart = (session.cart || [])
    .map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      addedAt: item.addedAt || new Date().toISOString(),
    }))
    .filter((item) => item.productId !== undefined && item.quantity !== undefined);

  return {
    getCart: () => normalizedCart,
    saveCart: async (newCart) => {
      const sealedData = await sealData({ cart: newCart }, sessionOptions);
      res.setHeader("Set-Cookie", [
        `${sessionOptions.cookieName}=${sealedData}; ` +
          `Path=/; ` +
          `Max-Age=${sessionOptions.ttl}; ` +
          `${sessionOptions.cookieOptions.secure ? "Secure; " : ""}` +
          `HttpOnly; ` +
          `SameSite=${sessionOptions.cookieOptions.sameSite}`,
      ]);
    },
    destroy: () => {
      res.setHeader("Set-Cookie", `${sessionOptions.cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
    },
  };
};

// Функция для получения полных данных корзины
async function getFullCartData(cart) {
  if (cart.length === 0) return [];

  const productIds = cart.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      price: true,
      count: true,
      img: true,
      article: true,
      description: true,
    },
  });

  return cart.reduce((result, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      result.push({
        ...item,
        name: product.name,
        price: product.price,
        availableCount: product.count,
        img: product.img,
        article: product.article,
        description: product.description,
      });
    }
    return result;
  }, []);
}

export default async function handler(req, res) {
  try {
    const session = await getCartSession(req, res);
    const currentCart = session.getCart();

    switch (req.method) {
      case "GET":
        return handleGetCart(session, currentCart, res);

      case "POST":
        return handleAddToCart(req, session, currentCart, res);

      case "PUT":
        return handleUpdateCart(req, session, currentCart, res);

      case "DELETE":
        return handleRemoveFromCart(req, session, currentCart, res);

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Cart API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGetCart(session, cart, res) {
  const fullCart = await getFullCartData(cart);

  // Фильтрация отсутствующих товаров
  const existingIds = fullCart.map((item) => item.productId);
  const cleanedCart = cart.filter((item) => existingIds.includes(item.productId));

  // Обновление сессии при наличии изменений
  if (cleanedCart.length !== cart.length) {
    await session.saveCart(cleanedCart);
  }

  return res.status(200).json(fullCart);
}

async function handleAddToCart(req, session, cart, res) {
  const productId = Number(req.body.productId);
  const quantity = Number(req.body.quantity || 1);

  if (!productId || isNaN(quantity) || quantity < 1) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { count: true },
  });

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (product.count < quantity) {
    return res.status(400).json({
      error: `Only ${product.count} items available in stock`,
    });
  }

  const existingItemIndex = cart.findIndex((item) => item.productId === productId);
  const newCart = [...cart];

  if (existingItemIndex > -1) {
    newCart[existingItemIndex].quantity += quantity;
  } else {
    newCart.push({
      productId,
      quantity,
      addedAt: new Date().toISOString(),
    });
  }

  await session.saveCart(newCart);
  const fullCart = await getFullCartData(newCart);
  return res.status(200).json(fullCart);
}

async function handleUpdateCart(req, session, cart, res) {
  const productId = Number(req.query.productId);
  const quantity = Number(req.body.quantity);

  if (!productId || isNaN(quantity) || quantity < 1) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { count: true },
  });

  if (!product) {
    // Удаляем отсутствующий товар из корзины
    const newCart = cart.filter((item) => item.productId !== productId);
    await session.saveCart(newCart);
    const fullCart = await getFullCartData(newCart);
    return res.status(404).json({
      error: "Product not found. Removed from cart.",
      cart: fullCart,
    });
  }

  if (product.count < quantity) {
    return res.status(400).json({
      error: `Only ${product.count} items available in stock`,
    });
  }

  const itemIndex = cart.findIndex((item) => item.productId === productId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Item not found in cart" });
  }

  const newCart = [...cart];
  newCart[itemIndex].quantity = quantity;

  await session.saveCart(newCart);
  const fullCart = await getFullCartData(newCart);
  return res.status(200).json(fullCart);
}

async function handleRemoveFromCart(req, session, cart, res) {
  const productId = Number(req.query.productId);

  if (!productId) {
    return res.status(400).json({ error: "Product ID required" });
  }

  const newCart = cart.filter((item) => item.productId !== productId);
  await session.saveCart(newCart);
  const fullCart = await getFullCartData(newCart);

  return res.status(200).json(fullCart);
}
