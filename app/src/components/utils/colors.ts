// app/src/components/utils/colors.ts
// カテゴリー関連の色彩
export const CATEGORY_COLORS = {
  hobby: {
    bg: "bg-[#E1C6F9]",
    hex: "#E1C6F9",
    name: "しゅみ",
    focusRing: "focus:ring-purple-300",
  },
  tech: {
    bg: "bg-[#AFEBFF]",
    hex: "#AFEBFF",
    name: "テック",
    focusRing: "focus:ring-blue-300",
  },
  other: {
    bg: "bg-[#CCF5B1]",
    hex: "#CCF5B1",
    name: "その他",
    focusRing: "focus:ring-green-300",
  },
} as const;

// 汎用UI色彩パレット（既存のまま）
export const UI_COLORS = {
  // 青系（プライマリー）
  blue: {
    bg: "bg-blue-600 hover:bg-blue-700",
    bgDark: "dark:bg-blue-700 dark:hover:bg-blue-800",
    text: "text-blue-600 dark:text-blue-400",
    textHover: "hover:text-blue-800 dark:hover:text-blue-300",
    focus: "focus:ring-blue-500",
  },

  // 赤系（エラー・危険）
  red: {
    bg: "bg-red-600 hover:bg-red-700",
    text: "text-red-600 dark:text-red-400",
    textHover: "hover:text-red-800 dark:hover:text-red-300",
    focus: "focus:ring-red-500",
    errorBg: "bg-red-100 dark:bg-red-900",
    errorText: "text-red-700 dark:text-red-200",
    errorBorder: "border-red-400 dark:border-red-600",
  },

  // 緑系（成功・確認）
  green: {
    bg: "bg-green-600 hover:bg-green-700",
    text: "text-green-600 dark:text-green-400",
    textHover: "hover:text-green-800 dark:hover:text-green-300",
    focus: "focus:ring-green-500",
  },
} as const;

export type CategoryType = keyof typeof CATEGORY_COLORS;

// ========== 新規追加（既存に影響なし） ==========

// Layout.tsxで使用されている色を定数化（参考用・将来使用予定）
export const LAYOUT_COLORS = {
  // Layout.tsxの現在のクラス名をそのまま定数化
  mainBackground:
    "min-h-screen bg-gradient-to-b from-[#4161EC] to-[#BC7AF2] dark:from-[#1d2a7a] dark:to-[#6b3aa8] text-gray-800 dark:text-gray-100",

  // 分割版（将来的に細かく使いたい場合）
  gradient: {
    full: "bg-gradient-to-b from-[#4161EC] to-[#BC7AF2] dark:from-[#1d2a7a] dark:to-[#6b3aa8]",
    light: "from-[#4161EC] to-[#BC7AF2]",
    dark: "dark:from-[#1d2a7a] dark:to-[#6b3aa8]",
  },

  text: "text-gray-800 dark:text-gray-100",
  container: "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8",
} as const;

// 将来的な拡張用
export const FUTURE_COLORS = {
  // 今後新しい色定義があれば追加
} as const;
