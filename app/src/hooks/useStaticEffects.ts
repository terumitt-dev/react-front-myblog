import { usePosts } from "@/hooks/usePosts";
import { useSpiderEffects } from "@/hooks/useSpiderEffects";
import { useSnailEffects } from "@/hooks/useSnailEffects";
import { useCategoryValidation } from "@/hooks/useCategoryValidation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// 型を再エクスポート（既存のインポートとの互換性のため）
export type { Post } from "@/hooks/usePosts";
export type { Spider } from "@/hooks/useSpiderEffects";
export type { Snail } from "@/hooks/useSnailEffects";

/**
 * 統合エフェクトフック（後方互換性のため）
 * 各専用フックを組み合わせて使用
 */
export const useStaticEffects = (category: string | undefined) => {
  const reducedMotion = useReducedMotion();
  const { posts } = usePosts(category);
  const { isValidCategory } = useCategoryValidation();
  const { spiders, spiderDisappearingIds, handleSpiderClick } =
    useSpiderEffects(category, reducedMotion);
  const { snails, snailDisappearingIds, handleSnailClick, handleSnailHover } =
    useSnailEffects(category, reducedMotion);

  return {
    posts,
    spiders,
    snails,
    reducedMotion,
    spiderDisappearingIds,
    snailDisappearingIds,
    handleSpiderClick,
    handleSnailClick,
    handleSnailHover,
    isValidCategory,
  };
};
