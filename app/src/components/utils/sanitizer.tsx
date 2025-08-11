// app/src/components/utils/sanitizer.tsx
/**
 * 統一されたサニタイズ・表示戦略
 *
 * 方針:
 * 1. 保存時: 必ずエスケープして保存（escapeHtml）
 * 2. 表示時: エスケープ済みデータはそのまま表示（dangerouslySetInnerHTML使用）
 * 3. 入力時: リアルタイムバリデーション
 */

// エスケープ済みかどうかを判定（より精密）
const isAlreadyEscaped = (text: string): boolean => {
  if (!text) return false;

  // HTMLエンティティパターンをチェック
  const entityPattern = /&(?:[a-z\d]+|#\d+|#x[a-f\d]+);/gi;
  const hasEntities = entityPattern.test(text);

  // エスケープ前後で長さが変わるかチェック
  if (typeof document !== "undefined") {
    const tempDiv = document.createElement("div");
    tempDiv.textContent = text;
    const escaped = tempDiv.innerHTML;
    return hasEntities && text !== escaped;
  }

  return hasEntities;
};

// HTMLエスケープ（二重エスケープ防止強化）
export const escapeHtml = (text: string): string => {
  if (!text) return "";

  if (isAlreadyEscaped(text)) {
    console.warn("⚠️ 既にエスケープ済みの可能性:", text.slice(0, 50));
    return text;
  }

  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // フォールバック（サーバーサイド対応）
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

// プレーンテキスト化（表示用）
export const toPlainText = (text: string): string => {
  if (!text) return "";

  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = text;
    return div.textContent || div.innerText || "";
  }

  // フォールバック: 基本的なHTMLタグを除去
  return text.replace(/<[^>]*>/g, "");
};

// 安全な表示用テキスト（エスケープ済みデータ用）- 既存互換性のため残す
export const displayText = (text: string, isEscaped = false): string => {
  if (isEscaped) {
    return toPlainText(text); // エスケープ済みデータはプレーンテキスト化
  }
  return escapeHtml(text); // 生データはエスケープ
};

// 新しい表示関数（用途別）
export const displayTextSafe = (text: string): string => {
  if (!text) return "";

  // エスケープ済みデータはそのまま返す（HTMLとして表示）
  return text;
};

// プレーンテキストとして表示（検索結果など）
export const displayTextPlain = (text: string): string => {
  if (!text) return "";
  return toPlainText(text);
};

// バリデーション強化
export const validateAndSanitize = (
  text: string,
  maxLength: number = 1000,
  fieldName: string = "フィールド",
): { isValid: boolean; sanitized: string; error?: string } => {
  if (!text?.trim()) {
    return { isValid: false, sanitized: "", error: `${fieldName}は必須です` };
  }

  const trimmed = text.trim();

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      sanitized: "",
      error: `${fieldName}は${maxLength}文字以内で入力してください`,
    };
  }

  // 危険なパターンチェック（強化版）
  const dangerousPatterns = [
    // スクリプトタグ
    /<script[^>]*>.*?<\/script>/gis,
    /<iframe[^>]*>.*?<\/iframe>/gis,
    /<object[^>]*>.*?<\/object>/gis,
    /<embed[^>]*>/gi,
    /<applet[^>]*>.*?<\/applet>/gis,

    // JavaScript プロトコル
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /data\s*:/gi,

    // イベントハンドラ
    /on\w+\s*=/gi,

    // メタタグ（リダイレクトなど）
    /<meta[^>]*>/gi,

    // リンクタグ（外部リソース読み込み）
    /<link[^>]*>/gi,

    // スタイルタグ
    /<style[^>]*>.*?<\/style>/gis,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      console.warn(`⚠️ 危険なパターンを検出: ${fieldName}`, pattern);
      return {
        isValid: false,
        sanitized: "",
        error: `${fieldName}に使用できない文字が含まれています`,
      };
    }
  }

  // 正常な場合はエスケープして返す
  return {
    isValid: true,
    sanitized: escapeHtml(trimmed),
  };
};

// カテゴリバリデーション（型安全版）
export const validateCategory = (category: string): string | null => {
  const allowedCategories = ["tech", "hobby", "other"] as const;
  type AllowedCategory = (typeof allowedCategories)[number];

  if (!allowedCategories.includes(category as AllowedCategory)) {
    return "無効なカテゴリが選択されています";
  }
  return null;
};

// 表示方針チェッカー（開発用）
export const checkDisplayStrategy = (
  text: string,
): {
  isEscaped: boolean;
  recommendedDisplay: "safe" | "plain";
  warning?: string;
} => {
  const isEscaped = isAlreadyEscaped(text);

  return {
    isEscaped,
    recommendedDisplay: isEscaped ? "safe" : "plain",
    warning: isEscaped
      ? undefined
      : "生テキストです。表示前にエスケープを確認してください",
  };
};
