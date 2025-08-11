// app/src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuth } from "../useAuth";

// localStorage モック
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("初期状態では未認証", () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
  });

  it("localStorageに認証情報がある場合は認証済み", () => {
    mockLocalStorage.getItem.mockReturnValue("true");

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
  });

  it("ログイン処理が正常に動作する", () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login("admin", "password");
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("auth", "true");
  });

  it("無効な認証情報でログインが失敗する", () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login("wrong", "credentials");
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it("ログアウト処理が正常に動作する", () => {
    mockLocalStorage.getItem.mockReturnValue("true");

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("auth");
  });
});
