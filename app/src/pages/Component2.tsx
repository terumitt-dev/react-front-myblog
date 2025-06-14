import { FunctionComponent } from "react";
import Column1 from "../components/Column1";
import FrameComponent1 from "../components/FrameComponent1";
import Column from "../components/Column";
import styles from "./Component2.module.css";

const Component2: FunctionComponent = () => {
  return (
    <div className={styles.div}>
      <main className={styles.rectangleParent}>
        <div className={styles.frameChild} />
        <section className={styles.column}>
          <div className={styles.column1}>
            <div className={styles.column2}>
              <img
                className={styles.columnChild}
                loading="lazy"
                alt=""
                src="/group-54.svg"
              />
            </div>
            <div className={styles.column3}>
              <div className={styles.column4}>
                <img
                  className={styles.columnItem}
                  loading="lazy"
                  alt=""
                  src="/group-54.svg"
                />
                <h1 className={styles.h1}>その他</h1>
              </div>
              <img
                className={styles.columnInner}
                loading="lazy"
                alt=""
                src="/group-54.svg"
              />
            </div>
          </div>
          <div className={styles.column5}>
            <img
              className={styles.columnChild}
              loading="lazy"
              alt=""
              src="/group-54.svg"
            />
          </div>
        </section>
        <Column1 />
      </main>
      <FrameComponent1
        frameSectionAlignSelf="unset"
        frameSectionWidth="1219.5px"
      />
      <Column />
    </div>
  );
};

export default Component2;
