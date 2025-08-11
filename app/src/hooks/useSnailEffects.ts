// app/src/hooks/useSnailEffects.ts
import { useState, useEffect, useCallback } from "react";
import {
  generateRandomPosition,
  getEffectCount,
  ANIMATION_CONFIG,
} from "@/constants/effectConfig";

export type Snail = {
  id: number;
  top: string;
  left: string;
  isMoved: boolean;
};

/**
 * カタツムリエフェクト管理フック
 */
export const useSnailEffects = (
  category: string | undefined,
  reducedMotion: boolean,
) => {
  const [snails, setSnails] = useState<Snail[]>([]);
  const [snailDisappearingIds, setSnailDisappearingIds] = useState<Set<number>>(
    () => new Set(),
  );

  // カタツムリ生成
  useEffect(() => {
    if (category !== "other") {
      setSnails([]);
      return;
    }

    const containerWidth =
      typeof window !== "undefined" ? window.innerWidth : 1024;
    const containerHeight =
      typeof window !== "undefined" ? window.innerHeight : 768;
    const snailCount = getEffectCount(category, containerWidth);

    if (snailCount > 0) {
      setSnails(
        Array.from({ length: snailCount }, (_, i) => ({
          id: Date.now() + i + 1000,
          ...generateRandomPosition(containerWidth, containerHeight, 60),
          isMoved: false,
        })),
      );
    } else {
      setSnails([]);
    }
  }, [category]);

  // カタツムリクリックハンドラー
  const handleSnailClick = useCallback(
    (snailId: number) => {
      setSnailDisappearingIds((prev) => new Set([...prev, snailId]));

      setTimeout(
        () => {
          setSnails((prev) => prev.filter((snail) => snail.id !== snailId));
          setSnailDisappearingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(snailId);
            return newSet;
          });
        },
        reducedMotion
          ? ANIMATION_CONFIG.disappearDuration.reduced
          : ANIMATION_CONFIG.disappearDuration.normal,
      );
    },
    [reducedMotion],
  );

  // カタツムリホバーハンドラー
  const handleSnailHover = useCallback((snailId: number) => {
    setSnails((prev) =>
      prev.map((snail) =>
        snail.id === snailId ? { ...snail, isMoved: true } : snail,
      ),
    );
  }, []);

  return {
    snails,
    snailDisappearingIds,
    handleSnailClick,
    handleSnailHover,
  };
};
