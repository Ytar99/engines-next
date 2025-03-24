import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        engine: true, // Включаем информацию о двигателе
      },
    });

    return res.status(200).json({ data: products });
  } catch (error) {
    console.error("Products API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
