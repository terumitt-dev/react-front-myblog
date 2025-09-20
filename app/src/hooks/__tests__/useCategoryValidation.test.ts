// app/src/hooks/__tests__/useCategoryValidation.test.ts
import { renderHook } from "@testing-library/react";
import { useCategoryValidation } from "../useCategoryValidation";

describe("useCategoryValidation", () => {
  it("有効なカテゴリー値でtrueを返す", () => {
    const { result } = renderHook(() => useCategoryValidation());

    // 全ての有効なカテゴリー値をテスト
    expect(result.current.isValidCategory("hobby")).toBe(true);
    expect(result.current.isValidCategory("tech")).toBe(true);
    expect(result.current.isValidCategory("other")).toBe(true);
  });

  it("無効なカテゴリー値でfalseを返す", () => {
    const { result } = renderHook(() => useCategoryValidation());

    // 無効な文字列値をテスト
    expect(result.current.isValidCategory("invalid")).toBe(false);
    expect(result.current.isValidCategory("")).toBe(false);
    expect(result.current.isValidCategory("TECH")).toBe(false); // 大文字は一致しない
    expect(result.current.isValidCategory("hobby ")).toBe(false); // スペースが含まれる
  });

  it("undefinedでfalseを返す", () => {
    const { result } = renderHook(() => useCategoryValidation());

    // undefinedをテスト
    expect(result.current.isValidCategory(undefined)).toBe(false);
  });

  it("useMemoが適切に機能していることを確認", () => {
    const { result, rerender } = renderHook(() => useCategoryValidation());

    // 初回レンダリング時の関数参照を保存
    const firstRenderFunction = result.current.isValidCategory;

    // 再レンダリング
    rerender();

    // 同じ関数参照であることを確認（メモ化が機能している）
    expect(result.current.isValidCategory).toBe(firstRenderFunction);
  });
});
