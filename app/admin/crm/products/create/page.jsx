import Link from "next/link";
import React, { Suspense } from "react";

import prisma from "@/lib/prisma";

import ProductCreateForm from "@/app/admin/_components/forms/ProductCreateForm";

async function ProductCreatePage() {
  const engines = (await prisma.engine.findMany()) || [];

  return (
    <>
      <h1>Создание нового продукта</h1>

      <Suspense fallback={<div>Загрузка...</div>}>
        <ProductCreateForm engines={engines} />
      </Suspense>

      <hr />
      <Link href="/admin/crm/products" className="btn">
        Вернуться
      </Link>
    </>
  );
}

export default ProductCreatePage;
