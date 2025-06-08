import { FunctionComponent } from "react";
import styles from "./Column1.module.css";

export type Column1Type = {
  className?: string;
};

const Column1: FunctionComponent<Column1Type> = ({ className = "" }) => {
  return (
    <section className={[styles.column, className].join(" ")}>
      <div className={styles.column1}>
        <section className={styles.column2}>
          <img
            className={styles.columnChild}
            loading="lazy"
            alt=""
            src="/group-54.svg"
          />
          <div className={styles.column3}>
            <img className={styles.columnItem} loading="lazy" alt="" src />
          </div>
        </section>
        <section className={styles.column4}>
          <div className={styles.column5}>
            <div className={styles.column6}>
              <img
                className={styles.columnChild}
                loading="lazy"
                alt=""
                src="/group-54.svg"
              />
            </div>
            <div className={styles.column7}>
              <img
                className={styles.columnChild}
                loading="lazy"
                alt=""
                src="/group-54.svg"
              />
              <div className={styles.column}>
                <div className={styles.column9}>
                  <div className={styles.column10}>
                    <img
                      className={styles.columnChild1}
                      loading="lazy"
                      alt=""
                      src="/group-54.svg"
                    />
                  </div>
                  <img
                    className={styles.columnChild}
                    loading="lazy"
                    alt=""
                    src="/group-54.svg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default Column1;
