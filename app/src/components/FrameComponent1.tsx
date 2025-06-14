import {
  FunctionComponent,
  useMemo,
  type CSSProperties,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FrameComponent1.module.css";

export type FrameComponent1Type = {
  className?: string;

  /** Style props */
  frameSectionAlignSelf?: CSSProperties["alignSelf"];
  frameSectionWidth?: CSSProperties["width"];
};

const FrameComponent1: FunctionComponent<FrameComponent1Type> = ({
  className = "",
  frameSectionAlignSelf,
  frameSectionWidth,
}) => {
  const frameSectionStyle: CSSProperties = useMemo(() => {
    return {
      alignSelf: frameSectionAlignSelf,
      width: frameSectionWidth,
    };
  }, [frameSectionAlignSelf, frameSectionWidth]);

  const navigate = useNavigate();

  const onGroupContainerClick = useCallback(() => {
    navigate("/show-page");
  }, [navigate]);

  return (
    <section
      className={[styles.frameParent, className].join(" ")}
      style={frameSectionStyle}
    >
      <div className={styles.rectangleParent} onClick={onGroupContainerClick}>
        <div className={styles.frameChild} />
        <h3 className={styles.h3}>ブログ記事①</h3>
      </div>
      <div className={styles.rectangleGroup}>
        <div className={styles.frameChild} />
        <h3 className={styles.h3}>ブログ記事①</h3>
      </div>
      <div className={styles.rectangleGroup}>
        <div className={styles.frameChild} />
        <h3 className={styles.h3}>ブログ記事①</h3>
      </div>
      <div className={styles.rectangleGroup}>
        <div className={styles.frameChild} />
        <h3 className={styles.h3}>ブログ記事①</h3>
      </div>
    </section>
  );
};

export default FrameComponent1;
