// app/src/hooks/useBubbleGeneration.ts
import { useState, useCallback, useRef } from "react";
import { useInterval } from "./useInterval";
import {
  generateRandomPosition,
  EFFECT_CONFIG,
} from "../constants/effectConfig";

export type Bubble = {
  id: number;
  top: string;
  left: string;
  createdAt: number;
};

interface UseBubbleGenerationProps {
  category: string | undefined;
  reducedMotion: boolean;
  isPageVisible: boolean;
}

export const useBubbleGeneration = ({
  category,
  reducedMotion,
  isPageVisible,
}: UseBubbleGenerationProps) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const bubbleIdCounterRef = useRef(0);

  // バブル生成関数
  const generateBubble = useCallback(() => {
    if (
      typeof window === "undefined" ||
      reducedMotion ||
      !isPageVisible ||
      category !== "tech"
    ) {
      return;
    }

    setBubbles((prev) => {
      // 古いバブルの自動削除（メモリリーク防止）
      const now = Date.now();
      const filteredBubbles = prev.filter(
        (bubble) => now - bubble.createdAt < EFFECT_CONFIG.bubble.tech.lifetime,
      );

      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;

      const newBubble: Bubble = {
        id: ++bubbleIdCounterRef.current,
        ...generateRandomPosition(containerWidth, containerHeight, 50),
        createdAt: now,
      };

      // 最大数制限
      const maxBubbles = EFFECT_CONFIG.bubble.tech.max;
      return filteredBubbles.length >= maxBubbles
        ? [...filteredBubbles.slice(1), newBubble]
        : [...filteredBubbles, newBubble];
    });
  }, [reducedMotion, isPageVisible, category]);

  // バブル生成タイミング
  const shouldGenerateBubbles =
    category === "tech" && !reducedMotion && isPageVisible;

  const bubbleInterval = shouldGenerateBubbles
    ? EFFECT_CONFIG.bubble.tech.interval
    : null;

  // バブル生成インターバル
  useInterval(generateBubble, bubbleInterval, [
    category,
    reducedMotion,
    isPageVisible,
  ]);

  // バブル終了ハンドラー
  const handleBubbleEnd = useCallback((bubbleId: number) => {
    setBubbles((prev) => prev.filter((bubble) => bubble.id !== bubbleId));
  }, []);

  // カテゴリ変更時の初期化
  const initializeBubbles = useCallback(() => {
    if (category === "tech") {
      setBubbles([]); // 初期化のみ
    } else {
      setBubbles([]);
    }
  }, [category]);

  return {
    bubbles,
    handleBubbleEnd,
    initializeBubbles,
  };
};
