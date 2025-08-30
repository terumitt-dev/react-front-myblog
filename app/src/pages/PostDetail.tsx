// app/src/pages/PostDetail.tsx
import Layout from "@/components/layouts/Layout";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import CommentForm from "@/components/organisms/CommentForm";
import BackToHomeButton from "@/components/molecules/BackToHomeButton";
import CommentStartButton from "@/components/molecules/CommentStartButton";
import PostDetailSkeleton from "@/components/molecules/PostDetailSkeleton";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import {
  displayTextSafe,
  displayTextPlain,
} from "@/components/utils/sanitizer";
import { cn } from "@/components/utils/cn";
import {
  LAYOUT_PATTERNS,
  RESPONSIVE_SPACING,
  RESPONSIVE_TEXT,
  RESPONSIVE_FLEX,
} from "@/constants/responsive";

// Rails Blog モデルに基づく型定義
type Blog = {
  id: number;
  title: string;
  content: string;
  category: number;
  category_name: string;
  created_at: string;
  updated_at: string;
};

type Comment = {
  id: number;
  blog_id: number;
  user_name: string;
  comment: string;
  created_at: string;
  updated_at: string;
};

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const postIdRaw = Number(id);
  const postId = Number.isFinite(postIdRaw) ? postIdRaw : NaN;
  const isValidId = Number.isFinite(postId) && postId > 0;

  // ========== 全てのHooksを最初に配置 ==========
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [openCommentIds, setOpenCommentIds] = useState<number[]>([]);

  // ローディング状態
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isValidId) {
      setIsLoadingPost(false);
      return;
    }

    // MSWからブログデータを読み込み
    const loadBlogData = async () => {
      setIsLoadingPost(true);
      setError(null);

      try {
        // ブログ記事取得
        const blogResponse = await fetch(`/api/blogs/${postId}`);
        if (!blogResponse.ok) {
          throw new Error(`HTTP error! status: ${blogResponse.status}`);
        }
        const blogData = await blogResponse.json();
        setBlog(blogData.blog);

        // コメント取得
        const commentsResponse = await fetch(`/api/blogs/${postId}/comments`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData.comments);
        }
      } catch (e) {
        console.error("Failed to load blog data:", e);
        setError(e instanceof Error ? e.message : "Unknown error");
        setBlog(null);
        setComments([]);
      } finally {
        setIsLoadingPost(false);
      }
    };

    loadBlogData();
  }, [isValidId, postId]);

  // コメント一覧の最適化
  const processedComments = useMemo(() => {
    return comments.map((c) => ({
      ...c,
      displayContent:
        c.comment.length > 30 ? `${c.comment.slice(0, 30)}...` : c.comment,
    }));
  }, [comments]);

  // ========== 早期リターン：不正なID ==========
  if (!isValidId) {
    return (
      <Layout>
        <main role="main" aria-labelledby="error-title">
          <div className="p-6 text-gray-900 dark:text-white">
            <h1 id="error-title">エラー</h1>
            <p role="alert">不正な記事IDです。</p>
          </div>
        </main>
      </Layout>
    );
  }

  // ========== 早期リターン：ローディング中 ==========
  if (isLoadingPost) {
    return (
      <Layout>
        <PostDetailSkeleton />
      </Layout>
    );
  }

  // ========== 早期リターン：エラー ==========
  if (error) {
    return (
      <Layout>
        <main role="main" aria-labelledby="error-title">
          <div className="p-6 text-gray-900 dark:text-white">
            <h1 id="error-title">エラー</h1>
            <p role="alert">記事の読み込みに失敗しました: {error}</p>
          </div>
        </main>
      </Layout>
    );
  }

  // ========== 早期リターン：記事が見つからない ==========
  if (!blog) {
    return (
      <Layout>
        <main role="main" aria-labelledby="not-found-title">
          <div className="p-6 text-gray-900 dark:text-white">
            <h1 id="not-found-title">記事が見つかりません</h1>
            <p role="alert">記事が見つかりませんでした。</p>
          </div>
        </main>
      </Layout>
    );
  }

  // ========== イベントハンドラー関数の定義 ==========
  /* コメント送信 */
  const handleCommentSubmit = async (user: string, content: string) => {
    if (!user.trim() || !content.trim()) return;

    setIsSubmittingComment(true);

    try {
      const response = await fetch(`/api/blogs/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: user,
          comment: content,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // コメント一覧を再読み込み
      const commentsResponse = await fetch(`/api/blogs/${postId}/comments`);
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData.comments);
      }

      setIsWriting(false);
    } catch (error) {
      console.error("Failed to submit comment:", error);
      // エラーハンドリング（トースト通知等）
    } finally {
      setIsSubmittingComment(false);
    }
  };

  /* コメントの開閉トグル */
  const toggleComment = (commentId: number) => {
    setOpenCommentIds((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId],
    );
  };

  return (
    <Layout>
      <main
        role="main"
        aria-labelledby="post-title"
        className={cn(
          "bg-gray-100 dark:bg-gray-800 w-full rounded-xl overflow-hidden py-8",
          LAYOUT_PATTERNS.mainContainer,
        )}
      >
        {/* 2カラム */}
        <div
          className={cn(
            "grid",
            "grid-cols-1 md:grid-cols-3",
            RESPONSIVE_SPACING.gap,
          )}
        >
          {/* ===== 記事エリア ===== */}
          <article
            className={cn(
              "w-full bg-white dark:bg-gray-700 rounded-xl shadow p-6 space-y-6",
              "md:col-span-2",
            )}
            aria-labelledby="post-title"
          >
            <header>
              <h1
                id="post-title"
                className={cn(
                  `${RESPONSIVE_TEXT.heading1} font-bold mb-3 break-words text-gray-900 dark:text-white`,
                )}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: displayTextSafe(blog.title),
                  }}
                />
              </h1>
              <span
                className={cn(
                  "inline-block text-sm font-semibold",
                  "px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200",
                )}
                aria-label={`カテゴリー: ${displayTextPlain(blog.category_name)}`}
              >
                {displayTextPlain(blog.category_name)}
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <p>
                  投稿日:{" "}
                  {new Date(blog.created_at).toLocaleDateString("ja-JP")}
                </p>
                {blog.updated_at !== blog.created_at && (
                  <p>
                    更新日:{" "}
                    {new Date(blog.updated_at).toLocaleDateString("ja-JP")}
                  </p>
                )}
              </div>
              <hr
                className="mt-4 border-gray-300 dark:border-gray-600"
                role="separator"
              />
            </header>
            <div
              className={cn(
                "leading-relaxed whitespace-pre-line break-words text-gray-900 dark:text-gray-100",
              )}
              dangerouslySetInnerHTML={{
                __html: displayTextSafe(blog.content),
              }}
              role="main"
              aria-label="記事本文"
            />
          </article>

          {/* ===== コメント一覧 ===== */}
          <aside
            className={cn(
              "w-full bg-white dark:bg-gray-700 rounded-xl shadow p-6 space-y-4",
            )}
            aria-labelledby="comments-heading"
            role="complementary"
          >
            <h2
              id="comments-heading"
              className={`${RESPONSIVE_TEXT.heading2} font-semibold text-gray-900 dark:text-white`}
            >
              コメント一覧 ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <p
                className="text-gray-600 dark:text-gray-400"
                role="status"
                aria-live="polite"
              >
                コメントはまだありません。
              </p>
            ) : (
              <ul
                className="space-y-3"
                role="list"
                aria-label={`${comments.length}件のコメント`}
              >
                {processedComments.map((c) => {
                  const isOpen = openCommentIds.includes(c.id);
                  return (
                    <li key={c.id} role="listitem">
                      <button
                        type="button"
                        onClick={() => toggleComment(c.id)}
                        className={cn(
                          "cursor-pointer p-4 rounded shadow-sm text-sm w-full text-left",
                          "bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500",
                          "transition break-words focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                        )}
                        aria-expanded={isOpen}
                        aria-label={`${displayTextPlain(c.user_name)}さんのコメント${isOpen ? "（展開中）" : "（クリックで展開）"}`}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {displayTextPlain(c.user_name)}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {isOpen
                            ? displayTextPlain(c.comment)
                            : displayTextPlain(c.displayContent)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(c.created_at).toLocaleDateString("ja-JP")}
                        </p>
                        {!isOpen && c.comment.length > 30 && (
                          <span className="sr-only">
                            続きを読むにはクリックしてください
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>
        </div>

        {/* ===== ボタン列 ===== */}
        <nav
          className={cn(
            RESPONSIVE_FLEX.columnToRow,
            RESPONSIVE_SPACING.gapSmall,
            "mt-8",
          )}
          aria-label="記事関連アクション"
        >
          <CommentStartButton
            onClick={() => setIsWriting(true)}
            className="w-full sm:basis-[60%]"
            aria-expanded={isWriting}
            aria-controls={isWriting ? "comment-form" : undefined}
            disabled={isSubmittingComment}
          />
          <BackToHomeButton className="w-full sm:basis-[40%]" />
        </nav>

        {/* ===== コメントフォーム ===== */}
        {isWriting && (
          <section
            id="comment-form"
            className={cn(
              "mt-3 bg-white dark:bg-gray-700 p-3 rounded-xl shadow",
              isSubmittingComment && "opacity-50 pointer-events-none",
            )}
            aria-labelledby="comment-form-heading"
            role="region"
          >
            <h3 id="comment-form-heading" className="sr-only">
              新しいコメントを投稿
            </h3>

            {/* コメント送信中のローディング表示 */}
            {isSubmittingComment && (
              <div className="flex items-center justify-center p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <LoadingSpinner size="sm" className="mr-2" />
                <span className="text-blue-700 dark:text-blue-300 text-sm">
                  コメントを送信中...
                </span>
              </div>
            )}

            <CommentForm
              onSubmit={handleCommentSubmit}
              onCancel={() => setIsWriting(false)}
              disabled={isSubmittingComment}
            />
          </section>
        )}
      </main>
    </Layout>
  );
};

export default PostDetail;
