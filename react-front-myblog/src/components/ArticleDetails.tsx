import { FunctionComponent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ArticleDetails.module.css";

export type ArticleDetailsType = {
  className?: string;
};

const ArticleDetails: FunctionComponent<ArticleDetailsType> = ({
  className = "",
}) => {
  const navigate = useNavigate();

  const onGroupContainerClick = useCallback(() => {
    navigate("/4");
  }, [navigate]);

  const onGroupContainerClick1 = useCallback(() => {
    navigate("/1");
  }, [navigate]);

  return (
    <main className={[styles.articleDetails, className].join(" ")}>
      <header className={styles.rectangleParent}>
        <div className={styles.frameChild} />
        <button className={styles.article}>
          <div className={styles.articleChild} />
          <div className={styles.div}>ブログ記事(タイトル)</div>
        </button>
      </header>
      <div className={styles.rectangleGroup}>
        <div className={styles.frameItem} />
        <div className={styles.rectangleContainer}>
          <div className={styles.frameInner} />
          <div className={styles.div1}>ブログ記事の内容</div>
        </div>
      </div>
      <div className={styles.actions}>
        <div className={styles.groupDiv} onClick={onGroupContainerClick}>
          <div className={styles.rectangleDiv} />
          <div className={styles.div2}>コメントする</div>
        </div>
        <div
          className={styles.rectangleParent1}
          onClick={onGroupContainerClick1}
        >
          <div className={styles.frameChild1} />
          <div className={styles.top}>TOPに戻る</div>
        </div>
      </div>
    </main>
  );
};

export default ArticleDetails;
