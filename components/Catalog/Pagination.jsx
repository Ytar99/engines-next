"use client";

import React, { useState } from "react";
import styles from "./Pagination.module.css";

const Pagination = ({ totalPages }) => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className={styles.pagination}>
      <button
        className={styles.arrow}
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {[...Array(totalPages).keys()].map((page) => (
        <button
          key={page + 1}
          className={`${styles.page} ${currentPage === page + 1 ? styles.active : ""}`}
          onClick={() => setCurrentPage(page + 1)}
        >
          {page + 1}
        </button>
      ))}

      <button
        className={styles.arrow}
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
