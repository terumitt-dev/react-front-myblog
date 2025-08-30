// app/src/dummy/categories.ts
import type { Category } from "./types";

export const categories: Category[] = [
  {
    id: 1,
    name: "技術",
    slug: "tech",
    description: "プログラミング、開発ツール、技術トレンドについて",
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "チュートリアル",
    slug: "tutorial",
    description: "実践的なチュートリアルとハウツー",
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    name: "雑記",
    slug: "misc",
    description: "日常的なことや思ったことなど",
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
  },
];
