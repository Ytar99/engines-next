import React from "react";
import FilterSidebar from "@/components/Catalog/FilterSidebar";
import ProductCard from "@/components/Catalog/ProductCard";
import Pagination from "@/components/Catalog/Pagination";

import styles from "./page.module.css";

// Mock data
const products = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Продукт ${i + 1}`,
  price: (Math.random() * 100).toFixed(2),
  image: `/assets/no-image.png`,
}));

const CatalogPage = () => {
  return (
    <div className={styles.container}>
      <FilterSidebar />

      <main className={styles.mainContent}>
        <div className={styles.productGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <hr />
        <div className={styles.paginationWrapper}>
          <Pagination totalPages={5} />
        </div>
      </main>
    </div>
  );
};

export default CatalogPage;
