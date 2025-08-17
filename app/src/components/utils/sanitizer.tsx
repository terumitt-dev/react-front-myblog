// app/src/components/utils/sanitizer.tsx
import DOMPurify from "dompurify";

// プレーンテキスト専用表示関数（XSS完全防止）
export const displayTextPlain = (text: string): string => {
  if (!text) return "";

  try {
    // HTMLタグを完全除去してプレーンテキスト化
    const cleanText = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });

    // HTMLエンティティをデコード
    if (typeof document !== "undefined") {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = cleanText;
      return tempDiv.textContent || tempDiv.innerText || "";
    }

    // サーバーサイド用フォールバック
    return cleanText
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'");
  } catch (error) {
    console.error("Plain text conversion error:", error);
    return String(text).replace(/<[^>]*>/g, "");
  }
};

// XSSサニタイズ仕様統一 - DOMPurifyのみ使用
export const displayTextSafe = (text: string): string => {
  if (!text) return "";

  try {
    // DOMPurifyのみでサニタイズ（二重エスケープ防止）
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [
        "br",
        "p",
        "strong",
        "em",
        "u",
        "s",
        "blockquote",
        "code",
        "pre",
      ],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  } catch (error) {
    console.error("Safe display error:", error);
    // フォールバック: プレーンテキスト化
    return displayTextPlain(text);
  }
};

// 入力サニタイズ
export const sanitizeInput = (input: string): string => {
  if (!input) return "";

  try {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    }).trim();
  } catch (error) {
    console.error("Input sanitization error:", error);
    return String(input)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .trim();
  }
};

// バリデーション関数（互換性維持）
export const validateAndSanitize = (
  input: string,
  maxLength: number,
  fieldName: string = "入力値",
): { isValid: boolean; sanitized: string; error?: string } => {
  if (!input || typeof input !== "string") {
    return { isValid: false, sanitized: "", error: `${fieldName}が必要です` };
  }

  const sanitized = sanitizeInput(input);

  if (sanitized.length === 0) {
    return {
      isValid: false,
      sanitized,
      error: `${fieldName}を入力してください`,
    };
  }

  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      sanitized,
      error: `${fieldName}は${maxLength}文字以内で入力してください`,
    };
  }

  return { isValid: true, sanitized };
};

// カテゴリバリデーション（仕様統一）
export const validateCategory = (
  category: string,
): { isValid: boolean; sanitized: string; error?: string } => {
  const allowedCategories = ["tech", "hobby", "other"];
  const sanitized = sanitizeInput(category);

  if (!allowedCategories.includes(sanitized)) {
    return {
      isValid: false,
      sanitized,
      error: "無効なカテゴリです",
    };
  }

  return { isValid: true, sanitized };
};

// 新しいバリデーション関数（limits形式対応）
export const validateWithLimits = (
  input: string,
  limits: { min: number; max: number },
  fieldName: string = "入力値",
): { isValid: boolean; sanitized: string; error?: string } => {
  if (!input || typeof input !== "string") {
    return { isValid: false, sanitized: "", error: `${fieldName}が必要です` };
  }

  const sanitized = sanitizeInput(input);

  if (sanitized.length < limits.min) {
    return {
      isValid: false,
      sanitized,
      error: `${fieldName}は最低${limits.min}文字以上入力してください`,
    };
  }

  if (sanitized.length > limits.max) {
    return {
      isValid: false,
      sanitized,
      error: `${fieldName}は${limits.max}文字以内で入力してください`,
    };
  }

  return { isValid: true, sanitized };
};
