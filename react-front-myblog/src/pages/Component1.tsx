import { FunctionComponent } from "react";
import FrameComponent1 from "../components/FrameComponent1";
import FrameComponent2 from "../components/FrameComponent2";
import styles from "./Component1.module.css";

const Component1: FunctionComponent = () => {
  return (
    <div className={styles.div}>
      <main className={styles.rectangleParent}>
        <div className={styles.frameChild} />
        <img
          className={styles.frameItem}
          loading="lazy"
          alt=""
          src="/group-38@2x.png"
        />
        <img
          className={styles.frameInner}
          loading="lazy"
          alt=""
          src="/group-38@2x.png"
        />
        <img
          className={styles.groupIcon}
          loading="lazy"
          alt=""
          src="/group-38@2x.png"
        />
        <img
          className={styles.frameChild1}
          loading="lazy"
          alt=""
          src="/group-38@2x.png"
        />
        <img
          className={styles.frameChild2}
          loading="lazy"
          alt=""
          src="/group-38@2x.png"
        />
        <img
          className={styles.frameChild3}
          loading="lazy"
          alt=""
          src="/group-38@2x.png"
        />
        <img
          className={styles.frameChild4}
          loading="lazy"
          alt=""
          src="/group-38@2x.png"
        />
        <header className={styles.header}>
          <h1 className={styles.h1}>しゅみ</h1>
          <img
            className={styles.headerChild}
            loading="lazy"
            alt=""
            src="/group-38@2x.png"
          />
          <img
            className={styles.headerItem}
            loading="lazy"
            alt=""
            src="/group-38@2x.png"
          />
          <img
            className={styles.headerInner}
            loading="lazy"
            alt=""
            src="/group-38@2x.png"
          />
          <img
            className={styles.headerChild1}
            loading="lazy"
            alt=""
            src="/group-38@2x.png"
          />
        </header>
        <img
          className={styles.frameChild5}
          loading="lazy"
          alt=""
          src="/group-38@2x.png"
        />
      </main>
      <FrameComponent1 />
      <FrameComponent2 />
    </div>
  );
};

export default Component1;
