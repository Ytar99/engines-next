import React from "react";
import styles from "./FilterSidebar.module.css";

const FilterSidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Фильтры</h2>

      <div className={styles.filterSection}>
        <h3>Цена</h3>
        <div className={styles.priceRange}>
          <input type="number" placeholder="От" className={styles.input} />
          <span>-</span>
          <input type="number" placeholder="До" className={styles.input} />
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3>Категории</h3>
        <ul className={styles.categoryList}>
          {["Смазочные материалы", "Свечи", "Болты/Гайки/Шайбы", "Двигатели"].map((category) => (
            <li key={category} className={styles.categoryItem}>
              <label>
                <input type="checkbox" className={styles.checkbox} />
                {category}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default FilterSidebar;
