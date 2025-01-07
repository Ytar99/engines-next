import React from "react";
import styles from "./LoadingOverlay.module.css";

function LoadingOverlay({ fullscreen }) {
  return (
    <div className={fullscreen ? styles["fullscreen-overlay"] : styles["block-overlay"]}>
      <span className={styles.loader}></span>
    </div>
  );
}

export default LoadingOverlay;
