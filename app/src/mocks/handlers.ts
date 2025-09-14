// app/src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import { blogs, comments } from "@/dummy";
import type { BlogCategory, Blog, Comment } from "@/dummy";

const API_BASE = "/api";

// カテゴリ名マッピング（フロントエンドの期待値に合わせる）
const CATEGORY_NAMES: Record<number, string> = {
  0: "hobby",
  1: "tech",
  2: "other",
};

// 認証チェック関数
const requireAuth = (request: Request) => {
  // 本番環境では無効化
  if (import.meta.env.PROD) {
    console.warn("🚫 MSW Handler: MSW should not be used in production!");
    return HttpResponse.json(
      { message: "This API is not available in production" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("🚫 MSW Handler: Missing or invalid authorization header");
    return HttpResponse.json({ message: "認証が必要です" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  // 開発環境用の簡易トークン検証（環境変数から取得）
  const devToken = import.meta.env.VITE_DEV_AUTH_TOKEN || "dev-token-123";
  if (token !== devToken) {
    console.log("🚫 MSW Handler: Invalid token:", token);
    return HttpResponse.json(
      { message: "無効なトークンです" },
      { status: 401 },
    );
  }

  return null; // 認証成功
};

// ブログ一覧取得の共通ロジック
const getBlogsLogic = (request: Request) => {
  console.log("🔍 MSW Handler: Blog list logic called");
  console.log("📍 Request URL:", request.url);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const category = url.searchParams.get("category");

  console.log("📊 MSW Handler: Query params", { page, limit, category });
  console.log("📚 MSW Handler: Total blogs available", blogs.length);

  let filteredBlogs = blogs;

  // カテゴリフィルター（数値と文字列の両方に対応）
  if (category) {
    let categoryNumber: number | null = null;

    // カテゴリが数値文字列の場合（例: "0", "1", "2"）
    if (/^\d+$/.test(category)) {
      const numericCategory = parseInt(category, 10);
      if ([0, 1, 2].includes(numericCategory)) {
        categoryNumber = numericCategory;
      }
    }
    // カテゴリが名前文字列の場合（例: "hobby", "tech", "other"）
    else if (["hobby", "tech", "other"].includes(category)) {
      const categoryMap = { hobby: 0, tech: 1, other: 2 };
      categoryNumber = categoryMap[category as keyof typeof categoryMap];
    }

    // 有効なカテゴリ番号でフィルタリング
    if (categoryNumber !== null) {
      filteredBlogs = blogs.filter(
        (blog: Blog) => blog.category === categoryNumber,
      );
      console.log(
        "🏷️ MSW Handler: Filtered by category",
        `${category} -> ${categoryNumber}`,
        "->",
        filteredBlogs.length,
        "blogs",
      );
    } else {
      console.log("⚠️ MSW Handler: Invalid category parameter", category);
    }
  }

  // ページネーション
  const total = filteredBlogs.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedBlogs = filteredBlogs.slice(start, end);

  console.log("📄 MSW Handler: Pagination", {
    start,
    end,
    paginatedCount: paginatedBlogs.length,
  });

  // レスポンス形式を調整（category_nameを追加）
  const blogsWithCategoryName = paginatedBlogs.map((blog: Blog) => ({
    ...blog,
    category_name: CATEGORY_NAMES[blog.category],
  }));

  console.log("📝 MSW Handler: Returning blogs", blogsWithCategoryName.length);

  const responseData = {
    blogs: blogsWithCategoryName,
    pagination: {
      current_page: page,
      per_page: limit,
      total_pages: totalPages,
      total_count: total,
    },
    // 後方互換性のために追加
    total: total,
  };

  console.log("📤 MSW Handler: Response data", responseData);

  return HttpResponse.json(responseData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const handlers = [
  // ========== ブログ関連API（デバッグログ強化版） ==========

  // ブログ記事一覧取得
  http.get(`${API_BASE}/blogs`, ({ request }) => {
    console.log("🔍 MSW Handler: GET /api/blogs called");
    return getBlogsLogic(request);
  }),

  // ブログ記事詳細取得
  http.get(`${API_BASE}/blogs/:id`, ({ params }) => {
    const id = parseInt(params.id as string, 10);
    console.log("🔍 MSW Handler: GET /api/blogs/:id called", { id });

    const blog = blogs.find((b: Blog) => b.id === id);
    if (!blog) {
      console.log("❌ MSW Handler: Blog not found", { id });
      return HttpResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    const blogWithCategoryName = {
      ...blog,
      category_name: CATEGORY_NAMES[blog.category],
    };

    // PostDetailが期待する形式 { blog: ... } で返す
    const responseData = {
      blog: blogWithCategoryName,
    };

    console.log("📝 MSW Handler: Returning blog detail", responseData);
    return HttpResponse.json(responseData);
  }),

  // ブログのコメント一覧取得
  http.get(`${API_BASE}/blogs/:id/comments`, ({ params }) => {
    const blogId = parseInt(params.id as string, 10);
    console.log("🔍 MSW Handler: GET /api/blogs/:id/comments called", {
      blogId,
    });

    const blogComments = comments.filter(
      (comment: Comment) => comment.blog_id === blogId,
    );
    console.log("💬 MSW Handler: Found comments", blogComments.length);

    return HttpResponse.json({ comments: blogComments });
  }),

  // コメント投稿
  http.post(`${API_BASE}/blogs/:id/comments`, async ({ params, request }) => {
    const blogId = parseInt(params.id as string, 10);
    const body = (await request.json()) as {
      user_name: string;
      comment: string;
    };

    console.log("🔍 MSW Handler: POST /api/blogs/:id/comments called", {
      blogId,
      body,
    });

    // 簡単なバリデーション
    if (!body.user_name || !body.comment) {
      return HttpResponse.json(
        { message: "名前とコメントは必須です" },
        { status: 400 },
      );
    }

    const newComment: Comment = {
      id: Date.now(),
      blog_id: blogId,
      user_name: body.user_name,
      comment: body.comment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(), // updated_atを追加
    };

    // メモリ上のコメント配列に追加（開発環境のみ）
    comments.push(newComment);

    console.log("💬 MSW Handler: Comment created", newComment);
    return HttpResponse.json(newComment, { status: 201 });
  }),

  // ========== 認証API ==========

  // ログイン
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    console.log("🔍 MSW Handler: POST /api/auth/login called");

    const body = (await request.json()) as {
      email: string;
      password: string;
    };

    console.log("🔐 MSW Handler: Login attempt", { email: body.email });

    // 開発環境用の簡易認証
    if (body.email === "admin@example.com" && body.password === "password") {
      const responseData = {
        token: "dev-token-123",
        admin: {
          id: 1,
          email: "admin@example.com",
          name: "管理者",
        },
      };

      console.log("✅ MSW Handler: Login successful", responseData);
      return HttpResponse.json(responseData);
    } else {
      console.log("❌ MSW Handler: Login failed - invalid credentials");
      return HttpResponse.json(
        { message: "メールアドレスまたはパスワードが間違っています" },
        { status: 401 },
      );
    }
  }),

  // ログアウト
  http.post(`${API_BASE}/auth/logout`, async ({ request }) => {
    console.log("🔍 MSW Handler: POST /api/auth/logout called");

    const authError = requireAuth(request);
    if (authError) return authError;

    console.log("👋 MSW Handler: Logout successful");
    return HttpResponse.json({ message: "ログアウトしました" });
  }),

  // 認証状態チェック
  http.get(`${API_BASE}/auth/me`, ({ request }) => {
    console.log("🔍 MSW Handler: GET /api/auth/me called");

    const authError = requireAuth(request);
    if (authError) return authError;

    const adminData = {
      id: 1,
      email: "admin@example.com",
      name: "管理者",
    };

    console.log("👤 MSW Handler: Auth check successful", adminData);
    return HttpResponse.json(adminData);
  }),

  // ========== 管理者API ==========

  // 管理者用ブログ投稿作成
  http.post(`${API_BASE}/admin/blogs`, async ({ request }) => {
    console.log("🔍 MSW Handler: POST /api/admin/blogs called");

    const authError = requireAuth(request);
    if (authError) return authError;

    try {
      const body = (await request.json()) as {
        title: string;
        content: string;
        category: BlogCategory;
      };

      console.log("📝 MSW Handler: Admin blog creation", body);

      // 簡単なバリデーション
      if (!body.title || !body.content || body.category === undefined) {
        return HttpResponse.json(
          { message: "タイトル、内容、カテゴリは必須です" },
          { status: 400 },
        );
      }

      const newBlog: Blog = {
        id: Date.now(),
        title: body.title,
        content: body.content,
        category: body.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // メモリ上のブログ配列に追加（開発環境のみ）
      blogs.unshift(newBlog);

      console.log("✅ MSW Handler: Admin blog created", newBlog);
      return HttpResponse.json(newBlog, { status: 201 });
    } catch (error) {
      console.error("❌ MSW Handler: Admin blog creation failed", error);
      return HttpResponse.json(
        { message: "投稿の作成に失敗しました" },
        { status: 500 },
      );
    }
  }),

  // 管理者用ブログ投稿更新
  http.put(`${API_BASE}/admin/blogs/:id`, async ({ request, params }) => {
    console.log("🔍 MSW Handler: PUT /api/admin/blogs/:id called");

    const authError = requireAuth(request);
    if (authError) return authError;

    const id = parseInt(params.id as string, 10);
    const body = (await request.json()) as Partial<Blog>;

    console.log("📝 MSW Handler: Admin blog update", { id, body });

    const blogIndex = blogs.findIndex((blog: Blog) => blog.id === id);
    if (blogIndex === -1) {
      return HttpResponse.json(
        { message: "投稿が見つかりません" },
        { status: 404 },
      );
    }

    // 更新処理（開発環境のみ）
    blogs[blogIndex] = {
      ...blogs[blogIndex],
      ...body,
      updated_at: new Date().toISOString(),
    };

    console.log("✅ MSW Handler: Admin blog updated", blogs[blogIndex]);
    return HttpResponse.json(blogs[blogIndex]);
  }),

  // 管理者用ブログ投稿削除
  http.delete(`${API_BASE}/admin/blogs/:id`, async ({ request, params }) => {
    console.log("🔍 MSW Handler: DELETE /api/admin/blogs/:id called");

    const authError = requireAuth(request);
    if (authError) return authError;

    const id = parseInt(params.id as string, 10);
    console.log("🗑️ MSW Handler: Admin blog deletion", { id });

    // 実際にblogs配列から削除
    const blogIndex = blogs.findIndex((blog: Blog) => blog.id === id);
    if (blogIndex === -1) {
      console.log("❌ MSW Handler: Blog not found", { id });
      return HttpResponse.json(
        { message: "投稿が見つかりません" },
        { status: 404 },
      );
    }

    // blogs配列から削除
    const deletedBlog = blogs.splice(blogIndex, 1)[0];
    console.log("✅ MSW Handler: Blog deleted from array", deletedBlog);

    return HttpResponse.json(
      {
        message: "投稿が削除されました",
        id: id,
      },
      { status: 200 },
    );
  }),

  // ========== 後方互換性のための古いAPI endpoints（共通ロジック使用） ==========

  // 古い /articles エンドポイント（fetch使用を避けて共通ロジック使用）
  http.get(`${API_BASE}/articles`, ({ request }) => {
    console.log(
      "🔍 MSW Handler: GET /api/articles (redirecting to blogs logic)",
    );

    // fetch()を使わず、共通ロジックを直接使用
    return getBlogsLogic(request);
  }),
];
