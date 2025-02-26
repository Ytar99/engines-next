import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./CartPage.module.css";

const CartPage = () => {
  // Mock data
  const cartItems = [
    { id: 1, name: "Продукт 1", price: 49.99, quantity: 2, image: `/assets/no-image.png` },
    { id: 2, name: "Продукт 2", price: 89.99, quantity: 1, image: `/assets/no-image.png` },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 15.0;
  const total = subtotal + shipping;

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Корзина</h1>

      <div className={styles.cartWrapper}>
        <div className={styles.itemsColumn}>
          {cartItems.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <Image src={item.image} alt={item.name} className={styles.itemImage} width="100" height="150" />

              <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemPrice}>{item.price.toFixed(2)} руб.</p>

                <div className={styles.quantityControls}>
                  <button className={styles.quantityButton}>-</button>
                  <span className={styles.quantity}>{item.quantity}</span>
                  <button className={styles.quantityButton}>+</button>
                </div>
              </div>

              <div className={styles.itemTotal}>{(item.price * item.quantity).toFixed(2)} руб.</div>
            </div>
          ))}
        </div>

        <div className={styles.summaryColumn}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Сумма заказа</h2>

            <div className={styles.summaryRow}>
              <span>Цена товаров</span>
              <span>{subtotal.toFixed(2)} руб.</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Доставка</span>
              <span>{shipping.toFixed(2)} руб.</span>
            </div>

            <div className={styles.totalRow}>
              <span>Всего</span>
              <span>{total.toFixed(2)} руб.</span>
            </div>

            <Link href="/checkout" className={styles.checkoutButton}>
              Отправить заявку
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
