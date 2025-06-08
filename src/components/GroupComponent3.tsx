import { FunctionComponent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./GroupComponent3.module.css";

export type GroupComponent3Type = {
  className?: string;
};

const GroupComponent3: FunctionComponent<GroupComponent3Type> = ({
  className = "",
}) => {
  const navigate = useNavigate();

  const onGroupContainerClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className={[styles.rectangleParent, className].join(" ")}>
      <div className={styles.frameChild} />
      <div className={styles.wrapper}>
        <div className={styles.div}>最新記事</div>
      </div>
      <div className={styles.recentPostsColumn}>
        <div className={styles.recentPostsColumnInner}>
          <div
            className={styles.rectangleGroup}
            onClick={onGroupContainerClick}
          >
            <div className={styles.frameItem} />
            <h3 className={styles.h3}>最新ブログ記事①</h3>
          </div>
        </div>
        <div
          className={styles.rectangleContainer}
          onClick={onGroupContainerClick}
        >
          <div className={styles.frameItem} />
          <h3 className={styles.h3}>最新ブログ記事②</h3>
        </div>
        <div
          className={styles.rectangleContainer}
          onClick={onGroupContainerClick}
        >
          <div className={styles.frameItem} />
          <h3 className={styles.h3}>最新ブログ記事③</h3>
        </div>
      </div>
    </div>
  );
};

export default GroupComponent3;
