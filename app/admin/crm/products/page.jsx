import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import React from "react";

async function ProductsPage() {
  const products = await prisma.product.findMany();
  const engines = (await prisma.engine.findMany()) || [];

  const enginesObj = engines.reduce((acc, engine) => {
    acc[engine.id] = engine.name;
    return acc;
  }, {});

  return (
    <>
      <h1>Продукты</h1>
      <section className="actions-section">
        <div className="section-col">
          <Link href="/admin/crm/products/create" className="btn">
            Добавить продукт
          </Link>
        </div>
        <div className="section-col"></div>
      </section>
      <table>
        <thead>
          <tr>
            <th>Картинка</th>
            <th>Артикул</th>
            <th>Название</th>
            <th>Описание</th>
            <th>Двигатель</th>
            <th>Цена</th>
            <th>Количество</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {products?.length ? (
            products?.map((product) => (
              <tr key={`product-row-${product["id"]}`}>
                <td>
                  <Image
                    alt={`Превью продукта ${product["id"]}`}
                    width={50}
                    height={50}
                    src={product["img"] || "/assets/no-image.png"}
                  />
                </td>
                <td>{product["article"]}</td>
                <td>{product["name"]}</td>
                <td>{product["description"]}</td>
                <td>{enginesObj[product["engineId"]]}</td>
                <td>{product["price"]}</td>
                <td>{product["count"]}</td>
                <td>
                  <Link href={`/admin/crm/products/${product["id"]}/edit`} className="btn">
                    Редактировать
                  </Link>
                  <Link href={`/admin/crm/products/${product["id"]}/delete`} className="btn btn-danger">
                    Удалить
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">Нет продуктов.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default ProductsPage;
