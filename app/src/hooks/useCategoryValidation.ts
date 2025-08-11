// app/src/hooks/useCategoryValidation.ts
import { useCallback } from "react";
import type { CategoryType } from "@/components/utils/colors";

/**
 * カテゴリバリデーションフック
 */
export const useCategoryValidation = () => {
  const isValidCategory = useCallback(
    (cat: string | undefined): cat is CategoryType =>
      cat === "hobby" || cat === "tech" || cat === "other",
    [],
  );

  return { isValidCategory };
};
