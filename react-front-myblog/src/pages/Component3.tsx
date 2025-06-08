import { FunctionComponent, useCallback } from "react";
import ArticleContainer from "../components/ArticleContainer";
import { useNavigate } from "react-router-dom";
import styles from "./Component3.module.css";

const Component3: FunctionComponent = () => {
  const navigate = useNavigate();

  const onGroupButtonClick = useCallback(() => {
    navigate("/1");
  }, [navigate]);

  return (
    <div className={styles.div}>
      <div className={styles.wrapper}>
        <h1 className={styles.h1}>テック</h1>
      </div>
      <div className={styles.parent}>
        <div className={styles.div1} />
        <img className={styles.frameChild} alt="" src="/group-35.svg" />
      </div>
      <main className={styles.articleContainerWrapper}>
        <ArticleContainer />
      </main>
      <button className={styles.rectangleParent} onClick={onGroupButtonClick}>
        <div className={styles.frameItem} />
        <div className={styles.top}>TOPに戻る</div>
      </button>
    </div>
  );
};

export default Component3;
