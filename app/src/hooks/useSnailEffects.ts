// app/src/hooks/useSnailEffects.ts
import { useState, useEffect, useCallback, useRef } from "react";
import {
  generateRandomPosition,
  getEffectCount,
  ANIMATION_CONFIG,
} from "@/constants/effectConfig";
import {
  DEFAULT_SCREEN_SIZE,
  EFFECT_SIZES,
  ID_OFFSETS,
} from "@/constants/appConfig";

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
  const timeoutRef = useRef<number | null>(null);

  // カタツムリ生成
  useEffect(() => {
    if (category !== "other") {
      setSnails([]);
      setSnailDisappearingIds(new Set());
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
    const snailCount = getEffectCount(category, containerWidth);

    if (snailCount > 0) {
      setSnails(
        Array.from({ length: snailCount }, (_, i) => ({
          id: Date.now() + i + ID_OFFSETS.SNAIL_OFFSET,
          ...generateRandomPosition(
            containerWidth,
            containerHeight,
            EFFECT_SIZES.SNAIL_SIZE,
          ),
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

      timeoutRef.current = window.setTimeout(
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

  // アンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
