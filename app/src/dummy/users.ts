// app/src/dummy/users.ts
import type { User } from "./types";

export const users: User[] = [
  {
    id: 1,
    username: "terumitt_dev",
    email: "terumitt@example.com",
    avatar: "https://via.placeholder.com/64",
    bio: "フルスタックエンジニア。React、Rails、TypeScriptが得意です。",
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    username: "guest_user",
    email: "guest@example.com",
    avatar: "https://via.placeholder.com/64",
    bio: "プログラミング初心者です。よろしくお願いします！",
    created_at: "2023-06-15T10:30:00.000Z",
    updated_at: "2024-01-15T14:20:00.000Z",
  },
  {
    id: 3,
    username: "tech_blogger",
    email: "blogger@example.com",
    avatar: "https://via.placeholder.com/64",
    bio: "技術ブログを書いています。",
    created_at: "2023-03-20T08:45:00.000Z",
    updated_at: "2024-02-10T16:30:00.000Z",
  },
];
