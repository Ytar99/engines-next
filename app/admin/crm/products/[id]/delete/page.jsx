import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";

import prisma from "@/lib/prisma";
import ProductDeleteForm from "@/app/admin/_components/forms/ProductDeleteForm";

async function ProductDeletePage({ params }) {
  const productId = (await params).id;

  if (!productId) {
    redirect("/admin/crm/products");
  }

  const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });

  if (!product) {
    return null;
  }

  return (
    <>
      <h1>Удаление продукта</h1>
      <br />
      <p>
        Вы действительно хотите удалить продукт [{product?.article}] {product?.name}?
      </p>

      <Suspense fallback={!product?.id}>
        <ProductDeleteForm productId={productId} />
      </Suspense>

      <hr />
      <Link href="/admin/crm/products" className="btn">
        Вернуться
      </Link>
    </>
  );
}

export default ProductDeletePage;
