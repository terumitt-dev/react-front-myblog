// app/src/components/utils/colors.ts
// カテゴリー関連の色彩
export const CATEGORY_COLORS = {
  hobby: {
    bg: "bg-category-hobby-bg", // TailwindクラスとしてCSS変数を参照
    hex: "#E1C6F9", // HEX値はそのまま残す
    name: "しゅみ",
  },
  tech: {
    bg: "bg-category-tech-bg",
    hex: "#AFEBFF",
    name: "テック",
  },
  other: {
    bg: "bg-category-other-bg",
    hex: "#CCF5B1",
    name: "その他",
  },
} as const;

// 汎用UI色彩パレット
export const UI_COLORS = {
  // 青系（プライマリー）
  blue: {
    bg: "bg-ui-primary-600 hover:bg-ui-primary-700",
    bgDark: "dark:bg-ui-primary-700 dark:hover:bg-ui-primary-800",
    text: "text-ui-primary-text-light dark:text-ui-primary-text-dark",
    textHover: "hover:text-ui-primary-800 dark:hover:text-ui-primary-text-dark",
    focus: "focus:ring-ui-primary-500",
  },

  // 赤系（エラー・危険）
  red: {
    bg: "bg-ui-danger-600 hover:bg-ui-danger-700",
    text: "text-ui-danger-text-light dark:text-ui-danger-text-dark",
    textHover: "hover:text-ui-danger-800 dark:hover:text-ui-danger-text-dark",
    focus: "focus:ring-ui-primary-500", // Tailwindのデフォルトであるblue-500をそのまま使うか、専用の色を設定
    errorBg: "bg-ui-danger-100 dark:bg-ui-danger-900",
    errorText: "text-ui-danger-700 dark:text-ui-danger-text-200",
    errorBorder: "border-ui-danger-400 dark:border-ui-danger-600-dark",
  },

  // 緑系（成功・確認）
  green: {
    bg: "bg-ui-success-600 hover:bg-ui-success-700",
    text: "text-ui-success-text-light dark:text-ui-success-text-dark",
    textHover: "hover:text-ui-success-800 dark:hover:text-ui-success-text-dark",
    focus: "focus:ring-ui-primary-500", // Tailwindのデフォルトであるblue-500をそのまま使うか、専用の色を設定
  },
} as const;

export type CategoryType = keyof typeof CATEGORY_COLORS;

// ========== 新規追加（既存に影響なし） ==========\n\n// Layout.tsxで使用されている色を定数化（参考用・将来使用予定）
export const LAYOUT_COLORS = {
  // Layout.tsxの現在のクラス名をそのまま定数化
  mainBackground:
    "min-h-screen bg-gradient-to-b from-layout-gradient-from-light to-layout-gradient-to-light dark:from-layout-gradient-from-dark dark:to-layout-gradient-to-dark text-layout-text-light dark:text-layout-text-dark",

  // 分割版（将来的に細かく使いたい場合）
  gradient: {
    full: "bg-gradient-to-b from-layout-gradient-from-light to-layout-gradient-to-light dark:from-layout-gradient-from-dark dark:to-layout-gradient-to-dark",
    light: "from-layout-gradient-from-light to-layout-gradient-to-light",
    dark: "dark:from-layout-gradient-from-dark dark:to-layout-gradient-to-dark",
  },

  text: "text-layout-text-light dark:text-layout-text-dark",
  container: "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8", // これは色ではないが、レイアウト関連でまとめておく
} as const;

// 将来的な拡張用
export const FUTURE_COLORS = {
  // 今後新しい色定義があれば追加
} as const;
