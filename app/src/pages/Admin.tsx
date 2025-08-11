// app/src/pages/Admin.tsx
import Layout from "@/components/layouts/Layout";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LogoutButton from "@/components/molecules/LogoutButton";
import { TEXT_LIMITS, UI_CONFIG } from "@/constants/appConfig";
import {
  validateAndSanitize,
  validateCategory,
  displayText,
  displayTextSafe,
} from "@/components/utils/sanitizer";
import {
  handleStorageError,
  safeJsonParse,
} from "@/components/utils/errorHandler";
import { cn } from "@/components/utils/cn";

// 型定義
type Post = {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
};

// JSONから読み込む際の型（型安全性向上）
interface RawPost {
  id: string | number;
  title: string;
  content: string;
  category: string;
  createdAt?: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("tech");
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [openPostIds, setOpenPostIds] = useState<number[]>([]);

  // ローカルストレージからの読み込み（エラーハンドリング強化）
  useEffect(() => {
    const saved = localStorage.getItem("myblog-posts");
    if (saved) {
      try {
        const rawPosts = safeJsonParse<RawPost[]>(saved, []);
        const validPosts: Post[] = rawPosts
          .filter((p): p is RawPost => p && typeof p === "object")
          .map((p: RawPost) => ({
            ...p,
            id: Number(p.id),
            createdAt: p.createdAt || new Date().toISOString(),
          }))
          .filter((p) => p.id && p.title && p.content && p.category);

        setPosts(validPosts);
      } catch (error) {
        console.error("Failed to parse posts from localStorage:", error);
        handleStorageError(error, "load posts");
        localStorage.removeItem("myblog-posts");
        setPosts([]);
      }
    }
  }, []);

  // ローカルストレージへの保存（エラーハンドリング強化）
  const saveToLocalStorage = (updatedPosts: Post[]) => {
    try {
      setPosts(updatedPosts);
      localStorage.setItem("myblog-posts", JSON.stringify(updatedPosts));
    } catch (error) {
      console.error("Failed to save posts to localStorage:", error);
      handleStorageError(error, "save posts");
      setError("投稿の保存に失敗しました。ストレージ容量を確認してください。");
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("tech");
    setEditingPostId(null);
    setError("");
  };

  const handleSubmit = () => {
    // 包括的なバリデーション
    const titleValidation = validateAndSanitize(
      title,
      TEXT_LIMITS.TITLE_MAX_LENGTH,
      "タイトル",
    );
    const contentValidation = validateAndSanitize(
      content,
      TEXT_LIMITS.CONTENT_MAX_LENGTH,
      "本文",
    );
    const categoryError = validateCategory(category);

    if (!titleValidation.isValid) {
      setError(titleValidation.error!);
      return;
    }
    if (!contentValidation.isValid) {
      setError(contentValidation.error!);
      return;
    }
    if (categoryError) {
      setError(categoryError);
      return;
    }

    try {
      if (editingPostId !== null) {
        // 編集モード
        const updated = posts.map((p) =>
          p.id === editingPostId
            ? {
                ...p,
                title: titleValidation.sanitized,
                content: contentValidation.sanitized,
                category,
              }
            : p,
        );
        saveToLocalStorage(updated);
      } else {
        // 新規投稿モード
        const newPost: Post = {
          id: Date.now(),
          title: titleValidation.sanitized,
          content: contentValidation.sanitized,
          category,
          createdAt: new Date().toISOString(),
        };
        saveToLocalStorage([...posts, newPost]);
      }

      resetForm();
    } catch (error) {
      console.error("Failed to submit post:", error);
      setError("投稿の処理中にエラーが発生しました。");
    }
  };

  const handleDelete = (id: number) => {
    try {
      const updated = posts.filter((p) => p.id !== id);
      saveToLocalStorage(updated);
    } catch (error) {
      console.error("Failed to delete post:", error);
      setError("投稿の削除に失敗しました。");
    }
  };

  const handleEdit = (post: Post) => {
    // エスケープ済みデータを編集時にプレーンテキスト化
    setTitle(displayText(post.title, true));
    setContent(displayText(post.content, true));
    setCategory(post.category);
    setEditingPostId(post.id);
    setError("");
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const togglePost = (id: number) => {
    setOpenPostIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            投稿管理（Admin）
          </h1>
          <LogoutButton onClick={handleLogout} />
        </div>

        {/* 投稿フォーム */}
        <div className="bg-gray-200 dark:bg-gray-800 rounded-xl p-6">
          <div className="space-y-4">
            {error && (
              <div
                className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="title-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                タイトル（最大100文字）
              </label>
              <input
                id="title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="記事のタイトルを入力してください"
                className="border border-gray-300 dark:border-gray-600 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                maxLength={TEXT_LIMITS.TITLE_MAX_LENGTH}
                required
                aria-describedby="title-help"
              />
              <div
                id="title-help"
                className="text-sm text-gray-500 dark:text-gray-400 mt-1"
              >
                残り{TEXT_LIMITS.TITLE_MAX_LENGTH - title.length}文字
              </div>
            </div>

            <div>
              <label
                htmlFor="content-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                本文（最大5000文字）
              </label>
              <textarea
                id="content-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="記事の本文を入力してください"
                className="border border-gray-300 dark:border-gray-600 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                maxLength={TEXT_LIMITS.CONTENT_MAX_LENGTH}
                rows={UI_CONFIG.TEXTAREA_ROWS}
                required
                aria-describedby="content-help"
              />
              <div
                id="content-help"
                className="text-sm text-gray-500 dark:text-gray-400 mt-1"
              >
                残り{TEXT_LIMITS.CONTENT_MAX_LENGTH - content.length}文字
              </div>
            </div>

            <div>
              <label
                htmlFor="category-select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                カテゴリ
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="tech">Tech</option>
                <option value="hobby">Hobby</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!title.trim() || !content.trim()}
                className={cn(
                  "px-4 py-2 rounded text-white font-medium transition",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  editingPostId !== null
                    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {editingPostId !== null ? "更新する" : "投稿を追加"}
              </button>

              {editingPostId !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className={cn(
                    "px-4 py-2 rounded text-white font-medium",
                    "bg-gray-500 hover:bg-gray-600",
                    "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
                    "transition",
                  )}
                >
                  キャンセル
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 投稿一覧 */}
        <div className="bg-gray-200 dark:bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            現在の投稿一覧（{posts.length}件）
          </h2>
          {posts.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              まだ投稿がありません。
            </p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const isOpen = openPostIds.includes(post.id);
                return (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-gray-700 rounded-xl shadow overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => togglePost(post.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl",
                        "hover:bg-gray-50 dark:hover:bg-gray-600 focus:bg-gray-50 dark:focus:bg-gray-600",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
                        "transition",
                      )}
                      aria-expanded={isOpen}
                      aria-controls={`post-content-${post.id}`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <h3 className="font-semibold text-lg break-words flex-1 text-gray-900 dark:text-white min-w-0">
                            <span
                              className="block break-words"
                              dangerouslySetInnerHTML={{
                                __html: displayTextSafe(post.title),
                              }}
                            />
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {isOpen ? "▼" : "▶"}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="whitespace-nowrap">
                            カテゴリ: {post.category}
                          </span>
                          <span className="whitespace-nowrap">
                            {post.createdAt
                              ? new Date(post.createdAt).toLocaleDateString()
                              : "日付不明"}
                          </span>
                        </div>

                        <div
                          id={`post-content-${post.id}`}
                          className="text-gray-700 dark:text-gray-300 break-words whitespace-pre-line overflow-hidden"
                        >
                          {isOpen ? (
                            <div
                              className="max-w-none break-words overflow-wrap-anywhere"
                              dangerouslySetInnerHTML={{
                                __html: displayTextSafe(post.content),
                              }}
                            />
                          ) : (
                            <div className="break-words overflow-hidden">
                              {displayText(post.content, true).length >
                              TEXT_LIMITS.PREVIEW_LENGTH
                                ? `${displayText(post.content, true).slice(0, TEXT_LIMITS.PREVIEW_LENGTH)}...`
                                : displayText(post.content, true)}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* アクション部分 */}
                    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                      <nav
                        className="flex flex-wrap gap-4"
                        aria-label="投稿操作"
                        role="toolbar"
                      >
                        <Link
                          to={`/posts/${post.id}`}
                          className={cn(
                            "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline rounded",
                            "focus:outline-none focus:ring-2",
                            "focus:ring-blue-500 focus:ring-offset-1",
                            "transition whitespace-nowrap",
                          )}
                        >
                          記事を確認 →
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEdit(post)}
                          className={cn(
                            "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline rounded",
                            "focus:outline-none focus:ring-2",
                            "focus:ring-green-500 focus:ring-offset-1",
                            "transition whitespace-nowrap",
                          )}
                          aria-label={`${displayText(post.title, true)}を編集`}
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `「${displayText(post.title, true)}」を削除しますか？`,
                              )
                            ) {
                              handleDelete(post.id);
                            }
                          }}
                          className={cn(
                            "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:underline rounded",
                            "focus:outline-none focus:ring-2",
                            "focus:ring-red-500 focus:ring-offset-1",
                            "transition whitespace-nowrap",
                          )}
                          aria-label={`${displayText(post.title, true)}を削除`}
                        >
                          削除
                        </button>
                      </nav>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
