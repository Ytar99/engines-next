import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
      });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: { img: null },
      });

      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Deletion error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
