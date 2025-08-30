// app/src/dummy/comments.ts
import type { Comment } from "./types";

export const comments: Comment[] = [
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
  {
    id: 6,
    blog_id: 3,
    user_name: "料理好き",
    comment:
      "美味しそうですね！照り焼きのタレの配合、参考にさせていただきます。",
    created_at: "2024-12-13T20:10:00.000Z",
    updated_at: "2024-12-13T20:10:00.000Z",
  },
  {
    id: 7,
    blog_id: 3,
    user_name: "グルメ太郎",
    comment: "手作り料理っていいですよね。今度きんぴらごぼうも作ってみます！",
    created_at: "2024-12-14T08:30:00.000Z",
    updated_at: "2024-12-14T08:30:00.000Z",
  },
];
