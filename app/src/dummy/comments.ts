// app/src/dummy/comments.ts
import type { Comment } from "./types";

export const comments: Comment[] = [
  // ========== 記事1「React 19の新機能について」のコメント ==========
  {
    id: 1,
    blog_id: 1,
    user_name: "田中太郎",
    comment:
      "とても参考になりました！React 19のServer Componentsを早く試してみたいです。",
    created_at: "2024-12-15T11:30:00.000Z",
    updated_at: "2024-12-15T11:30:00.000Z",
  },
  {
    id: 2,
    blog_id: 1,
    user_name: "佐藤花子",
    comment:
      "Actionsの部分がとても興味深いですね。従来のフォーム処理と比べてどの程度簡単になるのでしょうか？",
    created_at: "2024-12-15T13:45:00.000Z",
    updated_at: "2024-12-15T13:45:00.000Z",
  },
  {
    id: 3,
    blog_id: 1,
    user_name: "山田次郎",
    comment:
      "useフックについてもっと詳しく知りたいです。サンプルコードなどあれば嬉しいです。",
    created_at: "2024-12-15T16:20:00.000Z",
    updated_at: "2024-12-15T16:20:00.000Z",
  },

  // ========== 記事2「TypeScriptでより安全なコードを書く方法」のコメント ==========
  {
    id: 4,
    blog_id: 2,
    user_name: "鈴木一郎",
    comment: "Union型の使い方がよく分かりました。ありがとうございます！",
    created_at: "2024-12-10T15:00:00.000Z",
    updated_at: "2024-12-10T15:00:00.000Z",
  },
  {
    id: 5,
    blog_id: 2,
    user_name: "高橋美咲",
    comment:
      "型ガードは知らなかったテクニックです。実際のプロジェクトでも使ってみます。",
    created_at: "2024-12-11T09:30:00.000Z",
    updated_at: "2024-12-11T09:30:00.000Z",
  },

  // ========== 記事3「Next.js App RouterとPages Routerの違い」のコメント ==========
  {
    id: 6,
    blog_id: 3,
    user_name: "開発者A",
    comment: "App Routerへの移行を検討していたので、とても参考になりました！",
    created_at: "2024-12-11T16:20:00.000Z",
    updated_at: "2024-12-11T16:20:00.000Z",
  },

  // ========== 記事5「週末の料理作り」のコメント ==========
  {
    id: 7,
    blog_id: 5,
    user_name: "料理好き",
    comment:
      "美味しそうですね！照り焼きのタレの配合、参考にさせていただきます。",
    created_at: "2024-12-13T20:10:00.000Z",
    updated_at: "2024-12-13T20:10:00.000Z",
  },
  {
    id: 8,
    blog_id: 5,
    user_name: "グルメ太郎",
    comment: "手作り料理っていいですよね。今度きんぴらごぼうも作ってみます！",
    created_at: "2024-12-14T08:30:00.000Z",
    updated_at: "2024-12-14T08:30:00.000Z",
  },

  // ========== 記事6「初心者向けカメラ撮影のコツ」のコメント ==========
  {
    id: 9,
    blog_id: 6,
    user_name: "写真初心者",
    comment: "三分割法、早速試してみます！分かりやすい説明でした。",
    created_at: "2024-12-10T19:45:00.000Z",
    updated_at: "2024-12-10T19:45:00.000Z",
  },

  // ========== 記事10「最近のお気に入りカフェ紹介」のコメント ==========
  {
    id: 10,
    blog_id: 10,
    user_name: "カフェ巡り",
    comment: "渋谷のカフェ、今度行ってみます！手作りスコーンが気になります。",
    created_at: "2024-12-05T20:15:00.000Z",
    updated_at: "2024-12-05T20:15:00.000Z",
  },
];
