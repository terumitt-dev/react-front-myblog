// app/src/hooks/usePosts.ts
import { useState, useEffect } from "react";
import {
  handleStorageError,
  safeJsonParse,
} from "@/components/utils/errorHandler";

export type Post = {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt?: string;
};

type RawPost = {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt?: string;
};

/**
 * 投稿データ管理フック
 */
export const usePosts = (category: string | undefined) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadPosts = async () => {
      try {
        // 少し遅延してローディング状態を確認しやすくする
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 投稿読み込み
        const saved = localStorage.getItem("myblog-posts");
        if (isMounted) {
          if (saved) {
            const rawPosts = safeJsonParse<RawPost[]>(saved, []);
            const mapped = rawPosts
              .filter((p): p is RawPost => p && typeof p === "object")
              .map((p: RawPost) => ({
                ...p,
                id: Number(p.id),
                title: String(p.title || ""),
                content: String(p.content || ""),
                category: String(p.category || ""),
                createdAt: p.createdAt || new Date().toISOString(),
              }));
            const filtered =
              category && ["hobby", "tech", "other"].includes(category)
                ? mapped.filter((p) => p.category === category)
                : mapped;
            setPosts(filtered);
          } else {
            setPosts([]);
          }
        }
      } catch (e) {
        if (isMounted) {
          console.error("JSON parse error:", e);
          handleStorageError(e, "load category posts");
          localStorage.removeItem("myblog-posts");
          setPosts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [category]);

  return { posts, isLoading };
};
