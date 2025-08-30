// app/src/dummy/blogs.ts
import type { Blog } from "./types";

export const blogs: Blog[] = [
  {
    id: 1,
    title: "React 19の新機能について",
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
    category: 1, // TECH
    created_at: "2024-12-14T15:30:00.000Z",
    updated_at: "2024-12-15T10:00:00.000Z",
  },
  {
    id: 2,
    title: "TypeScriptでより安全なコードを書く方法",
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
    category: 1, // TECH
    created_at: "2024-12-09T20:15:00.000Z",
    updated_at: "2024-12-10T14:30:00.000Z",
  },
  {
    id: 3,
    title: "週末の料理作り",
    content: `# 週末の料理作り

今日は久しぶりに時間をかけて料理を作りました。

## 作ったもの

### メイン：鶏の照り焼き
鶏もも肉を使って、しっかりと焼き色をつけました。
タレは醤油、みりん、砂糖、酒でシンプルに。

### 副菜：きんぴらごぼう
ごぼうとにんじんを細切りにして、ごま油で炒めました。
最後に七味をかけるのがポイントです。

## 感想
手料理は心が落ち着きますね。普段忙しくてなかなかできませんが、
たまにはゆっくり料理する時間も大切だと思いました。`,
    category: 0, // HOBBY
    created_at: "2024-12-13T18:45:00.000Z",
    updated_at: "2024-12-13T18:45:00.000Z",
  },
  {
    id: 4,
    title: "2024年の振り返り",
    content: `# 2024年の振り返り

今年も残り僅かになりました。この1年を振り返ってみたいと思います。

## 仕事面
- 新しいプロジェクトに参加
- React, TypeScript のスキルアップ
- チームメンバーとの連携がうまくいった

## プライベート
- 読書量を増やすことができた
- 運動習慣をつけることができた
- 旅行にも行けた

## 来年の目標
- より専門性を高める
- 新しい技術にチャレンジする
- ワークライフバランスを保つ

来年もがんばります！`,
    category: 2, // OTHER
    created_at: "2024-12-20T10:00:00.000Z",
    updated_at: "2024-12-20T10:00:00.000Z",
  },
];
