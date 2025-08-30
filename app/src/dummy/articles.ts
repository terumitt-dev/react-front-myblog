// app/src/dummy/articles.tss
import type { Article } from "./types";
import { users } from "./users";
import { categories } from "./categories";
import { tags } from "./tags";

export const articles: Article[] = [
  {
    id: 1,
    title: "React 19の新機能について",
    slug: "react-19-new-features",
    content: `# React 19の新機能について

React 19がリリースされ、多くの新機能が追加されました。

## 主な新機能

### 1. Server Components
サーバーサイドでレンダリングされるコンポーネントが正式にサポートされました。

### 2. Actions
フォームの処理がより簡単になりました。

### 3. Use Hook
新しいuseフックが追加され、Promiseを直接扱えるようになりました。

## まとめ
React 19は開発者体験を大幅に向上させる素晴らしいアップデートです。`,
    excerpt:
      "React 19の新機能について詳しく解説します。Server Components、Actions、新しいuseフックなど。",
    featured_image: "https://via.placeholder.com/800x400",
    published: true,
    published_at: "2024-12-15T10:00:00.000Z",
    created_at: "2024-12-14T15:30:00.000Z",
    updated_at: "2024-12-15T10:00:00.000Z",
    user: users[0],
    category: categories[0],
    tags: [tags[0], tags[1]],
    comments_count: 3,
  },
  {
    id: 2,
    title: "TypeScriptでより安全なコードを書く方法",
    slug: "typescript-safer-code",
    content: `# TypeScriptでより安全なコードを書く方法

TypeScriptを使ってより安全で保守性の高いコードを書くためのベストプラクティスをご紹介します。

## 型定義のポイント

### 1. strictモードを有効にする
\`\`\`json
{
  "compilerOptions": {
    "strict": true
  }
}
\`\`\`

### 2. Union型を活用する
\`\`\`typescript
type Status = 'loading' | 'success' | 'error';
\`\`\`

### 3. 型ガードを使う
\`\`\`typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
\`\`\`

## まとめ
これらのテクニックを使うことで、より安全なTypeScriptコードが書けるようになります。`,
    excerpt:
      "TypeScriptでより安全なコードを書くためのベストプラクティスを紹介します。",
    featured_image: "https://via.placeholder.com/800x400",
    published: true,
    published_at: "2024-12-10T14:30:00.000Z",
    created_at: "2024-12-09T20:15:00.000Z",
    updated_at: "2024-12-10T14:30:00.000Z",
    user: users[0],
    category: categories[1],
    tags: [tags[1]],
    comments_count: 5,
  },
];
