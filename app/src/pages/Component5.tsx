import { FunctionComponent } from "react";
import ArticleDetails from "../components/ArticleDetails";
import styles from "./Component5.module.css";

const Component5: FunctionComponent = () => {
  return (
    <div className={styles.showPage}>
      <ArticleDetails />
      <div className={styles.rectangleParent}>
        <div className={styles.frameChild} />
        <div className={styles.wrapper}>
          <div className={styles.div}>コメント一覧</div>
        </div>
        <div className={styles.dividers} />
        <div className={styles.dividers1} />
        <div className={styles.dividers1} />
      </div>
    </div>
  );
};

export default Component5;
