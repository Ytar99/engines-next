import React from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { FiShoppingCart } from "react-icons/fi";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/catalog" className={styles.logo}>
          ООО &quot;АвтоДВС&quot;
        </Link>

        <div className={styles.links}>
          <Link href="/admin" className={styles.link}>
            Админ-панель
          </Link>
          <Link href="/catalog" className={styles.link}>
            Каталог
          </Link>
          <Link href="/catalog/cart" className={styles.cartLink}>
            <FiShoppingCart className={styles.cartIcon} />
            <span className={styles.cartCount}>0</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
