// app/src/pages/PostDetail.tsx
import Layout from "@/components/layouts/Layout";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CommentForm from "@/components/organisms/CommentForm";
import BackToHomeButton from "@/components/molecules/BackToHomeButton";
import CommentStartButton from "@/components/molecules/CommentStartButton";

// シンプルなcn関数（shadcn/uiパターンを参考）
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

type Post = {
  id: number;
  title: string;
  content: string;
  category: string;
};

type Comment = {
  id: number;
  user: string;
  content: string;
};

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const isValidId = Number.isFinite(postId) && postId > 0;

  if (!isValidId) {
    return <div className="p-6">不正な記事IDです。</div>;
  }

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [openCommentIds, setOpenCommentIds] = useState<number[]>([]);

  /* 投稿とコメントを読み込む */
  useEffect(() => {
    const savedPosts = localStorage.getItem("myblog-posts");
    if (savedPosts) {
      try {
        const posts: Post[] = JSON.parse(savedPosts);
        setPost(posts.find((p) => p.id === postId) ?? null);
      } catch (e) {
        console.error("Failed to parse posts from localStorage:", e);
        localStorage.removeItem("myblog-posts");
        setPost(null);
      }
    }

    const storedComments = localStorage.getItem(`myblog-comments-${postId}`);
    if (storedComments) {
      try {
        setComments(JSON.parse(storedComments));
      } catch (e) {
        console.error("Failed to parse comments from localStorage:", e);
        localStorage.removeItem(`myblog-comments-${postId}`);
        setComments([]);
      }
    }
  }, [postId]);

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
    localStorage.setItem(`myblog-comments-${postId}`, JSON.stringify(updated));
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

  if (!post) return <div className="p-6">記事が見つかりませんでした。</div>;

  return (
    <Layout>
      <div
        className={cn(
          "bg-[#D9D9D9] max-w-5xl w-full mx-auto rounded-xl overflow-hidden",
          "px-4 sm:px-6 py-8",
        )}
      >
        {/* 2カラム */}
        <div className={cn("grid gap-8", "grid-cols-1 md:grid-cols-3")}>
          {/* ===== 記事エリア ===== */}
          <article
            className={cn(
              "w-full bg-white rounded-xl shadow p-6 space-y-6",
              "md:col-span-2",
            )}
          >
            <header>
              <h1 className={cn("text-3xl font-bold mb-3 break-words")}>
                {post.title}
              </h1>
              <span
                className={cn(
                  "inline-block text-sm font-semibold",
                  "px-3 py-1 rounded bg-gray-200",
                )}
              >
                {post.category}
              </span>
              <hr className="mt-4" />
            </header>
            <div
              className={cn("leading-relaxed whitespace-pre-line break-words")}
            >
              {post.content}
            </div>
          </article>

          {/* ===== コメント一覧 ===== */}
          <section
            className={cn("w-full bg-white rounded-xl shadow p-6 space-y-4")}
          >
            <h2 className="text-xl font-semibold">コメント一覧</h2>

            {comments.length === 0 ? (
              <p className="text-gray-600">コメントはまだありません。</p>
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
                        "bg-gray-50 hover:bg-gray-100",
                        "transition break-words",
                      )}
                    >
                      <p className="font-semibold">{c.user}</p>
                      <p className="text-gray-700 mt-1">
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
          <div className={cn("mt-3 bg-white p-3 rounded-xl shadow")}>
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
