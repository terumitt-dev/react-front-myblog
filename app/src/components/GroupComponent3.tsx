import { FunctionComponent } from "react";
import styles from "./GroupComponent3.module.css";

export type GroupComponent3Type = {
  className?: string;
};

const GroupComponent3: FunctionComponent<GroupComponent3Type> = ({
  className = "",
}) => {
  return (
    <div className={[styles.rectangleParent, className].join(" ")}>
      <div className={styles.frameChild} />
      <div className={styles.postsColumn}>
        <div className={styles.div}>最新記事</div>
      </div>
      <div className={styles.frameParent}>
        <div className={styles.frameWrapper}>
          <div className={styles.rectangleGroup}>
            <div className={styles.frameItem} />
            <h3 className={styles.h3}>最新ブログ記事①</h3>
          </div>
        </div>
        <div className={styles.rectangleContainer}>
          <div className={styles.frameItem} />
          <h3 className={styles.h3}>最新ブログ記事②</h3>
        </div>
        <div className={styles.rectangleContainer}>
          <div className={styles.frameItem} />
          <h3 className={styles.h3}>最新ブログ記事③</h3>
        </div>
      </div>
    </div>
  );
};

export default GroupComponent3;
