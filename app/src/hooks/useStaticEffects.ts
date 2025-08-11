// app/src/hooks/useStaticEffects.ts
import { useState, useEffect, useCallback } from "react";
import {
  generateRandomPosition,
  generateRandomRotation,
  getEffectCount,
  ANIMATION_CONFIG,
} from "../constants/effectConfig";
import {
  handleStorageError,
  safeJsonParse,
} from "../components/utils/errorHandler";
import type { CategoryType } from "../components/utils/colors";

export type Spider = {
  id: number;
  top: string;
  left: string;
  rotate: number;
};

export type Snail = {
  id: number;
  top: string;
  left: string;
  isMoved: boolean;
};

export type Post = {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
};

interface RawPost {
  id: string | number;
  title: string;
  content: string;
  category: string;
  createdAt?: string;
}

export const useStaticEffects = (category: string | undefined) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [spiders, setSpiders] = useState<Spider[]>([]);
  const [snails, setSnails] = useState<Snail[]>([]);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // 消失中のアイテムID管理
  const [spiderDisappearingIds, setSpiderDisappearingIds] = useState<
    Set<number>
  >(() => new Set());
  const [snailDisappearingIds, setSnailDisappearingIds] = useState<Set<number>>(
    () => new Set(),
  );

  // カテゴリバリデーション
  const isValidCategory = useCallback(
    (cat: string | undefined): cat is CategoryType =>
      cat === "hobby" || cat === "tech" || cat === "other",
    [],
  );

  // reduced-motion監視
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setReducedMotion(e.matches);
    };

    setReducedMotion(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // 静的初期化（カテゴリ変更時のみ）
  useEffect(() => {
    // 投稿読み込み
    const saved = localStorage.getItem("myblog-posts");
    if (saved) {
      try {
        const rawPosts = safeJsonParse<RawPost[]>(saved, []);
        if (isValidCategory(category)) {
          const validPosts: Post[] = rawPosts
            .filter((p): p is RawPost => p && typeof p === "object")
            .map((p: RawPost) => ({
              ...p,
              id: Number(p.id),
              createdAt: p.createdAt || new Date().toISOString(),
            }))
            .filter((p) => p.category === category);
          setPosts(validPosts);
        } else {
          setPosts([]);
          return;
        }
      } catch (e) {
        console.error("JSON parse error:", e);
        handleStorageError(e, "load category posts");
        localStorage.removeItem("myblog-posts");
        setPosts([]);
        return;
      }
    }

    // カテゴリが無効な場合のみクリア
    if (!isValidCategory(category)) {
      setSpiders([]);
      setSnails([]);
      return;
    }

    // 画面サイズ取得
    const containerWidth = window?.innerWidth || 1024;
    const containerHeight = window?.innerHeight || 768;

    // エフェクト初期化
    if (category === "hobby") {
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
    } else {
      setSpiders([]);
    }

    if (category === "other") {
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
    } else {
      setSnails([]);
    }
  }, [category, isValidCategory]);

  // クリックハンドラー
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

  const handleSnailHover = useCallback((snailId: number) => {
    setSnails((prev) =>
      prev.map((snail) =>
        snail.id === snailId ? { ...snail, isMoved: true } : snail,
      ),
    );
  }, []);

  return {
    // State
    posts,
    spiders,
    snails,
    reducedMotion,
    spiderDisappearingIds,
    snailDisappearingIds,

    // Handlers
    handleSpiderClick,
    handleSnailClick,
    handleSnailHover,

    // Utils
    isValidCategory,
  };
};
