import { FunctionComponent } from "react";
import styles from "./CategoryColumn.module.css";

export type CategoryColumnType = {
  className?: string;
};

const CategoryColumn: FunctionComponent<CategoryColumnType> = ({
  className = "",
}) => {
  return (
    <div className={[styles.categoryColumn, className].join(" ")}>
      <button className={styles.rectangleParent}>
        <div className={styles.frameChild} />
        <div className={styles.div}>しゅみ</div>
      </button>
      <div className={styles.rectangleGroup}>
        <div className={styles.frameItem} />
        <h2 className={styles.h2}>テック</h2>
      </div>
      <div className={styles.rectangleContainer}>
        <div className={styles.frameInner} />
        <h2 className={styles.h2}>その他</h2>
      </div>
    </div>
  );
};

export default CategoryColumn;
