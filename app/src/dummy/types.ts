// app/src/dummy/types.ts
// Rails スキーマに基づく型定義

// 管理者情報（Devise使用）
export interface Admin {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

// カテゴリ（enumの値）
export enum BlogCategory {
  HOBBY = 0,
  TECH = 1,
  OTHER = 2,
}

// カテゴリ表示名のマッピング
export const CATEGORY_NAMES: Record<BlogCategory, string> = {
  [BlogCategory.HOBBY]: "hobby",
  [BlogCategory.TECH]: "tech",
  [BlogCategory.OTHER]: "other",
};

// ブログ記事
export interface Blog {
  id: number;
  title: string;
  content: string;
  category: BlogCategory;
  created_at: string;
  updated_at: string;
}

// コメント
export interface Comment {
  id: number;
  blog_id: number;
  user_name: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

// API レスポンス用の Blog（カテゴリ名を含む）
export interface BlogWithCategoryName extends Omit<Blog, "category"> {
  category: BlogCategory;
  category_name: string;
}
