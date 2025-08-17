// app/src/components/utils/sanitizer.tsx
import DOMPurify from "dompurify";

// 強化されたエスケープ判定 - 複数パターン対応
const isAlreadyEscaped = (text: string): boolean => {
  if (!text) return false;

  // 複数パターンでエスケープ検証 - 誤判定防止
  const patterns = {
    // 基本HTMLエンティティ
    basic: /&(?:amp|lt|gt|quot|#39|#x27);/g,
    // 数値文字参照
    numeric: /&#(?:\d+|x[a-f0-9]+);/gi,
    // 名前付きエンティティ
    named: /&(?:[a-z]+|#\d+|#x[a-f\d]+);/gi,
  };

  const hasBasicEntities = patterns.basic.test(text);
  const hasNumericEntities = patterns.numeric.test(text);
  const hasNamedEntities = patterns.named.test(text);

  // ブラウザ環境でのダブルチェック - 網羅性向上
  if (typeof document !== "undefined") {
    try {
      const tempDiv = document.createElement("div");
      tempDiv.textContent = text;
      const reEscaped = tempDiv.innerHTML;

      // 既にエスケープされている場合、再エスケープで変化しない
      const isDoubleEscaped = text === reEscaped;

      return (
        (hasBasicEntities || hasNumericEntities || hasNamedEntities) &&
        !isDoubleEscaped
      );
    } catch {
      // DOM操作エラー時はパターンマッチングに依存
      return hasBasicEntities || hasNumericEntities;
    }
  }

  return hasBasicEntities || hasNumericEntities;
};

// プレーンテキスト専用表示関数 - XSS完全防止
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
    return String(text).replace(/<[^>]*>/g, ""); // 最低限のタグ除去
  }
};

// 安全表示関数 - 改良版
export const displayTextSafe = (text: string): string => {
  if (!text) return "";

  try {
    // 既にエスケープされているかチェック（強化版）
    if (isAlreadyEscaped(text)) {
      return DOMPurify.sanitize(text, {
        ALLOWED_TAGS: ["br", "p", "strong", "em", "u", "s"],
        ALLOWED_ATTR: [],
      });
    }

    // 未エスケープの場合はエスケープしてからサニタイズ
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

// 入力サニタイズ（改良版）
export const sanitizeInput = (input: string): string => {
  if (!input) return "";

  try {
    // 入力値の基本サニタイズ
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

// バリデーション関数（既存）
export const validateAndSanitize = (
  input: string,
  limits: { min: number; max: number },
): { isValid: boolean; sanitized: string; error?: string } => {
  if (!input || typeof input !== "string") {
    return { isValid: false, sanitized: "", error: "入力が必要です" };
  }

  const sanitized = sanitizeInput(input);

  if (sanitized.length < limits.min) {
    return {
      isValid: false,
      sanitized,
      error: `最低${limits.min}文字以上入力してください`,
    };
  }

  if (sanitized.length > limits.max) {
    return {
      isValid: false,
      sanitized,
      error: `${limits.max}文字以内で入力してください`,
    };
  }

  return { isValid: true, sanitized };
};

export const validateCategory = (
  category: string,
): { isValid: boolean; sanitized: string; error?: string } => {
  const allowedCategories = ["tech", "life", "hobby"];
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
