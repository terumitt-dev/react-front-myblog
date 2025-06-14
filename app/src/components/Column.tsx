import { FunctionComponent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Column.module.css";

export type ColumnType = {
  className?: string;
};

const Column: FunctionComponent<ColumnType> = ({ className = "" }) => {
  const navigate = useNavigate();

  const onGroupButtonClick = useCallback(() => {
    navigate("/top-page");
  }, [navigate]);

  return (
    <div className={[styles.column, className].join(" ")}>
      <section className={styles.column1}>
        <div className={styles.frameParent}>
          <div className={styles.rectangleParent}>
            <div className={styles.frameChild} />
            <h3 className={styles.h3}>ブログ記事①</h3>
          </div>
          <div className={styles.rectangleParent}>
            <div className={styles.frameChild} />
            <h3 className={styles.h3}>ブログ記事①</h3>
          </div>
          <div className={styles.rectangleParent}>
            <div className={styles.frameChild} />
            <h3 className={styles.h3}>ブログ記事①</h3>
          </div>
          <div className={styles.rectangleParent}>
            <div className={styles.frameChild} />
            <h3 className={styles.h3}>ブログ記事①</h3>
          </div>
        </div>
      </section>
      <button className={styles.groupButton} onClick={onGroupButtonClick}>
        <div className={styles.frameChild1} />
        <div className={styles.top}>TOPに戻る</div>
      </button>
    </div>
  );
};

export default Column;
