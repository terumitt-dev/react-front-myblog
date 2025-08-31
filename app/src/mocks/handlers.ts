// app/src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import { blogs, comments, admins } from "../dummy";
import { CATEGORY_NAMES } from "../dummy/types";

// APIのベースURL
const API_BASE = "/api";

// 認証用のヘルパー関数
const getAuthToken = (request: Request) => {
  return request.headers.get("Authorization")?.replace("Bearer ", "");
};

// 認証済みかチェックするミドルウェア的な関数
const requireAuth = (request: Request) => {
  const token = getAuthToken(request);
  if (!token || token !== "mock-jwt-token") {
    return new HttpResponse(null, { status: 401 });
  }
  return null;
};

// 管理者情報の検証
const validateAdmin = (email: string, password: string) => {
  const adminEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
  const adminPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn("Admin credentials not configured in environment variables");
    return false;
  }

  return email === adminEmail && password === adminPassword;
};

export const handlers = [
  // ブログ記事一覧取得
  http.get(`${API_BASE}/blogs`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const category = url.searchParams.get("category");

    let filteredBlogs = blogs;

    // カテゴリフィルター
    if (category && ["hobby", "tech", "other"].includes(category)) {
      const categoryMap = { hobby: 0, tech: 1, other: 2 };
      filteredBlogs = blogs.filter(
        (blog) =>
          blog.category === categoryMap[category as keyof typeof categoryMap],
      );
    }

    // ページネーション
    const total = filteredBlogs.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedBlogs = filteredBlogs.slice(start, end);

    // レスポンス形式を調整（category_nameを追加）
    const blogsWithCategoryName = paginatedBlogs.map((blog) => ({
      ...blog,
      category_name: CATEGORY_NAMES[blog.category],
    }));

    return HttpResponse.json({
      blogs: blogsWithCategoryName,
      pagination: {
        current_page: page,
        per_page: limit,
        total_pages: totalPages,
        total_count: total,
      },
    });
  }),

  // ブログ記事詳細取得
  http.get(`${API_BASE}/blogs/:id`, ({ params }) => {
    const id = parseInt(params.id as string, 10);
    const blog = blogs.find((b) => b.id === id);

    if (!blog) {
      return new HttpResponse(null, { status: 404 });
    }

    const blogWithCategoryName = {
      ...blog,
      category_name: CATEGORY_NAMES[blog.category],
    };

    return HttpResponse.json({ blog: blogWithCategoryName });
  }),

  // ブログのコメント一覧取得
  http.get(`${API_BASE}/blogs/:id/comments`, ({ params }) => {
    const blogId = parseInt(params.id as string, 10);
    const blog = blogs.find((b) => b.id === blogId);

    if (!blog) {
      return new HttpResponse(null, { status: 404 });
    }

    const blogComments = comments.filter((c) => c.blog_id === blogId);

    return HttpResponse.json({
      comments: blogComments.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    });
  }),

  // コメント投稿
  http.post(`${API_BASE}/blogs/:id/comments`, async ({ request, params }) => {
    const blogId = parseInt(params.id as string, 10);
    const body = (await request.json()) as {
      user_name: string;
      comment: string;
    };

    const blog = blogs.find((b) => b.id === blogId);
    if (!blog) {
      return new HttpResponse(null, { status: 404 });
    }

    const newComment = {
      id: Math.max(...comments.map((c) => c.id), 0) + 1,
      blog_id: blogId,
      user_name: body.user_name,
      comment: body.comment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        comment: newComment,
        message: "コメントを投稿しました",
      },
      { status: 201 },
    );
  }),

  // 管理者ログイン
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    // 認証情報の検証
    if (!validateAdmin(body.email, body.password)) {
      return new HttpResponse(
        JSON.stringify({
          message: "メールアドレスまたはパスワードが正しくありません",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // 認証成功時は管理者情報を返す
    const admin = admins.find((a) => a.email === body.email) || {
      id: 1,
      email: body.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json({
      admin,
      token: "mock-jwt-token",
      message: "ログインしました",
    });
  }),

  // 管理者ログアウト
  http.post(`${API_BASE}/auth/logout`, async ({ request }) => {
    const authError = requireAuth(request);
    if (authError) return authError;

    return HttpResponse.json({
      message: "ログアウトしました",
    });
  }),

  // 認証状態チェック
  http.get(`${API_BASE}/auth/me`, async ({ request }) => {
    const authError = requireAuth(request);
    if (authError) return authError;

    const adminEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
    const admin = admins.find((a) => a.email === adminEmail) || admins[0];

    return HttpResponse.json({ admin });
  }),

  // 管理者用のブログ操作API
  http.post(`${API_BASE}/admin/blogs`, async ({ request }) => {
    const authError = requireAuth(request);
    if (authError) return authError;

    const body = await request.json();

    return HttpResponse.json(
      {
        message: "ブログを作成しました",
      },
      { status: 201 },
    );
  }),

  http.put(`${API_BASE}/admin/blogs/:id`, async ({ request, params }) => {
    const authError = requireAuth(request);
    if (authError) return authError;

    const body = await request.json();

    return HttpResponse.json({
      message: "ブログを更新しました",
    });
  }),

  http.delete(`${API_BASE}/admin/blogs/:id`, async ({ request, params }) => {
    const authError = requireAuth(request);
    if (authError) return authError;

    return HttpResponse.json({
      message: "ブログを削除しました",
    });
  }),

  // 後方互換性のため、古いAPI endpoints
  http.get(`${API_BASE}/articles`, ({ request }) => {
    const url = new URL(request.url);
    const blogsUrl = url.toString().replace("/articles", "/blogs");
    return fetch(blogsUrl)
      .then((res) => res.json())
      .then((data) => HttpResponse.json(data));
  }),
];
