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
} from "@/components/utils/sanitizer";
import { cn } from "@/components/utils/cn";
import { useAuthenticatedApi } from "@/api/client";
import type { BlogWithCategoryName } from "@/dummy/types";
import {
  categoryToString,
  normalizeBlogResponse,
} from "@/components/utils/categoryConverter";

// ========== localStorage削除：型定義の更新 ==========
type BlogPost = {
  id: number;
  title: string;
  content: string;
  category: number;
  created_at: string;
  updated_at: string;
};

const Admin = () => {
  const { blogsApi } = useAuthenticatedApi();

  // ========== localStorage削除：状態管理の簡素化 ==========
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("0"); // hobby=0, tech=1, other=2
  const [error, setError] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  // 開発環境チェック
  const isDevelopment = import.meta.env.DEV;

  // ========== localStorage削除：ダミーデータからAPI経由で読み込み ==========
  const loadPosts = useCallback(async () => {
    try {
      const response = await blogsApi.getAll({ limit: 100 });
      if (response.error) {
        throw new Error(response.error);
      }

      const data: { blogs?: BlogWithCategoryName[] } = response.data || {};

      // BlogWithCategoryNameをBlogPostに変換し、安全な値を追加
      const blogPosts: BlogPost[] = (data.blogs || []).map(
        (blog: BlogWithCategoryName) => ({
          id: blog.id,
          title: blog.title,
          category: blog.category,
          content: blog.content,
          created_at: blog.created_at,
          updated_at: blog.updated_at,
        }),
      );

      setPosts(blogPosts);
    } catch (error) {
      console.error("❌ Admin: ダミーデータ読み込みエラー:", error);
      setError("投稿の読み込みに失敗しました");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [blogsApi]);

  useEffect(() => {
    if (isDevelopment) {
      loadPosts();
      return;
    }

    // 本番環境では認証をチェック（認証システムが実装された場合）
    console.warn("🔐 本番環境: 認証システムが必要です");
    setError("本番環境では認証システムが必要です");
    setIsLoading(false);
  }, [isDevelopment, loadPosts]);

  // カテゴリー表示名変換
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

  const getCategoryName = (categoryValue: number) => {
    switch (categoryValue) {
      case 0:
        return "hobby";
      case 1:
        return "tech";
      case 2:
        return "other";
      default:
        return "other";
    }
  };

  // バリデーション
  const validateForm = () => {
    const titleValidation = validateAndSanitize(
      title,
      TEXT_LIMITS.TITLE_MAX_LENGTH,
      "タイトル",
    );
    const contentValidation = validateAndSanitize(
      content,
      TEXT_LIMITS.CONTENT_MAX_LENGTH,
      "内容",
    );
    const categoryValidation = validateCategory(
      getCategoryName(parseInt(category)),
    );

    if (!titleValidation.isValid) {
      setError(titleValidation.error || "タイトルが無効です");
      return null;
    }

    if (!contentValidation.isValid) {
      setError(contentValidation.error || "内容が無効です");
      return null;
    }

    if (!categoryValidation.isValid) {
      setError(categoryValidation.error || "カテゴリが無効です");
      return null;
    }

    return {
      sanitizedTitle: titleValidation.sanitized,
      sanitizedContent: contentValidation.sanitized,
      sanitizedCategory: parseInt(category),
    };
  };

  // ========== localStorage削除：投稿作成処理の変更 ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = validateForm();
    if (!validation) return;

    const { sanitizedTitle, sanitizedContent, sanitizedCategory } = validation;

    setIsSaving(true);

    try {
      if (editingPostId) {
        // 編集処理の実装
        const updateData = {
          title: sanitizedTitle,
          content: sanitizedContent,
          category: categoryToString(sanitizedCategory), // 型安全な文字列化
        };

        // 認証付きAPIクライアントで更新
        const response = await blogsApi.update(editingPostId, updateData);

        if (response.error) {
          throw new Error(response.error);
        }

        const updatedBlog = normalizeBlogResponse(response.data);

        // フロントエンドの状態を更新
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === editingPostId
              ? {
                  ...post,
                  title: updatedBlog.title || sanitizedTitle,
                  content: updatedBlog.content || sanitizedContent,
                  category: updatedBlog.category || sanitizedCategory,
                  updated_at:
                    updatedBlog.updated_at || new Date().toISOString(),
                }
              : post,
          ),
        );
      } else {
        // 新規作成処理
        const newPostData = {
          title: sanitizedTitle,
          category: categoryToString(sanitizedCategory), // 型安全な文字列化
          content: sanitizedContent,
        };

        // 認証付きAPIクライアントで投稿
        const response = await blogsApi.create(newPostData);

        if (response.error) {
          throw new Error(response.error);
        }

        // APIレスポンスの正しいBlogオブジェクトを使用
        const createdBlog = normalizeBlogResponse(response.data);

        const newPost: BlogPost = {
          // APIが返す正しいIDを使用
          id: createdBlog.id,
          title: createdBlog.title,
          content: createdBlog.content,
          category: createdBlog.category,
          created_at: createdBlog.created_at,
          updated_at: createdBlog.updated_at,
        };

        setPosts((prevPosts) => [newPost, ...prevPosts]);
      }

      resetForm();
    } catch (error) {
      console.error("❌ Admin: 投稿保存エラー:", error);
      setError("投稿の保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  };

  // ========== localStorage削除：投稿削除処理の変更 ==========
  const handleDelete = async (id: number) => {
    if (!window.confirm("この投稿を削除してもよろしいですか？")) {
      return;
    }

    setIsDeletingId(id);

    try {
      // 認証付きAPIクライアントで削除
      const response = await blogsApi.delete(id);

      if (response.error) {
        throw new Error(response.error);
      }

      // フロントエンドの状態から削除
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));

      // 編集中の投稿が削除された場合、フォームリセット
      if (editingPostId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("❌ Admin: 投稿削除エラー:", error);
      setError("投稿の削除に失敗しました");
    } finally {
      setIsDeletingId(null);
    }
  };

  // フォームリセット
  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("0");
    setEditingPostId(null);
    setError("");
  };

  // 編集開始
  const startEditing = (post: BlogPost) => {
    setTitle(post.title);
    setContent(post.content);
    setCategory(post.category.toString());
    setEditingPostId(post.id);
    setError("");
  };

  // カテゴリー色クラス
  const getCategoryColorClass = (categoryValue: number) => {
    switch (categoryValue) {
      case 0: // hobby
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 1: // tech
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 2: // other
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" label="投稿を読み込み中..." />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* ヘッダー */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            管理画面
            {isDevelopment && (
              <span className="text-sm font-normal text-yellow-600 dark:text-yellow-400 ml-2">
                (開発環境)
              </span>
            )}
          </h1>
          <div className="flex gap-2">
            <Link
              to="/"
              className="px-4 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
            >
              ← ホームに戻る
            </Link>
            <LogoutButton />
          </div>
        </header>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isDevelopment && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">
              ⚠️
              開発環境：投稿データはページリロードで初期化されます（localStorage使用なし）
            </p>
          </div>
        )}

        {/* 投稿フォーム */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2
            id="post-form-heading"
            className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white"
          >
            {editingPostId ? "投稿を編集" : "新しい投稿を作成"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* タイトル入力 */}
            <div>
              <label
                htmlFor="title-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                タイトル
              </label>
              <input
                id="title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="投稿のタイトルを入力してください"
                maxLength={TEXT_LIMITS.TITLE_MAX_LENGTH}
                required
                disabled={isSaving}
              />
              <p className="mt-1 text-sm text-gray-500">
                {sanitizeInput(title).length}/{TEXT_LIMITS.TITLE_MAX_LENGTH}文字
              </p>
            </div>

            {/* カテゴリー選択 */}
            <div>
              <label
                htmlFor="category-select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                カテゴリー
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                disabled={isSaving}
              >
                <option value="0">しゅみ</option>
                <option value="1">テック</option>
                <option value="2">その他</option>
              </select>
            </div>

            {/* 内容入力 */}
            <div>
              <label
                htmlFor="content-textarea"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                内容
              </label>
              <textarea
                id="content-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="投稿の内容を入力してください（Markdownが使用できます）"
                maxLength={TEXT_LIMITS.CONTENT_MAX_LENGTH}
                required
                disabled={isSaving}
              />
              <p className="mt-1 text-sm text-gray-500">
                {sanitizeInput(content).length}/{TEXT_LIMITS.CONTENT_MAX_LENGTH}
                文字
              </p>
            </div>

            {/* 送信ボタン */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSaving || !title.trim() || !content.trim()}
                className={cn(
                  "px-6 py-3 rounded-md font-medium transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  isSaving || !title.trim() || !content.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
                )}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    {editingPostId ? "更新中..." : "投稿中..."}
                  </div>
                ) : editingPostId ? (
                  "投稿を更新"
                ) : (
                  "投稿を作成"
                )}
              </button>

              {editingPostId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSaving}
                  className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </section>

        {/* 投稿一覧 */}
        <section>
          <h2
            id="posts-heading"
            className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4"
          >
            投稿一覧 ({posts.length}件)
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                まだ投稿がありません。最初の投稿を作成してみませんか？
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    {/* カテゴリーバッジ */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          getCategoryColorClass(post.category),
                        )}
                      >
                        {getCategoryDisplayName(getCategoryName(post.category))}
                      </span>
                      <time className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(post.created_at).toLocaleDateString("ja-JP")}
                      </time>
                    </div>

                    {/* タイトル */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* 内容プレビュー */}
                    <div className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                      {post.content.length > 100
                        ? post.content.substring(0, 100) + "..."
                        : post.content}
                    </div>

                    {/* アクションボタン */}
                    <div className="flex gap-2">
                      <Link
                        to={`/posts/${post.id}`}
                        className="px-3 py-1.5 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                      >
                        表示
                      </Link>
                      <button
                        onClick={() => startEditing(post)}
                        disabled={isSaving}
                        className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors disabled:opacity-50"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={isDeletingId === post.id}
                        className="px-3 py-1.5 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        {isDeletingId === post.id ? "削除中..." : "削除"}
                      </button>
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
