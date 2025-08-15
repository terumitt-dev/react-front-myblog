// app/src/hooks/useStaticEffects.ts
import { usePosts } from "@/hooks/usePosts";
import { useSpiderEffects } from "@/hooks/useSpiderEffects";
import { useSnailEffects } from "@/hooks/useSnailEffects";
import { useCategoryValidation } from "@/hooks/useCategoryValidation";
import { useAccessibility } from "@/hooks/useAccessibility";

// 型を再エクスポート（既存のインポートとの互換性のため）
export type { Post } from "@/hooks/usePosts";
export type { Spider } from "@/hooks/useSpiderEffects";
export type { Snail } from "@/hooks/useSnailEffects";

/**
 * 統合エフェクトフック（後方互換性のため）
 * 各専用フックを組み合わせて使用
 */
export const useStaticEffects = (category: string | undefined) => {
  const a11yState = useAccessibility();
  const { posts, isLoading } = usePosts(category);
  const { isValidCategory } = useCategoryValidation();
  const { spiders, spiderDisappearingIds, handleSpiderClick } =
    useSpiderEffects(category, a11yState.reducedMotion);
  const { snails, snailDisappearingIds, handleSnailClick, handleSnailHover } =
    useSnailEffects(category, a11yState.reducedMotion);

  return {
    posts,
    isLoading,
    spiders,
    snails,
    reducedMotion: a11yState.reducedMotion,
    spiderDisappearingIds,
    snailDisappearingIds,
    handleSpiderClick,
    handleSnailClick,
    handleSnailHover,
    isValidCategory,
  };
};
