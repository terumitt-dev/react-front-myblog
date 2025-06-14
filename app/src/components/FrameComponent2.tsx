import { FunctionComponent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FrameComponent2.module.css";

export type FrameComponent2Type = {
  className?: string;
};

const FrameComponent2: FunctionComponent<FrameComponent2Type> = ({
  className = "",
}) => {
  const navigate = useNavigate();

  const onGroupContainerClick = useCallback(() => {
    navigate("/top-page");
  }, [navigate]);

  return (
    <div className={[styles.frameParent, className].join(" ")}>
      <section className={styles.frameGroup}>
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
      </section>
      <div className={styles.rectangleParent1} onClick={onGroupContainerClick}>
        <div className={styles.frameChild1} />
        <h3 className={styles.top}>TOPに戻る</h3>
      </div>
    </div>
  );
};

export default FrameComponent2;
