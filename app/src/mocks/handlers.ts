// app/src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import { blogs, comments, admins } from "../dummy";
import { CATEGORY_NAMES } from "../dummy/types";
import type { Admin, AuthResponse } from "../dummy/types";

// APIのベースURL
const API_BASE = "/api";

// 開発環境専用の認証情報（環境変数を使用しない）
const DEVELOPMENT_CREDENTIALS = {
  email: "admin@localhost.dev",
  password: "dev-password-123",
} as const;

// エラーレスポンス用のヘルパー関数
const createErrorResponse = (message: string, status: number = 400) => {
  return new HttpResponse(
    JSON.stringify({
      message,
      status,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};

// 認証用のヘルパー関数
const getAuthToken = (request: Request) => {
  return request.headers.get("Authorization")?.replace("Bearer ", "");
};

// 認証済みかチェックするミドルウェア的な関数
const requireAuth = (request: Request) => {
  const token = getAuthToken(request);
  if (!token || token !== "dev-token-mock") {
    return createErrorResponse("認証が必要です", 401);
  }
  return null;
};

// 開発環境専用の認証検証（環境変数を使用しない）
const validateAdmin = (email: string, password: string): boolean => {
  console.log("🔐 開発環境: 認証試行", { email });

  const isValid =
    email === DEVELOPMENT_CREDENTIALS.email &&
    password === DEVELOPMENT_CREDENTIALS.password;

  if (isValid) {
    console.log("✅ 開発環境: 認証成功");
  } else {
    console.log("❌ 開発環境: 認証失敗");
    console.log("💡 開発環境の認証情報:", DEVELOPMENT_CREDENTIALS);
  }

  return isValid;
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
      return createErrorResponse("ブログ記事が見つかりません", 404);
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
      return createErrorResponse("ブログ記事が見つかりません", 404);
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
      return createErrorResponse("ブログ記事が見つかりません", 404);
    }

    const newComment = {
      id: Math.max(...comments.map((c) => c.id), 0) + 1,
      blog_id: blogId,
      user_name: body.user_name,
      comment: body.comment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 実際のcommentsに追加（開発環境でのみ有効）
    comments.push(newComment);

    return HttpResponse.json(
      {
        comment: newComment,
        message: "コメントを投稿しました",
      },
      { status: 201 },
    );
  }),

  // ========== 認証関連（セキュリティ改善版） ==========

  // 開発環境専用ログイン
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    try {
      const body = (await request.json()) as {
        email: string;
        password: string;
      };

      console.log("🔐 開発環境: ログイン処理開始");

      // 入力値検証
      if (!body.email || !body.password) {
        console.log("❌ 開発環境: 入力値が不正");
        return createErrorResponse("メールアドレスとパスワードが必要です", 400);
      }

      // 開発環境専用の認証検証
      if (!validateAdmin(body.email, body.password)) {
        return createErrorResponse(
          "メールアドレスまたはパスワードが正しくありません",
          401,
        );
      }

      // 認証成功時のレスポンス
      const admin: Admin = {
        id: 1,
        email: DEVELOPMENT_CREDENTIALS.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response: AuthResponse = {
        admin,
        token: "dev-token-mock", // 開発環境専用トークン
        message: "ログインしました",
      };

      console.log("✅ 開発環境: ログイン成功");
      return HttpResponse.json(response, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("🚫 開発環境: ログイン処理エラー", error);
      return createErrorResponse("サーバーエラーが発生しました", 500);
    }
  }),

  // 開発環境専用ログアウト
  http.post(`${API_BASE}/auth/logout`, async ({ request }) => {
    const authError = requireAuth(request);
    if (authError) return authError;

    console.log("🚪 開発環境: ログアウト処理");
    return HttpResponse.json({
      message: "ログアウトしました",
    });
  }),

  // 認証状態チェック
  http.get(`${API_BASE}/auth/me`, async ({ request }) => {
    const authError = requireAuth(request);
    if (authError) return authError;

    const admin: Admin = {
      id: 1,
      email: DEVELOPMENT_CREDENTIALS.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("🔍 開発環境: 認証状態確認");
    return HttpResponse.json({ admin });
  }),

  // ========== 管理者用API（開発環境専用） ==========

  // ブログ投稿（管理者用）
  http.post(`${API_BASE}/admin/blogs`, async ({ request }) => {
    const authError = requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    console.log("📝 開発環境: ブログ投稿", body);

    // 実際のblogsに追加（開発環境でのみ有効）
    const newBlog = {
      id: Math.max(...blogs.map((b) => b.id), 0) + 1,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    blogs.push(newBlog);

    return HttpResponse.json(
      {
        blog: newBlog,
        message: "ブログを作成しました",
      },
      { status: 201 },
    );
  }),

  // ブログ更新（管理者用）
  http.put(`${API_BASE}/admin/blogs/:id`, async ({ request, params }) => {
    const authError = requireAuth(request);
    if (authError) return authError;

    const id = parseInt(params.id as string, 10);
    const body = await request.json();

    console.log("📝 開発環境: ブログ更新", { id, body });

    return HttpResponse.json({
      message: "ブログを更新しました",
    });
  }),

  // ブログ削除（管理者用）
  http.delete(`${API_BASE}/admin/blogs/:id`, async ({ request, params }) => {
    const authError = requireAuth(request);
    if (authError) return authError;

    const id = parseInt(params.id as string, 10);
    console.log("🗑️ 開発環境: ブログ削除", { id });

    return HttpResponse.json({
      message: "ブログを削除しました",
    });
  }),

  // ========== 後方互換性のため ==========

  // 古いAPI endpoints
  http.get(`${API_BASE}/articles`, ({ request }) => {
    const url = new URL(request.url);
    const blogsUrl = url.toString().replace("/articles", "/blogs");
    return fetch(blogsUrl)
      .then((res) => res.json())
      .then((data) => HttpResponse.json(data));
  }),
];
