// app/src/components/utils/sanitizer.tsx
import DOMPurify from "dompurify";

// シンプル化されたエスケープ判定（誤判定リスク排除）
const isAlreadyEscaped = (text: string): boolean => {
  if (!text) return false;

  // シンプルな基本エンティティチェックのみ
  return /&(?:amp|lt|gt|quot|#39|#x27);/.test(text);
};

// プレーンテキスト専用表示関数（シンプル化）
export const displayTextPlain = (text: string): string => {
  if (!text) return "";

  try {
    // 常にDOMPurifyでタグ除去 → プレーンテキスト化
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

// 一貫したエスケープ→DOMPurify処理（シンプル化）
export const displayTextSafe = (text: string): string => {
  if (!text) return "";

  try {
    // 常に一貫した処理: エスケープ → DOMPurify
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

    return DOMPurify.sanitize(escaped, {
      ALLOWED_TAGS: ["br", "p", "strong", "em", "u", "s"],
      ALLOWED_ATTR: [],
    });
  } catch (error) {
    console.error("Safe display error:", error);
    return String(text).replace(/[<>&"']/g, (match) => {
      const escapeMap: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return escapeMap[match] || match;
    });
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

// 🔧 修正: 互換性バグ修正 - 古いシグネチャ維持
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

// 仕様不整合修正 - カテゴリ統一
export const validateCategory = (
  category: string,
): { isValid: boolean; sanitized: string; error?: string } => {
  // "other"を追加してUI/他コードと整合
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
