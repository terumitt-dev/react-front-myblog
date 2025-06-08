import { FunctionComponent } from "react";
import ArticleDetails from "../components/ArticleDetails";
import styles from "./Component5.module.css";

const Component5: FunctionComponent = () => {
  return (
    <div className={styles.div}>
      <ArticleDetails />
      <div className={styles.rectangleParent}>
        <div className={styles.frameChild} />
        <div className={styles.wrapper}>
          <div className={styles.div1}>コメント一覧</div>
        </div>
        <textarea className={styles.dividers} rows={13} cols={23} />
        <div className={styles.dividers1} />
        <div className={styles.dividers1} />
      </div>
    </div>
  );
};

export default Component5;
