// app/src/pages/Admin.tsx
import Layout from "@/components/layouts/Layout";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "@/components/molecules/LogoutButton";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import { TEXT_LIMITS } from "@/constants/appConfig";
import { FORM_STYLES } from "@/components/utils/styles";
import {
  validateAndSanitize,
  validateCategory,
  displayTextSafe,
} from "@/components/utils/sanitizer";
import {
  handleStorageError,
  safeJsonParse,
} from "@/components/utils/errorHandler";
import { cn } from "@/components/utils/cn";
import {
  LAYOUT_PATTERNS,
  RESPONSIVE_SPACING,
  RESPONSIVE_TEXT,
  RESPONSIVE_FLEX,
} from "@/constants/responsive";

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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("tech");
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [openPostIds, setOpenPostIds] = useState<number[]>([]);

  // ローディング状態
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

  // テキスト切り詰めヘルパー関数
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  // ローカルストレージからの読み込み（エラーハンドリング強化）
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        // 少し遅延してローディング状態を確認しやすくする
        await new Promise((resolve) => setTimeout(resolve, 500));

        const saved = localStorage.getItem("myblog-posts");
        if (saved) {
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
        }
      } catch (error) {
        console.error("Failed to parse posts from localStorage:", error);
        handleStorageError(error, "load posts");
        localStorage.removeItem("myblog-posts");
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
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

  const handleSubmit = useCallback(async () => {
    setIsSaving(true);
    setError("");

    try {
      // 少し遅延して保存処理を模擬
      await new Promise((resolve) => setTimeout(resolve, 800));

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
      console.error("Failed to save post:", error);
      setError("投稿の保存中にエラーが発生しました。");
    } finally {
      setIsSaving(false);
    }
  }, [title, content, category, editingPostId, posts]);

  const handleEdit = (post: Post) => {
    setTitle(post.title);
    setContent(post.content);
    setCategory(post.category);
    setEditingPostId(post.id);
    setError("");
  };

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("本当に削除しますか？")) return;

      setDeletingPostId(id);
      try {
        // 削除処理の遅延
        await new Promise((resolve) => setTimeout(resolve, 600));

        const filtered = posts.filter((p) => p.id !== id);
        saveToLocalStorage(filtered);

        // 編集中の投稿が削除された場合はフォームをリセット
        if (editingPostId === id) {
          resetForm();
        }
      } catch (error) {
        console.error("Failed to delete post:", error);
        setError("投稿の削除中にエラーが発生しました。");
      } finally {
        setDeletingPostId(null);
      }
    },
    [posts, editingPostId],
  );

  const togglePost = (postId: number) => {
    setOpenPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };

  // パフォーマンス最適化のためのメモ化
  const processedPosts = useMemo(() => {
    return posts.map((post) => ({
      ...post,
      displayTitle: truncateText(post.title, 50),
      displayContent: truncateText(post.content, 100),
    }));
  }, [posts]);

  const sortedPosts = useMemo(() => {
    return processedPosts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [processedPosts]);

  const isDisabled = !title.trim() || !content.trim() || isSaving;

  return (
    <Layout>
      <main className={`${LAYOUT_PATTERNS.mainContainer} space-y-8`}>
        {/* ヘッダー */}
        <header className={cn(RESPONSIVE_FLEX.between, "mb-6")}>
          <h1 className={`${RESPONSIVE_TEXT.heading1} font-bold`}>管理画面</h1>
          <LogoutButton />
        </header>

        {error && (
          <div
            className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* 投稿フォーム */}
        <section
          className={`bg-white dark:bg-gray-800 rounded-xl shadow ${RESPONSIVE_SPACING.section}`}
          aria-labelledby="form-heading"
        >
          <h2
            id="form-heading"
            className={`${RESPONSIVE_TEXT.heading2} font-semibold mb-4`}
          >
            {editingPostId !== null ? "投稿を編集" : "新しい投稿"}
          </h2>

          <div className="space-y-4">
            {/* タイトル */}
            <div className={FORM_STYLES.container}>
              <label htmlFor="title-input" className={FORM_STYLES.label}>
                タイトル（{title.length}/{TEXT_LIMITS.TITLE_MAX_LENGTH}文字）
              </label>
              <input
                id="title-input"
                className={FORM_STYLES.input}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="投稿のタイトルを入力"
                maxLength={TEXT_LIMITS.TITLE_MAX_LENGTH}
                disabled={isSaving}
                required
              />
            </div>

            {/* 本文 */}
            <div className={FORM_STYLES.container}>
              <label htmlFor="content-textarea" className={FORM_STYLES.label}>
                本文（{content.length}/{TEXT_LIMITS.CONTENT_MAX_LENGTH}文字）
              </label>
              <textarea
                id="content-textarea"
                className={FORM_STYLES.input}
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="投稿の内容を入力"
                maxLength={TEXT_LIMITS.CONTENT_MAX_LENGTH}
                disabled={isSaving}
                required
              />
            </div>

            {/* カテゴリ */}
            <div className={FORM_STYLES.container}>
              <label htmlFor="category-select" className={FORM_STYLES.label}>
                カテゴリ
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                disabled={isSaving}
                required
              >
                <option value="tech">テック</option>
                <option value="hobby">しゅみ</option>
                <option value="other">その他</option>
              </select>
            </div>

            {/* ボタン */}
            <div
              className={cn(
                RESPONSIVE_FLEX.columnToRow,
                RESPONSIVE_SPACING.gapSmall,
              )}
            >
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isDisabled}
                className={cn(
                  "px-4 py-2 rounded text-white font-medium transition relative",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  editingPostId !== null
                    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {isSaving && (
                  <LoadingSpinner
                    size="sm"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    label=""
                  />
                )}
                <span className={cn(isSaving && "ml-6")}>
                  {isSaving
                    ? editingPostId !== null
                      ? "更新中..."
                      : "投稿中..."
                    : editingPostId !== null
                      ? "更新"
                      : "投稿"}
                </span>
              </button>

              {editingPostId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSaving}
                  className={cn(
                    "px-4 py-2 rounded text-white font-medium",
                    "bg-gray-500 hover:bg-gray-600",
                    "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
                    "transition",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  キャンセル
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 投稿一覧 */}
        <section aria-labelledby="posts-heading">
          <h2
            id="posts-heading"
            className={`${RESPONSIVE_TEXT.heading2} font-semibold mb-4`}
          >
            投稿一覧（{posts.length}件）
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" label="投稿を読み込み中..." />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>まだ投稿がありません。</p>
              <p className="text-sm mt-2">
                上のフォームから最初の投稿を作成してみましょう。
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPosts.map((post) => {
                const isOpen = openPostIds.includes(post.id);
                const isDeleting = deletingPostId === post.id;

                return (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => togglePost(post.id)}
                      disabled={isDeleting}
                      className={cn(
                        "w-full text-left p-4 rounded-xl",
                        "hover:bg-gray-50 dark:hover:bg-gray-600 focus:bg-gray-50 dark:focus:bg-gray-600",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
                        "transition",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                      )}
                      aria-expanded={isOpen}
                      aria-controls={`post-content-${post.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white break-words">
                            {post.displayTitle}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {post.category} •{" "}
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                          {!isOpen && (
                            <p className="text-gray-700 dark:text-gray-300 mt-2 break-words">
                              {post.displayContent}...
                            </p>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {isDeleting ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {isOpen ? "▲" : "▼"}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div
                        id={`post-content-${post.id}`}
                        className="px-4 pb-4 border-t border-gray-200 dark:border-gray-600"
                      >
                        <div className="pt-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              本文:
                            </h4>
                            <div
                              className="text-gray-900 dark:text-white whitespace-pre-line break-words"
                              dangerouslySetInnerHTML={{
                                __html: displayTextSafe(post.content),
                              }}
                            />
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Link
                              to={`/posts/${post.id}`}
                              className={cn(
                                "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline rounded",
                                "focus:outline-none focus:ring-2",
                                "focus:ring-blue-500 focus:ring-offset-1",
                                "transition whitespace-nowrap",
                              )}
                            >
                              表示
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleEdit(post)}
                              disabled={isDeleting || isSaving}
                              className={cn(
                                "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline rounded",
                                "focus:outline-none focus:ring-2",
                                "focus:ring-green-500 focus:ring-offset-1",
                                "transition whitespace-nowrap",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                              )}
                            >
                              編集
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(post.id)}
                              disabled={isDeleting || isSaving}
                              className={cn(
                                "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:underline rounded",
                                "focus:outline-none focus:ring-2",
                                "focus:ring-red-500 focus:ring-offset-1",
                                "transition whitespace-nowrap",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                              )}
                            >
                              {isDeleting ? "削除中..." : "削除"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
};

export default Admin;
