import { FunctionComponent } from "react";
import styles from "./GroupComponent.module.css";

export type GroupComponentType = {
  className?: string;
};

const GroupComponent: FunctionComponent<GroupComponentType> = ({
  className = "",
}) => {
  return (
    <section className={[styles.rectangleParent, className].join(" ")}>
      <div className={styles.frameChild} />
      <div className={styles.profileContainerWrapper}>
        <div className={styles.profileContainer}>
          <div className={styles.profileDetails}>
            <h2 className={styles.h2}>プロフィール</h2>
          </div>
          <div className={styles.profileContainerChild} />
        </div>
      </div>
      <div className={styles.frameItem} />
    </section>
  );
};

export default GroupComponent;
