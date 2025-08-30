// app/src/dummy/types.ts
// ユーザー情報
export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

// カテゴリ
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// タグ
export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// 記事
export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  user: User;
  category: Category;
  tags: Tag[];
  comments_count: number;
}

// コメント
export interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: User;
  article_id: number;
}
