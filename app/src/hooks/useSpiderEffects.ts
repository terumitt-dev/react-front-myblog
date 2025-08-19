// app/src/hooks/useSpiderEffects.ts
import { useState, useEffect, useCallback, useRef } from "react";
import {
  generateRandomPosition,
  generateRandomRotation,
  getEffectCount,
  ANIMATION_CONFIG,
} from "@/constants/effectConfig";
import {
  DEFAULT_SCREEN_SIZE,
  EFFECT_SIZES,
  ID_OFFSETS,
} from "@/constants/appConfig";

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

  // 複数のタイマーIDを管理
  const timeoutIdsRef = useRef<number[]>([]);

  // スパイダー生成
  useEffect(() => {
    if (category !== "hobby") {
      setSpiders([]);
      setSpiderDisappearingIds(new Set());
      return;
    }

    const containerWidth =
      typeof window !== "undefined"
        ? window.innerWidth
        : DEFAULT_SCREEN_SIZE.WIDTH;
    const containerHeight =
      typeof window !== "undefined"
        ? window.innerHeight
        : DEFAULT_SCREEN_SIZE.HEIGHT;
    const spiderCount = getEffectCount(category, containerWidth);

    if (spiderCount > 0) {
      setSpiders(
        Array.from({ length: spiderCount }, (_, i) => ({
          id: Date.now() + i + ID_OFFSETS.SPIDER_OFFSET,
          ...generateRandomPosition(
            containerWidth,
            containerHeight,
            EFFECT_SIZES.SPIDER_SIZE,
          ),
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

      const id = window.setTimeout(
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

      // タイマーIDを配列に追加
      timeoutIdsRef.current.push(id);
    },
    [reducedMotion],
  );

  // アンマウント時にすべてのタイマーをクリア
  useEffect(
    () => () => {
      timeoutIdsRef.current.forEach(clearTimeout);
    },
    [],
  );

  return {
    spiders,
    spiderDisappearingIds,
    handleSpiderClick,
  };
};
