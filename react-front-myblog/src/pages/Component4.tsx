import { FunctionComponent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import GroupComponent3 from "../components/GroupComponent3";
import GroupComponent from "../components/GroupComponent";
import styles from "./Component4.module.css";

const Component4: FunctionComponent = () => {
  const navigate = useNavigate();

  const onGroupContainerClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const onGroupContainerClick1 = useCallback(() => {
    navigate("/2");
  }, [navigate]);

  const onGroupContainerClick2 = useCallback(() => {
    navigate("/3");
  }, [navigate]);

  return (
    <div className={styles.div}>
      <section className={styles.rectangleParent}>
        <div className={styles.frameChild} />
        <h1 className={styles.h1}>トップ画像</h1>
      </section>
      <main className={styles.frameParent}>
        <section className={styles.categoriesColumnParent}>
          <div className={styles.categoriesColumn}>
            <div
              className={styles.rectangleGroup}
              onClick={onGroupContainerClick}
            >
              <div className={styles.frameItem} />
              <h2 className={styles.h2}>しゅみ</h2>
            </div>
            <div
              className={styles.rectangleContainer}
              onClick={onGroupContainerClick1}
            >
              <div className={styles.frameInner} />
              <h2 className={styles.h2}>テック</h2>
            </div>
            <div className={styles.groupDiv} onClick={onGroupContainerClick2}>
              <div className={styles.rectangleDiv} />
              <h2 className={styles.h2}>その他</h2>
            </div>
          </div>
          <GroupComponent3 />
        </section>
        <GroupComponent />
      </main>
    </div>
  );
};

export default Component4;
