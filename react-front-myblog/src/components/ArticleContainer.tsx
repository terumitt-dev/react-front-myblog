import { FunctionComponent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ArticleContainer.module.css";

export type ArticleContainerType = {
  className?: string;
};

const ArticleContainer: FunctionComponent<ArticleContainerType> = ({
  className = "",
}) => {
  const navigate = useNavigate();

  const onGroupContainerClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className={[styles.articleContainer, className].join(" ")}>
      <div className={styles.rectangleParent} onClick={onGroupContainerClick}>
        <div className={styles.frameChild} />
        <h3 className={styles.h3}>ブログ記事①</h3>
      </div>
      <div className={styles.rectangleGroup}>
        <div className={styles.frameChild} />
        <h3 className={styles.h3}>ブログ記事①</h3>
      </div>
      <div className={styles.rectangleGroup}>
        <div className={styles.frameChild} />
        <h3 className={styles.h3}>ブログ記事①</h3>
      </div>
      <div className={styles.rectangleGroup}>
        <div className={styles.frameChild} />
        <h3 className={styles.h3}>ブログ記事①</h3>
      </div>
      <div className={styles.rectangleGroup}>
        <div className={styles.frameChild} />
        <h3 className={styles.h3}>ブログ記事①</h3>
      </div>
      <div className={styles.rectangleGroup}>
        <div className={styles.frameChild} />
        <h3 className={styles.h3}>ブログ記事①</h3>
      </div>
      <div className={styles.rectangleGroup}>
        <div className={styles.frameChild} />
        <h3 className={styles.h3}>ブログ記事①</h3>
      </div>
      <div className={styles.rectangleGroup}>
        <div className={styles.frameChild} />
        <h3 className={styles.h3}>ブログ記事①</h3>
      </div>
    </div>
  );
};

export default ArticleContainer;
