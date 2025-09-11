// app/src/components/utils/sanitizer.ts
import DOMPurify from "dompurify";

// プレーンテキスト専用表示関数（XSS完全防止）
export const displayTextPlain = (text: string): string => {
  if (!text) return "";

  try {
    // DOMPurifyでHTMLタグを完全除去
    const cleanText = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });

    // ブラウザのDOMを使ってHTMLエンティティをデコード
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cleanText;
    return tempDiv.textContent || tempDiv.innerText || "";
  } catch (error) {
    console.error("Plain text conversion error:", error);
    // フォールバック：正規表現でHTMLタグとエンティティを処理
    return String(text)
      .replace(/<[^>]*>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'");
  }
};

// XSSサニタイズ仕様統一 - 安全なHTMLタグのみ許可
export const displayTextSafe = (text: string): string => {
  if (!text) return "";

  try {
    // DOMPurifyでサニタイズ（基本的なHTMLタグのみ許可）
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
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
      ],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      // セキュリティ強化オプション
      SANITIZE_DOM: true,
      SANITIZE_NAMED_PROPS: true,
      FORBID_CONTENTS: ["script", "style"],
      FORBID_TAGS: [
        "script",
        "object",
        "embed",
        "base",
        "link",
        "meta",
        "style",
      ],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    });
  } catch (error) {
    console.error("Safe display error:", error);
    // フォールバック: プレーンテキスト化
    return displayTextPlain(text);
  }
};

// 入力サニタイズ（完全にプレーンテキスト化）
export const sanitizeInput = (input: string): string => {
  if (!input) return "";

  try {
    // 入力値は完全にプレーンテキスト化
    const sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });

    return sanitized.trim();
  } catch (error) {
    console.error("Input sanitization error:", error);
    // フォールバック処理
    return String(input)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
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

// カテゴリバリデーション
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

// limits形式対応のバリデーション関数
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
