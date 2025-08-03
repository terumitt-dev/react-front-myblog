// app/src/hooks/useAnimationEffects.ts
import { useState, useCallback, useRef } from "react";
import { useTimers } from "./useTimers";

type Spider = { id: number; top: string; left: string; rotate: number };
type Bubble = { id: number; top: string; left: string; createdAt: number };
type Snail = { id: number; top: string; left: string; isMoved?: boolean };

type RandomPositionGenerator = (
  maxTop: number,
  maxLeft: number,
) => {
  top: string;
  left: string;
};

export const useAnimationEffects = (reducedAnimations: boolean) => {
  const [spiders, setSpiders] = useState<Spider[]>([]);
  const [spiderVisible, setSpiderVisible] = useState(true);
  const [spiderDisappearingIds, setSpiderDisappearingIds] = useState<number[]>(
    [],
  );
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [snails, setSnails] = useState<Snail[]>([]);
  const [snailDisappearingIds, setSnailDisappearingIds] = useState<number[]>(
    [],
  );

  const { setTimeout } = useTimers();
  const bubbleIdCounterRef = useRef(0);

  // スパイダー関連
  const handleSpiderClick = useCallback(
    (id: number) => {
      setSpiderDisappearingIds((prev) => [...prev, id]);
      const animationDuration = reducedAnimations ? 300 : 600;

      setTimeout(() => {
        setSpiders((prev) => prev.filter((sp) => sp.id !== id));
        setSpiderDisappearingIds((prev) => prev.filter((x) => x !== id));
      }, animationDuration);
    },
    [setTimeout, reducedAnimations],
  );

  const initializeSpiders = useCallback(
    (
      count: number,
      generateRandomPosition: RandomPositionGenerator,
      generateRandomRotation: () => number,
    ) => {
      setSpiders(
        Array.from({ length: count }, (_, i) => ({
          id: i,
          ...generateRandomPosition(80, 80),
          rotate: generateRandomRotation(),
        })),
      );
      setSpiderVisible(true);
    },
    [],
  );

  const clearSpiders = useCallback(() => {
    setSpiders([]);
  }, []);

  // バブル関連
  const generateBubble = useCallback(
    (maxBubbles: number, generateRandomPosition: RandomPositionGenerator) => {
      setBubbles((prev) => {
        const newBubble: Bubble = {
          id: ++bubbleIdCounterRef.current,
          ...generateRandomPosition(80, 80),
          createdAt: Date.now(),
        };

        return prev.length >= maxBubbles
          ? [...prev.slice(1), newBubble]
          : [...prev, newBubble];
      });
    },
    [],
  );

  const handleBubbleEnd = useCallback((bubbleId: number) => {
    setBubbles((prev) => prev.filter((x) => x.id !== bubbleId));
  }, []);

  const clearBubbles = useCallback(() => {
    setBubbles([]);
  }, []);

  // カタツムリ関連
  const handleSnailClick = useCallback(
    (id: number) => {
      setSnailDisappearingIds((prev) => [...prev, id]);
      const animationDuration = reducedAnimations ? 300 : 600;

      setTimeout(() => {
        setSnails((prev) => prev.filter((snail) => snail.id !== id));
        setSnailDisappearingIds((prev) => prev.filter((x) => x !== id));
      }, animationDuration);
    },
    [setTimeout, reducedAnimations],
  );

  const handleSnailHover = useCallback(
    (id: number, enableAnimations: boolean) => {
      if (!enableAnimations) return;

      setSnails((prev) =>
        prev.map((snail) =>
          snail.id === id ? { ...snail, isMoved: true } : snail,
        ),
      );
    },
    [],
  );

  const initializeSnails = useCallback(
    (count: number, generateRandomPosition: RandomPositionGenerator) => {
      setSnails(
        Array.from({ length: count }, (_, i) => ({
          id: i,
          ...generateRandomPosition(70, 70),
          isMoved: false,
        })),
      );
    },
    [],
  );

  const clearSnails = useCallback(() => {
    setSnails([]);
  }, []);

  return {
    // State
    spiders,
    spiderVisible,
    spiderDisappearingIds,
    bubbles,
    snails,
    snailDisappearingIds,

    // Spider methods
    handleSpiderClick,
    initializeSpiders,
    clearSpiders,

    // Bubble methods
    generateBubble,
    handleBubbleEnd,
    clearBubbles,

    // Snail methods
    handleSnailClick,
    handleSnailHover,
    initializeSnails,
    clearSnails,
  };
};
