// app/src/hooks/__tests__/useSpiderEffects.test.ts
import { renderHook, act } from "@testing-library/react";
import { useSpiderEffects } from "../useSpiderEffects";
import { vi } from "vitest";
import * as effectConfig from "@/constants/effectConfig";

// モック用の定数
const MOCK_WINDOW_WIDTH = 1280;
const MOCK_WINDOW_HEIGHT = 800;
const MOCK_EFFECT_COUNT = 3;

describe("useSpiderEffects", () => {
  // windowオブジェクトのモック
  beforeEach(() => {
    vi.useFakeTimers();

    // ウィンドウサイズのモック
    Object.defineProperty(window, "innerWidth", {
      value: MOCK_WINDOW_WIDTH,
      writable: true,
    });

    Object.defineProperty(window, "innerHeight", {
      value: MOCK_WINDOW_HEIGHT,
      writable: true,
    });

    // effectConfig関数のモック
    vi.spyOn(effectConfig, "getEffectCount").mockImplementation(
      () => MOCK_EFFECT_COUNT,
    );
    vi.spyOn(effectConfig, "generateRandomPosition").mockImplementation(() => ({
      top: "100px",
      left: "200px",
    }));
    vi.spyOn(effectConfig, "generateRandomRotation").mockImplementation(
      () => 90,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("hobbyカテゴリの場合、スパイダーを生成する", () => {
    const { result } = renderHook(() => useSpiderEffects("hobby", false));

    expect(result.current.spiders.length).toBe(MOCK_EFFECT_COUNT);
    expect(result.current.spiders[0]).toEqual(
      expect.objectContaining({
        top: "100px",
        left: "200px",
        rotate: 90,
      }),
    );
  });

  it("hobby以外のカテゴリの場合、スパイダーを生成しない", () => {
    const { result: techResult } = renderHook(() =>
      useSpiderEffects("tech", false),
    );
    expect(techResult.current.spiders.length).toBe(0);

    const { result: otherResult } = renderHook(() =>
      useSpiderEffects("other", false),
    );
    expect(otherResult.current.spiders.length).toBe(0);

    const { result: undefinedResult } = renderHook(() =>
      useSpiderEffects(undefined, false),
    );
    expect(undefinedResult.current.spiders.length).toBe(0);
  });

  it("スパイダークリック時に適切にアニメーション処理される", () => {
    const { result } = renderHook(() => useSpiderEffects("hobby", false));

    expect(result.current.spiders.length).toBe(MOCK_EFFECT_COUNT);
    const firstSpiderId = result.current.spiders[0].id;

    // スパイダークリック
    act(() => {
      result.current.handleSpiderClick(firstSpiderId);
    });

    // 消失中IDセットに追加されていることを確認
    expect(result.current.spiderDisappearingIds.has(firstSpiderId)).toBe(true);

    // アニメーション完了までタイマー進行
    act(() => {
      vi.advanceTimersByTime(
        effectConfig.ANIMATION_CONFIG.disappearDuration.normal,
      );
    });

    // スパイダーが削除され、消失中IDセットからも削除されていることを確認
    expect(result.current.spiders.length).toBe(MOCK_EFFECT_COUNT - 1);
    expect(result.current.spiderDisappearingIds.has(firstSpiderId)).toBe(false);
  });
  it("reducedMotion=trueの場合、短い消失時間が使用される", () => {
    const { result } = renderHook(() => useSpiderEffects("hobby", true));

    const firstSpiderId = result.current.spiders[0].id;

    // スパイダークリック
    act(() => {
      result.current.handleSpiderClick(firstSpiderId);
    });

    // 通常の時間では消失しない
    act(() => {
      vi.advanceTimersByTime(
        effectConfig.ANIMATION_CONFIG.disappearDuration.reduced - 1,
      );
    });
    expect(result.current.spiders.length).toBe(MOCK_EFFECT_COUNT);

    // reduced時間で消失する
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.spiders.length).toBe(MOCK_EFFECT_COUNT - 1);
  });

  it("カテゴリが変更された場合、スパイダーが再生成される", () => {
    const { result, rerender } = renderHook(
      (props) => useSpiderEffects(props.category, props.reducedMotion),
      { initialProps: { category: "tech", reducedMotion: false } },
    );

    expect(result.current.spiders.length).toBe(0);

    // hobbyカテゴリに変更
    rerender({ category: "hobby", reducedMotion: false });

    expect(result.current.spiders.length).toBe(MOCK_EFFECT_COUNT);
  });
});
