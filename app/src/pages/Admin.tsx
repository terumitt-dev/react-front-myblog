// app/src/pages/Admin.tsx
import Layout from "@/components/layouts/Layout";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/molecules/LogoutButton";

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

  useEffect(() => {
    const saved = localStorage.getItem("myblog-posts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosts(parsed);
      } catch (error) {
        console.error("Failed to parse posts from localStorage:", error);
        localStorage.removeItem("myblog-posts");
      }
    }
  }, []);

  const saveToLocalStorage = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    localStorage.setItem("myblog-posts", JSON.stringify(updatedPosts));
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("tech");
    setEditingPostId(null);
    setError("");
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      setError("タイトルと本文は必須です。");
      return;
    }

    if (editingPostId !== null) {
      const updated = posts.map((p) =>
        p.id === editingPostId ? { ...p, title, content, category } : p,
      );
      saveToLocalStorage(updated);
    } else {
      const newPost: Post = {
        id: Date.now(),
        title,
        content,
        category,
        createdAt: new Date().toISOString(),
      };
      saveToLocalStorage([...posts, newPost]);
    }

    resetForm();
  };

  const handleDelete = (id: number) => {
    const updated = posts.filter((p) => p.id !== id);
    saveToLocalStorage(updated);
  };

  const handleEdit = (post: Post) => {
    setTitle(post.title);
    setContent(post.content);
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
          <h1 className="text-2xl font-bold">投稿管理（Admin）</h1>
          <LogoutButton onClick={handleLogout} />
        </div>

        {/* 投稿フォーム */}
        <div className="bg-gray-200 rounded-xl p-6">
          <div className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトル"
              className="border p-2 w-full"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="本文"
              className="border p-2 w-full"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-2"
            >
              <option value="tech">Tech</option>
              <option value="hobby">Hobby</option>
              <option value="other">Other</option>
            </select>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                className={cn(
                  "px-4 py-2 rounded text-white",
                  editingPostId !== null
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700",
                )}
              >
                {editingPostId !== null ? "更新する" : "投稿を追加"}
              </button>

              {editingPostId !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className={cn(
                    "px-4 py-2 rounded text-white",
                    "bg-gray-500 hover:bg-gray-600",
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
        <div className="bg-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">現在の投稿一覧</h2>
          {posts.length === 0 ? (
            <p>まだ投稿がありません。</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const isOpen = openPostIds.includes(post.id);
                return (
                  <div key={post.id}>
                    <button
                      type="button"
                      onClick={() => togglePost(post.id)}
                      className={cn(
                        "w-full text-left rounded-xl p-4 shadow",
                        "bg-white hover:bg-gray-100",
                        "transition",
                      )}
                    >
                      <div className="space-y-1">
                        <strong className="block break-words text-lg">
                          {post.title}
                        </strong>
                        <span className="text-sm text-gray-600">
                          カテゴリ: {post.category}
                        </span>
                        <div className="text-xs text-gray-500">
                          投稿日: {new Date(post.createdAt).toLocaleString()}
                        </div>
                        <div className="text-gray-700 break-words whitespace-pre-line mt-2">
                          {isOpen
                            ? post.content
                            : post.content.length > 100
                              ? `${post.content.slice(0, 100)}...`
                              : post.content}
                        </div>
                      </div>
                    </button>

                    {/* アクション部分：アクセシビリティ改善版 */}
                    <nav
                      className="flex gap-4 mt-2 px-3"
                      aria-label="投稿操作"
                      role="toolbar"
                    >
                      <Link
                        to={`/posts/${post.id}`}
                        className={cn(
                          "text-blue-600 hover:underline rounded",
                          "focus:outline-none focus:ring-2",
                          "focus:ring-blue-500 focus:ring-offset-1",
                        )}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                          }
                        }}
                      >
                        記事を確認 →
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(post);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                          }
                        }}
                        className={cn(
                          "text-green-600 hover:underline rounded",
                          "focus:outline-none focus:ring-2",
                          "focus:ring-green-500 focus:ring-offset-1",
                        )}
                        aria-label={`${post.title}を編集`}
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(post.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                          }
                        }}
                        className={cn(
                          "text-red-600 hover:underline rounded",
                          "focus:outline-none focus:ring-2",
                          "focus:ring-red-500 focus:ring-offset-1",
                        )}
                        aria-label={`${post.title}を削除`}
                      >
                        削除
                      </button>
                    </nav>
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
