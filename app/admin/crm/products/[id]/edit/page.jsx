import React, { Suspense } from "react";
import Link from "next/link";

import prisma from "@/lib/prisma";
import ProductEditForm from "@/app/admin/_components/forms/ProductEditForm";

async function ProductEditPage({ params }) {
  const productId = (await params).id;

  const product = await prisma.product.findFirst({ where: { id: parseInt(productId) } });
  const engines = (await prisma.engine.findMany()) || [];

  return (
    <>
      <h1>Редактирование продукта</h1>

      <Suspense fallback={<div>Загрузка...</div>}>
        <ProductEditForm product={product} engines={engines} />
      </Suspense>

      <hr />
      <Link href="/admin/crm/products" className="btn">
        Вернуться
      </Link>
    </>
  );
}

export default ProductEditPage;
