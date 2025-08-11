// app/src/pages/PostDetail.tsx
import Layout from "@/components/layouts/Layout";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CommentForm from "@/components/organisms/CommentForm";
import BackToHomeButton from "@/components/molecules/BackToHomeButton";
import CommentStartButton from "@/components/molecules/CommentStartButton";
import { displayTextSafe } from "@/components/utils/sanitizer";
import { safeJsonParse } from "@/components/utils/errorHandler";

// シンプルなcn関数（shadcn/uiパターンを参考）
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

type Post = {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
};

// JSONから読み込む際の型（idが文字列の場合もある）
interface RawPost {
  id: string | number;
  title: string;
  content: string;
  category: string;
  createdAt?: string;
}

type Comment = {
  id: number;
  user: string;
  content: string;
};

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const postIdRaw = Number(id);
  const postId = Number.isFinite(postIdRaw) ? postIdRaw : NaN;
  const isValidId = Number.isFinite(postId) && postId > 0;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [openCommentIds, setOpenCommentIds] = useState<number[]>([]);
  const commentStorageKey = `myblog-comments-${postId}`;

  useEffect(() => {
    if (!isValidId) return;

    const savedPosts = localStorage.getItem("myblog-posts");
    if (savedPosts) {
      try {
        const rawPosts = safeJsonParse<RawPost[]>(savedPosts, []);
        const posts: Post[] = rawPosts.map((p: RawPost) => ({
          ...p,
          id: Number(p.id),
          createdAt: p.createdAt || new Date().toISOString(),
        }));
        setPost(posts.find((p) => p.id === postId) ?? null);
      } catch (e) {
        console.error("Failed to parse posts from localStorage:", e);
        localStorage.removeItem("myblog-posts");
        setPost(null);
      }
    }

    const storedComments = localStorage.getItem(commentStorageKey);
    if (storedComments) {
      try {
        const parsedComments = safeJsonParse<Comment[]>(storedComments, []);
        setComments(parsedComments);
      } catch (e) {
        console.error("Failed to parse comments from localStorage:", e);
        localStorage.removeItem(commentStorageKey);
        setComments([]);
      }
    }
  }, [isValidId, postId, commentStorageKey]);

  if (!isValidId) {
    return (
      <div className="p-6 text-gray-900 dark:text-white">
        不正な記事IDです。
      </div>
    );
  }

  /* コメント送信 */
  const handleCommentSubmit = (user: string, content: string) => {
    if (!user.trim() || !content.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      user,
      content,
    };
    const updated = [...comments, newComment];
    setComments(updated);
    localStorage.setItem(commentStorageKey, JSON.stringify(updated));
    setIsWriting(false);
  };

  /* コメントの開閉トグル */
  const toggleComment = (commentId: number) => {
    setOpenCommentIds((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId],
    );
  };

  if (!post)
    return (
      <div className="p-6 text-gray-900 dark:text-white">
        記事が見つかりませんでした。
      </div>
    );

  return (
    <Layout>
      <div
        className={cn(
          "bg-gray-100 dark:bg-gray-800 max-w-5xl w-full mx-auto rounded-xl overflow-hidden",
          "px-4 sm:px-6 py-8",
        )}
      >
        {/* 2カラム */}
        <div className={cn("grid gap-8", "grid-cols-1 md:grid-cols-3")}>
          {/* ===== 記事エリア ===== */}
          <article
            className={cn(
              "w-full bg-white dark:bg-gray-700 rounded-xl shadow p-6 space-y-6",
              "md:col-span-2",
            )}
          >
            <header>
              <h1
                className={cn(
                  "text-3xl font-bold mb-3 break-words text-gray-900 dark:text-white",
                )}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: displayTextSafe(post.title),
                  }}
                />
              </h1>
              <span
                className={cn(
                  "inline-block text-sm font-semibold",
                  "px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200",
                )}
              >
                {post.category}
              </span>
              <hr className="mt-4 border-gray-300 dark:border-gray-600" />
            </header>
            <div
              className={cn(
                "leading-relaxed whitespace-pre-line break-words text-gray-900 dark:text-gray-100",
              )}
              dangerouslySetInnerHTML={{
                __html: displayTextSafe(post.content),
              }}
            />
          </article>

          {/* ===== コメント一覧 ===== */}
          <section
            className={cn(
              "w-full bg-white dark:bg-gray-700 rounded-xl shadow p-6 space-y-4",
            )}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              コメント一覧
            </h2>

            {comments.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                コメントはまだありません。
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => {
                  const isOpen = openCommentIds.includes(c.id);
                  return (
                    // biome-ignore lint/a11y/useSemanticElements: <explanation>
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleComment(c.id)}
                      className={cn(
                        "cursor-pointer p-4 rounded shadow-sm text-sm w-full text-left",
                        "bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500",
                        "transition break-words",
                      )}
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {c.user}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        {isOpen
                          ? c.content
                          : c.content.length > 30
                            ? `${c.content.slice(0, 30)}...`
                            : c.content}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ===== ボタン列 ===== */}
        <div className={cn("flex gap-4 mt-8", "flex-col sm:flex-row")}>
          <CommentStartButton
            onClick={() => setIsWriting(true)}
            className="w-full sm:basis-[60%]"
          />
          <BackToHomeButton className="w-full sm:basis-[40%]" />
        </div>

        {/* ===== コメントフォーム ===== */}
        {isWriting && (
          <div
            className={cn(
              "mt-3 bg-white dark:bg-gray-700 p-3 rounded-xl shadow",
            )}
          >
            <CommentForm
              onSubmit={handleCommentSubmit}
              onCancel={() => setIsWriting(false)}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PostDetail;
