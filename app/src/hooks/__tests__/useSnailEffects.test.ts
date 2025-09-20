// app/src/hooks/__tests__/useSnailEffects.test.ts
import { renderHook, act } from "@testing-library/react";
import { useSnailEffects } from "../useSnailEffects";
import { vi } from "vitest";
import * as effectConfig from "@/constants/effectConfig";

// モック用の定数
const MOCK_WINDOW_WIDTH = 1280;
const MOCK_WINDOW_HEIGHT = 800;
const MOCK_EFFECT_COUNT = 3;

describe("useSnailEffects", () => {
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
      top: "150px",
      left: "250px",
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("otherカテゴリの場合、カタツムリを生成する", () => {
    const { result } = renderHook(() => useSnailEffects("other", false));

    expect(result.current.snails.length).toBe(MOCK_EFFECT_COUNT);
    expect(result.current.snails[0]).toEqual(
      expect.objectContaining({
        top: "150px",
        left: "250px",
        isMoved: false,
      }),
    );
  });

  it("other以外のカテゴリの場合、カタツムリを生成しない", () => {
    const { result: techResult } = renderHook(() =>
      useSnailEffects("tech", false),
    );
    expect(techResult.current.snails.length).toBe(0);

    const { result: hobbyResult } = renderHook(() =>
      useSnailEffects("hobby", false),
    );
    expect(hobbyResult.current.snails.length).toBe(0);

    const { result: undefinedResult } = renderHook(() =>
      useSnailEffects(undefined, false),
    );
    expect(undefinedResult.current.snails.length).toBe(0);
  });

  it("カタツムリクリック時に適切にアニメーション処理される", () => {
    const { result } = renderHook(() => useSnailEffects("other", false));

    expect(result.current.snails.length).toBe(MOCK_EFFECT_COUNT);
    const firstSnailId = result.current.snails[0].id;

    // カタツムリクリック
    act(() => {
      result.current.handleSnailClick(firstSnailId);
    });

    // 消失中IDセットに追加されていることを確認
    expect(result.current.snailDisappearingIds.has(firstSnailId)).toBe(true);

    // アニメーション完了までタイマー進行
    act(() => {
      vi.advanceTimersByTime(
        effectConfig.ANIMATION_CONFIG.disappearDuration.normal,
      );
    });

    // カタツムリが削除され、消失中IDセットからも削除されていることを確認
    expect(result.current.snails.length).toBe(MOCK_EFFECT_COUNT - 1);
    expect(result.current.snailDisappearingIds.has(firstSnailId)).toBe(false);
  });

  it("reducedMotion=trueの場合、短い消失時間が使用される", () => {
    const { result } = renderHook(() => useSnailEffects("other", true));

    const firstSnailId = result.current.snails[0].id;

    // カタツムリクリック
    act(() => {
      result.current.handleSnailClick(firstSnailId);
    });

    // reduced時間で消失する
    act(() => {
      vi.advanceTimersByTime(
        effectConfig.ANIMATION_CONFIG.disappearDuration.reduced,
      );
    });

    expect(result.current.snails.length).toBe(MOCK_EFFECT_COUNT - 1);
  });

  it("ホバー時にisMoved状態が更新される", () => {
    const { result } = renderHook(() => useSnailEffects("other", false));

    const firstSnailId = result.current.snails[0].id;

    // 初期状態ではisMovedはfalse
    expect(result.current.snails[0].isMoved).toBe(false);

    // ホバー処理
    act(() => {
      result.current.handleSnailHover(firstSnailId);
    });

    // isMovedがtrueに更新される
    expect(result.current.snails[0].isMoved).toBe(true);

    // 他のカタツムリには影響しない
    expect(result.current.snails[1].isMoved).toBe(false);
  });

  it("カテゴリが変更された場合、カタツムリが再生成される", () => {
    const { result, rerender } = renderHook(
      (props) => useSnailEffects(props.category, props.reducedMotion),
      { initialProps: { category: "tech", reducedMotion: false } },
    );

    expect(result.current.snails.length).toBe(0);

    // otherカテゴリに変更
    rerender({ category: "other", reducedMotion: false });

    expect(result.current.snails.length).toBe(MOCK_EFFECT_COUNT);
  });
});
