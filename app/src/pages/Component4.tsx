import { FunctionComponent } from "react";
import CategoryColumn from "../components/CategoryColumn";
import GroupComponent3 from "../components/GroupComponent3";
import GroupComponent from "../components/GroupComponent";
import styles from "./Component4.module.css";

const Component4: FunctionComponent = () => {
  return (
    <div className={styles.topPage}>
      <section className={styles.rectangleParent}>
        <div className={styles.frameChild} />
        <h1 className={styles.h1}>トップ画像</h1>
      </section>
      <main className={styles.frameParent}>
        <section className={styles.categoryColumnParent}>
          <CategoryColumn />
          <GroupComponent3 />
        </section>
        <GroupComponent />
      </main>
    </div>
  );
};

export default Component4;
