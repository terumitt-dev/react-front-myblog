// app/src/pages/Admin.tsx
import Layout from "@/components/layouts/Layout";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "@/components/molecules/LogoutButton";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import { TEXT_LIMITS } from "@/constants/appConfig";
import {
  validateAndSanitize,
  validateCategory,
  sanitizeInput,
  displayTextSafe,
  displayTextPlain,
} from "@/components/utils/sanitizer";
import {
  handleStorageError,
  safeJsonParse,
} from "@/components/utils/errorHandler";
import { cn } from "@/components/utils/cn";

// 型定義 - createdAtを必須に変更
type Post = {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string; // 必須に変更
  safeTitle?: string; // XSS対策用
  safeCategory?: string; // XSS対策用
  safeDisplayContent?: string; // XSS対策用
};

const Admin = () => {
  // 状態管理
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("tech");
  const [error, setError] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  // データ読み込み
  const loadPosts = useCallback(() => {
    try {
      const storedPosts = localStorage.getItem("blog_posts");
      if (storedPosts) {
        const parsedPosts = safeJsonParse(storedPosts, []);
        // データサニタイズとバリデーション
        const validatedPosts = parsedPosts
          .filter((post: any) => {
            return (
              post &&
              typeof post.id === "number" &&
              typeof post.title === "string" &&
              typeof post.content === "string" &&
              typeof post.category === "string" &&
              validateCategory(post.category) &&
              post.title.length <= TEXT_LIMITS.TITLE_MAX_LENGTH &&
              post.content.length <= TEXT_LIMITS.CONTENT_MAX_LENGTH
            );
          })
          .map((post: any) => ({
            ...post,
            title: sanitizeInput(post.title),
            content: sanitizeInput(post.content),
            category: sanitizeInput(post.category),
            createdAt: post.createdAt || new Date().toISOString(),
            safeTitle: displayTextPlain(post.title),
            safeCategory: displayTextPlain(post.category),
            safeDisplayContent: displayTextSafe(post.content),
          }));
        setPosts(validatedPosts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("投稿読み込みエラー:", error);
      handleStorageError(error, "投稿の読み込みに失敗しました");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 開発環境での認証チェック
  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    if (isDevelopment) {
      console.warn("開発環境では認証チェックをスキップします");
      loadPosts();
      return;
    }

    // 本番環境での認証チェック（簡易版）
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    loadPosts();
  }, [loadPosts, isDevelopment]);

  // フォームリセット
  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("tech");
    setEditingPostId(null);
    setError("");
  };

  // 新規投稿/編集処理
  const handleSubmit = async () => {
    setError("");
    setIsSaving(true);

    try {
      // バリデーション
      const validation = validateAndSanitize(title, content, category);
      if (!validation.isValid) {
        setError(validation.error || "入力内容が無効です");
        return;
      }

      // データ準備
      const postData: Post = {
        id: editingPostId || Date.now(),
        title: validation.safeTitle!,
        content: validation.safeContent!,
        category: validation.safeCategory!,
        createdAt: editingPostId
          ? posts.find((p) => p.id === editingPostId)?.createdAt ||
            new Date().toISOString()
          : new Date().toISOString(),
        safeTitle: displayTextPlain(validation.safeTitle!),
        safeCategory: displayTextPlain(validation.safeCategory!),
        safeDisplayContent: displayTextSafe(validation.safeContent!),
      };

      let newPosts: Post[];
      if (editingPostId !== null) {
        // 編集モード
        newPosts = posts.map((post) =>
          post.id === editingPostId ? postData : post,
        );
      } else {
        // 新規投稿
        newPosts = [postData, ...posts];
      }

      // 保存
      localStorage.setItem("blog_posts", JSON.stringify(newPosts));
      setPosts(newPosts);
      resetForm();

      // 成功メッセージ（オプション）
      console.log(editingPostId ? "投稿を更新しました" : "投稿を作成しました");
    } catch (error) {
      console.error("投稿保存エラー:", error);
      handleStorageError(error, "投稿の保存に失敗しました");
      setError("投稿の保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  };

  // 編集開始
  const handleEdit = (post: Post) => {
    setTitle(post.title);
    setContent(post.content);
    setCategory(post.category);
    setEditingPostId(post.id);
    setError("");
    // フォームまでスクロール
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 削除処理
  const handleDelete = async (id: number) => {
    if (!confirm("この投稿を削除しますか？")) return;

    setIsDeletingId(id);

    try {
      const newPosts = posts.filter((post) => post.id !== id);
      localStorage.setItem("blog_posts", JSON.stringify(newPosts));
      setPosts(newPosts);

      // 編集中の投稿が削除された場合、フォームリセット
      if (editingPostId === id) {
        resetForm();
      }

      console.log("投稿を削除しました");
    } catch (error) {
      console.error("削除エラー:", error);
      handleStorageError(error, "投稿の削除に失敗しました");
      setError("削除に失敗しました。もう一度お試しください。");
    } finally {
      setIsDeletingId(null);
    }
  };

  // バリデーション
  const isFormValid = Boolean(
    title.trim() && content.trim() && category.trim(),
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* ヘッダー */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            管理画面
          </h1>
          <LogoutButton />
        </header>

        {/* 投稿フォーム */}
        <section
          className="mb-8 space-y-6 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          aria-labelledby="post-form-heading"
        >
          <h2
            id="post-form-heading"
            className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white"
          >
            {editingPostId !== null ? "投稿を編集" : "新しい投稿"}
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label
                htmlFor="title-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                タイトル（{title.length}/{TEXT_LIMITS.TITLE_MAX_LENGTH}文字）
              </label>
              <input
                id="title-input"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                type="text"
                value={title}
                onChange={(e) => setTitle(sanitizeInput(e.target.value))}
                placeholder="投稿のタイトルを入力"
                maxLength={TEXT_LIMITS.TITLE_MAX_LENGTH}
                disabled={isSaving}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category-select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                カテゴリ
              </label>
              <select
                id="category-select"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSaving}
                required
              >
                <option value="tech">テック</option>
                <option value="hobby">しゅみ</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="content-textarea"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                本文（{content.length}/{TEXT_LIMITS.CONTENT_MAX_LENGTH}文字）
              </label>
              <textarea
                id="content-textarea"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={8}
                value={content}
                onChange={(e) => setContent(sanitizeInput(e.target.value))}
                placeholder="投稿の内容を入力"
                maxLength={TEXT_LIMITS.CONTENT_MAX_LENGTH}
                disabled={isSaving}
                required
              />
            </div>

            {error && (
              <p
                className="text-red-600 dark:text-red-400 text-sm"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={!isFormValid || isSaving}
                className={cn(
                  "relative flex-1 px-6 py-3 rounded text-white font-medium",
                  "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
                  "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition duration-200",
                )}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    保存中...
                  </>
                ) : editingPostId !== null ? (
                  "投稿を更新"
                ) : (
                  "投稿を作成"
                )}
              </button>

              {editingPostId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSaving}
                  className={cn(
                    "px-6 py-3 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300",
                    "hover:bg-gray-50 dark:hover:bg-gray-700",
                    "focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition duration-200",
                  )}
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </section>

        {/* 投稿一覧 */}
        <section
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          aria-labelledby="posts-heading"
        >
          <h2
            id="posts-heading"
            className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4"
          >
            投稿一覧（{posts.length}件）
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" label="投稿を読み込み中..." />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-12">
              まだ投稿がありません。新しい投稿を作成してください。
            </p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                          {displayTextPlain(post.title)}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span>ID: {post.id}</span>
                          <span>•</span>
                          <span>カテゴリ: {post.category}</span>
                          <span>•</span>
                          <time dateTime={post.createdAt}>
                            {new Date(post.createdAt).toLocaleString("ja-JP")}
                          </time>
                        </div>
                      </div>
                    </div>

                    <div className="text-gray-600 dark:text-gray-300 line-clamp-3">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: displayTextSafe(post.content),
                        }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(post)}
                        className={cn(
                          "flex-1 px-4 py-2 rounded",
                          "bg-yellow-600 hover:bg-yellow-700 text-white",
                          "focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2",
                          "transition duration-200",
                        )}
                      >
                        編集
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        disabled={isDeletingId === post.id}
                        className={cn(
                          "flex-1 px-4 py-2 rounded",
                          "bg-red-600 hover:bg-red-700 text-white",
                          "focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          "transition duration-200",
                        )}
                      >
                        {isDeletingId === post.id ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-1" />
                            削除中...
                          </>
                        ) : (
                          "削除"
                        )}
                      </button>

                      <Link
                        to={`/posts/${post.id}`}
                        className={cn(
                          "flex-1 px-4 py-2 rounded text-center",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                          "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                          "transition duration-200",
                        )}
                      >
                        表示
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Admin;
