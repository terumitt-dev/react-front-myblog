// app/src/hooks/useSpiderEffects.ts
import { useState, useEffect, useCallback } from "react";
import {
  generateRandomPosition,
  generateRandomRotation,
  getEffectCount,
  ANIMATION_CONFIG,
} from "@/constants/effectConfig";

export type Spider = {
  id: number;
  top: string;
  left: string;
  rotate: number;
};

/**
 * スパイダーエフェクト管理フック
 */
export const useSpiderEffects = (
  category: string | undefined,
  reducedMotion: boolean,
) => {
  const [spiders, setSpiders] = useState<Spider[]>([]);
  const [spiderDisappearingIds, setSpiderDisappearingIds] = useState<
    Set<number>
  >(() => new Set());

  // スパイダー生成
  useEffect(() => {
    if (category !== "hobby") {
      setSpiders([]);
      return;
    }

    const containerWidth =
      typeof window !== "undefined" ? window.innerWidth : 1024;
    const containerHeight =
      typeof window !== "undefined" ? window.innerHeight : 768;
    const spiderCount = getEffectCount(category, containerWidth);

    if (spiderCount > 0) {
      setSpiders(
        Array.from({ length: spiderCount }, (_, i) => ({
          id: Date.now() + i,
          ...generateRandomPosition(containerWidth, containerHeight, 50),
          rotate: generateRandomRotation(),
        })),
      );
    } else {
      setSpiders([]);
    }
  }, [category]);

  // スパイダークリックハンドラー
  const handleSpiderClick = useCallback(
    (spiderId: number) => {
      setSpiderDisappearingIds((prev) => new Set([...prev, spiderId]));

      setTimeout(
        () => {
          setSpiders((prev) => prev.filter((spider) => spider.id !== spiderId));
          setSpiderDisappearingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(spiderId);
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

  return {
    spiders,
    spiderDisappearingIds,
    handleSpiderClick,
  };
};
