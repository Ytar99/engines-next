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

  return {
    getCart: () => session.cart || [],
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

export default async function handler(req, res) {
  try {
    const session = await getCartSession(req, res);
    const currentCart = await session.getCart();

    switch (req.method) {
      case "GET":
        return handleGetCart(currentCart, res);

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

// Обработчики методов
async function handleGetCart(cart, res) {
  return res.status(200).json(cart);
}

async function handleAddToCart(req, session, cart, res) {
  const productId = Number(req.body.productId);
  const quantity = Number(req.body.quantity || 1);

  if (!productId || typeof quantity !== "number" || quantity < 1) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, price: true, count: true },
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
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      addedAt: new Date().toISOString(),
    });
  }

  await session.saveCart(newCart);
  return res.status(200).json(newCart);
}

async function handleUpdateCart(req, session, cart, res) {
  const productId = Number(req.query.productId);
  const quantity = Number(req.body.quantity);

  if (!productId || typeof quantity !== "number" || quantity < 1) {
    return res.status(400).json({ error: "Invalid parameters" });
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

  const itemIndex = cart.findIndex((item) => item.productId === productId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Item not found in cart" });
  }

  const newCart = [...cart];
  newCart[itemIndex].quantity = quantity;

  await session.saveCart(newCart);
  return res.status(200).json(newCart);
}

async function handleRemoveFromCart(req, session, cart, res) {
  const productId = Number(req.query.productId);

  if (!productId) {
    return res.status(400).json({ error: "Product ID required" });
  }

  const newCart = cart.filter((item) => item.productId !== productId);
  await session.saveCart(newCart);

  return res.status(200).json(newCart);
}
