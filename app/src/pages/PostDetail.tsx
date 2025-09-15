// app/src/pages/PostDetail.tsx
import Layout from "@/components/layouts/Layout";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CommentForm from "@/components/organisms/CommentForm";
import CommentList from "@/components/organisms/CommentList";
import BackToHomeButton from "@/components/molecules/BackToHomeButton";
import CommentStartButton from "@/components/molecules/CommentStartButton";
import PostDetailSkeleton from "@/components/molecules/PostDetailSkeleton";
import { cn } from "@/components/utils/cn";
import Container from "@/components/layouts/Container";
import type { BlogWithCategoryName, Comment } from "@/dummy/types";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const postId = id ? parseInt(id, 10) : null;

  // 状態管理（コンポーネント化により大幅簡素化）
  const [blog, setBlog] = useState<BlogWithCategoryName | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // データ読み込み
  useEffect(() => {
    const loadBlogData = async () => {
      if (!postId) {
        setError("記事IDが無効です");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log(
          "PostDetail: ダミーデータから読み込み開始, postId:",
          postId,
        );

        // ブログ詳細を取得
        const blogResponse = await fetch(`/api/blogs/${postId}`);
        if (!blogResponse.ok) {
          throw new Error(
            `ブログの取得に失敗しました。Status: ${blogResponse.status}`,
          );
        }

        const blogData = await blogResponse.json();
        setBlog(blogData);
        console.log("✅ ブログデータ取得成功:", blogData.title);

        // コメントを取得
        const commentsResponse = await fetch(`/api/blogs/${postId}/comments`);
        if (!commentsResponse.ok) {
          console.warn("コメントの取得に失敗しましたが、記事は表示します");
          setComments([]);
        } else {
          const commentsData = await commentsResponse.json();
          setComments(commentsData.comments || []);
          console.log(
            "✅ コメントデータ取得成功:",
            commentsData.comments?.length || 0,
            "件",
          );
        }
      } catch (err) {
        console.error("PostDetail: データ読み込みエラー:", err);
        setError(
          err instanceof Error ? err.message : "データの読み込みに失敗しました",
        );
        setBlog(null);
        setComments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogData();
  }, [postId]);

  // コメント投稿処理
  const handleCommentSubmit = async (name: string, content: string) => {
    if (!postId) return;

    setIsSubmittingComment(true);

    try {
      console.log("💬 コメント投稿開始:", { name, content });

      const response = await fetch(`/api/blogs/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: name.trim(),
          comment: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `コメントの投稿に失敗しました。Status: ${response.status}`,
        );
      }

      const result = await response.json();
      console.log("✅ コメント投稿成功:", result);

      // 楽観的更新 - MSWハンドラは新規コメントオブジェクト自体を返す
      const newComment: Comment = result;
      setComments((prevComments) => [newComment, ...prevComments]);
      setIsWriting(false);
    } catch (error) {
      console.error("❌ コメント投稿エラー:", error);
      alert("コメントの投稿に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // カテゴリー表示名の変換
  const getCategoryDisplayName = (categoryName: string) => {
    switch (categoryName) {
      case "hobby":
        return "しゅみ";
      case "tech":
        return "テック";
      case "other":
        return "その他";
      default:
        return categoryName;
    }
  };

  // カテゴリー色クラス
  const getCategoryColorClass = (categoryName: string) => {
    switch (categoryName) {
      case "hobby":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "tech":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "other":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Container size="wide" padding="section">
          <PostDetailSkeleton />
        </Container>
      </Layout>
    );
  }

  if (error || !blog) {
    return (
      <Layout>
        <Container size="wide" padding="section" className="text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8">
            <div className="flex justify-center mb-4">
              <svg
                className="h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
              記事が見つかりません
            </h1>
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error || "指定された記事が見つかりませんでした"}
            </p>
            <BackToHomeButton />
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="wide" padding="section" className="space-y-8">
        {/* メタ情報 */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-4">
            <span
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                getCategoryColorClass(blog.category_name),
              )}
            >
              {getCategoryDisplayName(blog.category_name)}
            </span>
            <time
              dateTime={blog.created_at}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              {new Date(blog.created_at).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
          <BackToHomeButton />
        </div>

        {/* メインコンテンツ - 2カラムレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム - 記事本文とコメントフォーム */}
          <div className="lg:col-span-2 space-y-6">
            {/* 記事本文 */}
            <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
              <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {blog.title}
                </h1>
              </header>

              <div className="prose prose-lg max-w-none dark:prose-invert">
                {blog.content}
              </div>
            </article>

            {/* コメントフォーム */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                コメントを投稿
              </h2>

              {isWriting ? (
                <CommentForm
                  onSubmit={handleCommentSubmit}
                  onCancel={() => setIsWriting(false)}
                  disabled={isSubmittingComment}
                />
              ) : (
                <CommentStartButton
                  onClick={() => setIsWriting(true)}
                  className="w-full"
                  aria-expanded={isWriting}
                  aria-controls={isWriting ? "comment-form" : undefined}
                  disabled={isSubmittingComment}
                />
              )}
            </div>
          </div>

          {/* 右カラム - コメント一覧 */}
          <div className="lg:col-span-1">
            <CommentList comments={comments} isDevMode={import.meta.env.DEV} />
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default PostDetail;
