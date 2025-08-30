// app/src/dummy/comments.ts
import type { Comment } from "./types";
import { users } from "./users";

export const comments: Comment[] = [
  {
    id: 1,
    content:
      "とても参考になりました！React 19のServer Componentsを早く試してみたいです。",
    created_at: "2024-12-15T11:30:00.000Z",
    updated_at: "2024-12-15T11:30:00.000Z",
    user: users[1],
    article_id: 1,
  },
  {
    id: 2,
    content:
      "Actionsの部分がとても興味深いですね。従来のフォーム処理と比べてどの程度簡単になるのでしょうか？",
    created_at: "2024-12-15T13:45:00.000Z",
    updated_at: "2024-12-15T13:45:00.000Z",
    user: users[2],
    article_id: 1,
  },
  {
    id: 3,
    content:
      "useフックについてもっと詳しく知りたいです。サンプルコードなどあれば嬉しいです。",
    created_at: "2024-12-15T16:20:00.000Z",
    updated_at: "2024-12-15T16:20:00.000Z",
    user: users[1],
    article_id: 1,
  },
  {
    id: 4,
    content: "Union型の使い方がよく分かりました。ありがとうございます！",
    created_at: "2024-12-10T15:00:00.000Z",
    updated_at: "2024-12-10T15:00:00.000Z",
    user: users[2],
    article_id: 2,
  },
  {
    id: 5,
    content:
      "型ガードは知らなかったテクニックです。実際のプロジェクトでも使ってみます。",
    created_at: "2024-12-11T09:30:00.000Z",
    updated_at: "2024-12-11T09:30:00.000Z",
    user: users[1],
    article_id: 2,
  },
];
