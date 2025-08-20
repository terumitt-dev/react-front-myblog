// app/src/hooks/__tests__/usePosts.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { usePosts } from "../usePosts";
import { vi } from "vitest";
import * as errorHandler from "@/components/utils/errorHandler";

// モックデータ
const mockPosts = [
  { id: 1, title: "Tech Post 1", content: "Content 1", category: "tech" },
  { id: 2, title: "Hobby Post", content: "Content 2", category: "hobby" },
  { id: 3, title: "Tech Post 2", content: "Content 3", category: "tech" },
  { id: 4, title: "Other Post", content: "Content 4", category: "other" },
];

describe("usePosts", () => {
  // localStorageのモック
  let mockLocalStorage: Record<string, string> = {};

  // errorHandlerのモック
  const mockHandleStorageError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // localStorageのモック設定
    mockLocalStorage = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn((key) => mockLocalStorage[key] || null),
        setItem: vi.fn((key, value) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key) => {
          delete mockLocalStorage[key];
        }),
      },
      writable: true,
    });

    // errorHandler関数のモック
    vi.spyOn(errorHandler, "safeJsonParse").mockImplementation(
      (json, fallback) => {
        if (typeof json !== "string") return fallback;
        try {
          return JSON.parse(json);
        } catch {
          return fallback;
        }
      },
    );
    vi.spyOn(errorHandler, "handleStorageError").mockImplementation(
      mockHandleStorageError,
    );
  });

  it("空のlocalStorageの場合、空の投稿配列を返す", async () => {
    const { result } = renderHook(() => usePosts("tech"));

    await waitFor(() => {
      expect(window.localStorage.getItem).toHaveBeenCalledWith("myblog-posts");
      expect(result.current.posts).toEqual([]);
    });
  });

  it("特定のカテゴリーの投稿のみをフィルタリングする", async () => {
    // localStorageにモックデータをセット
    mockLocalStorage["myblog-posts"] = JSON.stringify(mockPosts);

    // techカテゴリーでフィルタリング
    const { result: techResult } = renderHook(() => usePosts("tech"));

    await waitFor(() => {
      expect(techResult.current.posts.length).toBe(2);
      expect(techResult.current.posts[0].title).toBe("Tech Post 1");
      expect(techResult.current.posts[1].title).toBe("Tech Post 2");
    });

    // hobbyカテゴリーでフィルタリング
    const { result: hobbyResult } = renderHook(() => usePosts("hobby"));

    await waitFor(() => {
      expect(hobbyResult.current.posts.length).toBe(1);
      expect(hobbyResult.current.posts[0].title).toBe("Hobby Post");
    });
  });

  it("カテゴリーがundefinedの場合、空の配列を返す", async () => {
    // localStorageにモックデータをセット
    mockLocalStorage["myblog-posts"] = JSON.stringify(mockPosts);

    const { result } = renderHook(() => usePosts(undefined));

    await waitFor(() => {
      expect(window.localStorage.getItem).toHaveBeenCalledWith("myblog-posts");
      expect(result.current.posts).toEqual([]);
    });
  });
  it("JSONパースエラー時に適切に処理する", async () => {
    // 不正なJSONをセット
    mockLocalStorage["myblog-posts"] = "invalid-json";

    // errorHandler.safeJsonParseのモックを上書き
    vi.spyOn(errorHandler, "safeJsonParse").mockImplementation(() => {
      throw new Error("JSON parse error");
    });

    const { result } = renderHook(() => usePosts("tech"));

    await waitFor(() => {
      // エラーハンドリングが呼ばれることを確認
      expect(mockHandleStorageError).toHaveBeenCalled();
      expect(window.localStorage.removeItem).toHaveBeenCalledWith(
        "myblog-posts",
      );
      expect(result.current.posts).toEqual([]);
    });
  });

  it("投稿データのプロパティを正しく処理する", async () => {
    // 一部フィールドが欠けているデータ
    const incompleteData = [
      { id: "5", category: "tech" }, // titleとcontentが欠けている
    ];

    mockLocalStorage["myblog-posts"] = JSON.stringify(incompleteData);

    const { result } = renderHook(() => usePosts("tech"));

    await waitFor(() => {
      // 欠けているフィールドが空文字列で補完されるべき
      expect(result.current.posts.length).toBe(1);
      expect(result.current.posts[0].id).toBe(5); // 数値に変換
      expect(result.current.posts[0].title).toBe("");
      expect(result.current.posts[0].content).toBe("");
      expect(result.current.posts[0].category).toBe("tech");
      expect(result.current.posts[0].createdAt).toBeDefined();
    });
  });
});
