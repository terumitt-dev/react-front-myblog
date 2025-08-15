// app/src/components/utils/styles.ts

/**
 * よく使用される共通スタイルの定数化
 */

// フォーム要素の基本スタイル
export const FORM_STYLES = {
  // 基本入力フィールド
  input:
    "border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",

  // セレクトボックス
  select:
    "border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",

  // ラベル
  label: "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300",

  // コンテナ
  container: "w-full",
} as const;

// 背景色のパターン
export const BACKGROUND_STYLES = {
  // カード背景
  card: "bg-white dark:bg-gray-800",
  cardSecondary: "bg-gray-50 dark:bg-gray-800",

  // コンテナ背景
  container: "bg-gray-200 dark:bg-gray-800",

  // エラー背景
  error: "bg-red-100 dark:bg-red-900",
  errorBorder: "border-red-400 dark:border-red-600",

  // 全画面背景
  fullScreen: "min-h-screen",
} as const;

// テキストカラー
export const TEXT_STYLES = {
  // 基本テキスト
  primary: "text-gray-900 dark:text-white",
  secondary: "text-gray-700 dark:text-gray-300",
  muted: "text-gray-600 dark:text-gray-400",

  // エラーテキスト
  error: "text-red-700 dark:text-red-200",

  // リンクテキスト
  link: "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300",
} as const;

// フォーカス・インタラクション
export const INTERACTION_STYLES = {
  // フォーカス
  focusRing: "focus:outline-none focus:ring-2 focus:ring-offset-2",
  focusBlue: "focus:ring-blue-500",

  // ホバー
  hoverOpacity: "hover:opacity-90",
  hoverUnderline: "hover:underline",

  // トランジション
  transition: "transition-colors",
  transitionAll: "transition",
} as const;
