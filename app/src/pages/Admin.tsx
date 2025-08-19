// app/src/pages/Admin.tsx
import Layout from "@/components/layouts/Layout";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "@/components/molecules/LogoutButton";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import { TEXT_LIMITS } from "@/constants/appConfig";
import { FORM_STYLES, BACKGROUND_STYLES } from "@/components/utils/styles";
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
import {
  LAYOUT_PATTERNS,
  RESPONSIVE_SPACING,
  RESPONSIVE_TEXT,
  RESPONSIVE_FLEX,
} from "@/constants/responsive";

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

// JSONから読み込む際の型（型安全性向上）
interface RawPost {
  id: string | number;
  title: string;
  content: string;
  category: string;
  createdAt?: string; // 読み込み時は任意、変換時に必須にする
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
  const [isDeleting, setIsDeleting] = useState(false);

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
            .map((p) => ({
              ...p,
              id: Number(p.id),
              createdAt: p.createdAt || new Date().toISOString(), // 確実にcreatedAtを設定
              // XSS対策: 安全な表示用データを生成
              safeTitle: displayTextPlain(p.title),
              safeCategory: displayTextPlain(p.category),
              safeDisplayContent: displayTextPlain(p.content).substring(0, 100),
            }))
            .sort((a, b) => b.id - a.id);
          setPosts(validPosts);
        }
      } catch (error) {
        // 本番環境では詳細ログを抑制
        if (process.env.NODE_ENV === "development") {
          console.error("Posts loading error:", error);
        }
        handleStorageError(error, "load");
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      // 少し遅延して保存処理を模擬
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 互換性修正: 古いシグネチャ使用
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
      const categoryValidation = validateCategory(category);

      if (!titleValidation.isValid) {
        setError(`タイトル: ${titleValidation.error}`);
        return;
      }
      if (!contentValidation.isValid) {
        setError(`内容: ${contentValidation.error}`);
        return;
      }
      if (!categoryValidation.isValid) {
        setError(`カテゴリ: ${categoryValidation.error}`);
        return;
      }

      setIsSaving(true);
      setError("");

      const newPost: Post = {
        id: editingPostId || Date.now(),
        title: titleValidation.sanitized,
        content: contentValidation.sanitized,
        category: categoryValidation.sanitized,
        createdAt: new Date().toISOString(),
        // XSS対策: 安全な表示用データも生成
        safeTitle: displayTextPlain(titleValidation.sanitized),
        safeCategory: displayTextPlain(categoryValidation.sanitized),
        safeDisplayContent: displayTextPlain(
          contentValidation.sanitized,
        ).substring(0, 100),
      };

      let updatedPosts: Post[];
      if (editingPostId) {
        updatedPosts = posts.map((post) =>
          post.id === editingPostId ? newPost : post,
        );
      } else {
        updatedPosts = [newPost, ...posts];
      }

      setPosts(updatedPosts);
      try {
        localStorage.setItem("myblog-posts", JSON.stringify(updatedPosts));
      } catch (e) {
        handleStorageError(e, "save");
      }

      setTitle("");
      setContent("");
      setCategory("tech");
      setEditingPostId(null);
    } catch (error) {
      // 本番環境では詳細ログを抑制
      if (process.env.NODE_ENV === "development") {
        console.error("Save error:", error);
      }
      setError("保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  }, [title, content, category, editingPostId, posts]);

  const handleEdit = useCallback((post: Post) => {
    setTitle(post.title);
    setContent(post.content);
    setCategory(post.category);
    setEditingPostId(post.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("この投稿を削除しますか？")) return;

      setIsDeleting(true);
      try {
        // 実際のアプリでは API 通信の遅延をシミュレート
        await new Promise((resolve) => setTimeout(resolve, 500));

        const updated = posts.filter((post) => post.id !== id);
        setPosts(updated);
        try {
          localStorage.setItem("myblog-posts", JSON.stringify(updated));
        } catch (e) {
          handleStorageError(e, "delete");
        }

        if (editingPostId === id) {
          setTitle("");
          setContent("");
          setCategory("tech");
          setEditingPostId(null);
        }
      } catch (error) {
        // 本番環境では詳細ログを抑制
        if (process.env.NODE_ENV === "development") {
          console.error("Delete error:", error);
        }
        setError("削除に失敗しました。もう一度お試しください。");
      } finally {
        setIsDeleting(false);
      }
    },
    [posts, editingPostId],
  );

  const togglePost = useCallback((postId: number) => {
    setOpenPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  }, []);

  const isFormValid = Boolean(
    title.trim() && content.trim() && category.trim(),
  );

  return (
    <Layout>
      <div
        className={cn(
          LAYOUT_PATTERNS.containerWide,
          RESPONSIVE_SPACING.section,
        )}
      >
        {/* ヘッダー */}
        <header
          className={cn(
            "flex flex-col sm:flex-row sm:items-center sm:justify-between",
            RESPONSIVE_SPACING.gapSmall,
            "mb-8",
          )}
        >
          <h1
            className={cn(
              RESPONSIVE_TEXT.heading1,
              "font-bold text-gray-900 dark:text-white",
            )}
          >
            管理画面
          </h1>
          <LogoutButton className="w-full sm:w-auto" />
        </header>

        {/* 投稿フォーム */}
        <section
          className={cn(
            "mb-8 space-y-6 p-6 rounded-xl",
            BACKGROUND_STYLES.cardSecondary,
          )}
          aria-labelledby="post-form-heading"
        >
          <h2
            id="post-form-heading"
            className={cn(
              RESPONSIVE_TEXT.heading2,
              "font-semibold text-gray-900 dark:text-white",
            )}
          >
            {editingPostId ? "投稿を編集" : "新しい投稿"}
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className={cn("space-y-6")}
          >
            <div className={FORM_STYLES.container}>
              <label htmlFor="title-input" className={FORM_STYLES.label}>
                タイトル（{title.length}/{TEXT_LIMITS.TITLE_MAX_LENGTH}文字）
              </label>
              <input
                id="title-input"
                className={FORM_STYLES.input}
                type="text"
                value={title}
                onChange={(e) => setTitle(sanitizeInput(e.target.value))}
                placeholder="投稿のタイトルを入力"
                maxLength={TEXT_LIMITS.TITLE_MAX_LENGTH}
                disabled={isSaving}
                required
              />
            </div>

            <div className={FORM_STYLES.container}>
              <label htmlFor="category-select" className={FORM_STYLES.label}>
                カテゴリ
              </label>
              <select
                id="category-select"
                className={FORM_STYLES.input}
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

            <div className={FORM_STYLES.container}>
              <label htmlFor="content-textarea" className={FORM_STYLES.label}>
                本文（{content.length}/{TEXT_LIMITS.CONTENT_MAX_LENGTH}文字）
              </label>
              <textarea
                id="content-textarea"
                className={FORM_STYLES.input}
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

            <div className={cn(RESPONSIVE_FLEX.columnToRow, "gap-3")}>
              <button
                type="submit"
                disabled={!isFormValid || isSaving}
                className={cn(
                  "relative flex-1 px-6 py-3 rounded text-white font-medium",
                  "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
                  "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "transition duration-200",
                  (!isFormValid || isSaving) && "opacity-50 cursor-not-allowed",
                )}
              >
                {isSaving && (
                  <LoadingSpinner
                    size="sm"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    label=""
                  />
                )}
                <span className={isSaving ? "ml-6" : ""}>
                  {editingPostId ? "更新" : "投稿"}
                </span>
              </button>

              {editingPostId && (
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setContent("");
                    setCategory("tech");
                    setEditingPostId(null);
                    setError("");
                  }}
                  disabled={isSaving}
                  className={cn(
                    "flex-1 px-6 py-3 rounded border border-gray-300 dark:border-gray-600",
                    "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
                    "focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
                    "transition duration-200",
                    isSaving && "opacity-50 cursor-not-allowed",
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
          className={cn("p-6 rounded-xl", BACKGROUND_STYLES.cardSecondary)}
          aria-labelledby="posts-heading"
        >
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
            <p className="text-gray-500 dark:text-gray-400 text-center py-12">
              まだ投稿がありません。
            </p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const isOpen = openPostIds.includes(post.id);
                return (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-gray-700 rounded-xl shadow p-6 space-y-4"
                  >
                    <button
                      type="button"
                      onClick={() => togglePost(post.id)}
                      className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                      aria-expanded={isOpen}
                      aria-label={`投稿「${post.safeTitle}」${isOpen ? "を閉じる" : "を開く"}`}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                        {/* XSS対策: 安全な表示 */}
                        {post.safeTitle}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {/* XSS対策: 安全な表示 */}
                        {post.safeCategory} •{" "}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      {!isOpen && (
                        <p className="text-gray-700 dark:text-gray-300 mt-2 break-words">
                          {/* XSS対策: 安全な表示 */}
                          {post.safeDisplayContent}...
                        </p>
                      )}
                    </button>

                    {isOpen && (
                      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="prose dark:prose-invert max-w-none break-words">
                          {/* XSS対策: displayTextSafe使用 */}
                          <div
                            dangerouslySetInnerHTML={{
                              __html: displayTextSafe(post.content),
                            }}
                          />
                        </div>

                        <div
                          className={cn(RESPONSIVE_FLEX.columnToRow, "gap-3")}
                        >
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
                            disabled={isDeleting}
                            className={cn(
                              "flex-1 px-4 py-2 rounded text-white flex items-center justify-center",
                              "bg-red-600 hover:bg-red-700",
                              "focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                              "transition duration-200",
                              isDeleting && "opacity-50 cursor-not-allowed",
                            )}
                          >
                            {isDeleting ? <LoadingSpinner size="sm" /> : "削除"}
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
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Admin;
