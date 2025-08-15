// app/src/constants/responsive.ts
/**
 * レスポンシブデザイン統一設定
 *
 * 既存の実装パターンを分析して標準化した定数セット
 * - 現在の振る舞いを維持しながら一貫性を向上
 * - Tailwind CSS のブレークポイントに準拠
 */

// ========== ブレークポイント定数 ==========
export const BREAKPOINTS = {
  xs: "375px", // スマートフォン小 (iPhone SE等)
  sm: "640px", // スマートフォン大・タブレット小 (Tailwind標準)
  md: "768px", // タブレット (Tailwind標準)
  lg: "1024px", // デスクトップ小 (Tailwind標準)
  xl: "1280px", // デスクトップ大 (Tailwind標準)
  "2xl": "1536px", // 大画面 (Tailwind標準)
} as const;

// ========== コンテナサイズ統一 ==========
export const CONTAINER_SIZES = {
  // メインレイアウト（現在Layout.tsxで使用）
  main: "max-w-5xl mx-auto",

  // 将来的な拡張用
  narrow: "max-w-3xl mx-auto",
  wide: "max-w-7xl mx-auto",
  full: "max-w-full mx-auto",
} as const;

// ========== スペーシング統一 ==========
export const RESPONSIVE_SPACING = {
  // パディング（現在Layout.tsx, Top.tsxで使用）
  container: "px-4 sm:px-6 lg:px-8",

  // セクション内パディング（現在Top.tsxで使用）
  section: "p-4 sm:p-6",
  sectionLarge: "p-4 sm:p-6 lg:p-8",

  // コンポーネント内スペース
  component: "p-2 sm:p-3 lg:p-4",
  componentLarge: "p-3 sm:p-4 lg:p-6",

  // マージン
  margin: "m-4 sm:m-6 lg:m-8",
  marginY: "my-4 sm:my-6 lg:my-8",
  marginX: "mx-4 sm:mx-6 lg:mx-8",

  // ギャップ
  gap: "gap-4 sm:gap-6 lg:gap-8",
  gapSmall: "gap-2 sm:gap-3 lg:gap-4",
} as const;

// ========== テキストサイズ統一 ==========
export const RESPONSIVE_TEXT = {
  // 見出し
  heading1: "text-2xl sm:text-3xl lg:text-4xl",
  heading2: "text-xl sm:text-2xl lg:text-3xl",
  heading3: "text-lg sm:text-xl lg:text-2xl",

  // 本文
  body: "text-sm sm:text-base lg:text-lg",
  bodyLarge: "text-base sm:text-lg lg:text-xl",

  // 小さいテキスト
  small: "text-xs sm:text-sm",
  caption: "text-xs",
} as const;

// ========== グリッドレイアウト統一 ==========
export const RESPONSIVE_GRID = {
  // 記事一覧等（現在Top.tsxで使用）
  articles: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  articlesLarge: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",

  // カテゴリボタン等
  categories: "grid-cols-1 sm:grid-cols-3",

  // 汎用
  auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  autoLarge: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;

// ========== フレックスレイアウト統一 ==========
export const RESPONSIVE_FLEX = {
  // 基本
  column: "flex flex-col",
  columnToRow: "flex flex-col sm:flex-row",

  // アライメント付き
  center: "flex items-center justify-center",
  between: "flex items-center justify-between",
  start: "flex items-start",

  // レスポンシブ対応
  centerToStart: "flex flex-col items-center sm:flex-row sm:items-start",
} as const;

// ========== 統合レイアウトパターン ==========
export const LAYOUT_PATTERNS = {
  // メインコンテナ（Layout.tsx用）
  mainContainer: `${CONTAINER_SIZES.main} ${RESPONSIVE_SPACING.container}`,

  // セクションコンテナ（Top.tsx用）
  sectionContainer: `w-full ${CONTAINER_SIZES.main} ${RESPONSIVE_SPACING.container}`,

  // カードレイアウト
  cardGrid: `grid ${RESPONSIVE_GRID.articles} ${RESPONSIVE_SPACING.gap}`,

  // フォームレイアウト
  formContainer: `${CONTAINER_SIZES.narrow} ${RESPONSIVE_SPACING.section}`,
} as const;
