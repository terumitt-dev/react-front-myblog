import { FunctionComponent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Component6.module.css";

const Component6: FunctionComponent = () => {
  const navigate = useNavigate();

  const onGroupContainerClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className={styles.div}>
      <section className={styles.rectangleParent}>
        <div className={styles.frameChild} />
        <div className={styles.rectangleGroup}>
          <div className={styles.frameItem} />
          <div className={styles.div1}>コメントユーザー名</div>
        </div>
      </section>
      <section className={styles.inner}>
        <div className={styles.rectangleContainer}>
          <div className={styles.frameInner} />
          <div className={styles.frameDiv}>
            <div className={styles.rectangleDiv} />
            <div className={styles.div2}>コメント内容</div>
          </div>
        </div>
      </section>
      <section className={styles.frameParent}>
        <div className={styles.groupDiv} onClick={onGroupContainerClick}>
          <div className={styles.frameChild1} />
          <div className={styles.div3}>コメント確定する</div>
        </div>
        <div
          className={styles.rectangleParent1}
          onClick={onGroupContainerClick}
        >
          <div className={styles.frameChild2} />
          <div className={styles.div4}>
            <span className={styles.txt}>
              <p className={styles.p}>コメントしない</p>
              <p className={styles.p}>（閉じる）</p>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Component6;
