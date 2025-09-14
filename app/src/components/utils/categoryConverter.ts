// app/src/components/utils/categoryConverter.ts
// カテゴリ変換のシンプルなユーティリティ関数
export const categoryToString = (category: number): string => {
  switch (category) {
    case 0:
      return "hobby";
    case 1:
      return "tech";
    case 2:
      return "other";
    default:
      return "other";
  }
};

export const categoryToNumber = (category: string | number): number => {
  if (typeof category === "number") return category;

  switch (category.toLowerCase()) {
    case "hobby":
    case "0":
      return 0;
    case "tech":
    case "1":
      return 1;
    case "other":
    case "2":
      return 2;
    default:
      return 0;
  }
};

// Blog型を定義
interface BlogResponse {
  id: number;
  title: string;
  content: string;
  category: string | number;
  created_at: string;
  updated_at: string;
}

// APIレスポンスを正規化（完全な型定義）
export const normalizeBlogResponse = (
  blogData: unknown,
): Omit<BlogResponse, "category"> & { category: number } => {
  const data = blogData as BlogResponse;
  return {
    ...data,
    category: categoryToNumber(data.category),
  };
};

// フォーム送信用にAPIフォーマットに変換
export const formatForApi = (category: number): string => {
  return categoryToString(category);
};
