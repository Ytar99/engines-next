import React from "react";
import Image from "next/image";
import styles from "./ProductCard.module.css";

const ProductCard = ({ product }) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image src={product.image} alt={product.name} className={styles.image} width="200" height="300" />
      </div>
      <h3 className={styles.name}>{product.name}</h3>
      <p className={styles.price}>{product.price} руб.</p>
      <button className={styles.button}>Добавить в корзину</button>
    </div>
  );
};

export default ProductCard;
