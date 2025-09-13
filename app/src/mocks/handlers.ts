// app/src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import { blogs, comments } from "../dummy";
import { CATEGORY_NAMES } from "../dummy/types";
import type { Admin, AuthResponse, BlogCategory } from "../dummy/types";

// APIのベースURL
const API_BASE = "/api";

// 開発環境専用の認証情報（環境変数を使用しない）
const DEVELOPMENT_CREDENTIALS = {
  email: "admin@example.com",
  password: "password",
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
  // ========== ブログ関連API（デバッグログ強化版） ==========

  // ブログ記事一覧取得
  http.get(`${API_BASE}/blogs`, ({ request }) => {
    console.log("🔍 MSW Handler: GET /api/blogs called");
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
          (blog) => blog.category === categoryNumber,
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
    const blogsWithCategoryName = paginatedBlogs.map((blog) => ({
      ...blog,
      category_name: CATEGORY_NAMES[blog.category],
    }));

    console.log(
      "📝 MSW Handler: Returning blogs",
      blogsWithCategoryName.length,
    );

    const responseData = {
      blogs: blogsWithCategoryName,
      pagination: {
        current_page: page,
        per_page: limit,
        total_pages: totalPages,
        total_count: total,
      },
    };

    console.log("📤 MSW Handler: Response data", responseData);

    return HttpResponse.json(responseData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // ブログ記事詳細取得
  http.get(`${API_BASE}/blogs/:id`, ({ params }) => {
    const id = parseInt(params.id as string, 10);
    console.log("🔍 MSW Handler: GET /api/blogs/:id called", { id });

    const blog = blogs.find((b) => b.id === id);

    if (!blog) {
      console.log("❌ MSW Handler: Blog not found", { id });
      return createErrorResponse("ブログ記事が見つかりません", 404);
    }

    const blogWithCategoryName = {
      ...blog,
      category_name: CATEGORY_NAMES[blog.category],
    };

    console.log("✅ MSW Handler: Blog found", blogWithCategoryName.title);

    return HttpResponse.json(
      { blog: blogWithCategoryName },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }),

  // ブログのコメント一覧取得
  http.get(`${API_BASE}/blogs/:id/comments`, ({ params }) => {
    const blogId = parseInt(params.id as string, 10);
    console.log("🔍 MSW Handler: GET /api/blogs/:id/comments called", {
      blogId,
    });

    const blog = blogs.find((b) => b.id === blogId);

    if (!blog) {
      console.log("❌ MSW Handler: Blog not found for comments", { blogId });
      return createErrorResponse("ブログ記事が見つかりません", 404);
    }

    const blogComments = comments.filter((c) => c.blog_id === blogId);
    console.log("💬 MSW Handler: Found comments", blogComments.length);

    const sortedComments = blogComments.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return HttpResponse.json(
      {
        comments: sortedComments,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }),

  // コメント投稿
  http.post(`${API_BASE}/blogs/:id/comments`, async ({ request, params }) => {
    const blogId = parseInt(params.id as string, 10);
    console.log("🔍 MSW Handler: POST /api/blogs/:id/comments called", {
      blogId,
    });

    try {
      const body = (await request.json()) as {
        user_name: string;
        comment: string;
      };

      console.log("📝 MSW Handler: Comment data", body);

      const blog = blogs.find((b) => b.id === blogId);
      if (!blog) {
        console.log("❌ MSW Handler: Blog not found for comment post", {
          blogId,
        });
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
      console.log("✅ MSW Handler: Comment added", newComment);

      return HttpResponse.json(
        {
          comment: newComment,
          message: "コメントを投稿しました",
        },
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      console.error("❌ MSW Handler: Comment post error", error);
      return createErrorResponse("コメントの投稿に失敗しました", 500);
    }
  }),

  // ========== 認証関連API（セキュリティ改善版） ==========

  // 開発環境専用ログイン
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    console.log("🔍 MSW Handler: POST /api/auth/login called");

    try {
      const body = (await request.json()) as {
        email: string;
        password: string;
      };

      console.log("🔐 MSW Handler: Login attempt", { email: body.email });

      // 入力値検証
      if (!body.email || !body.password) {
        console.log("❌ MSW Handler: Missing credentials");
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

      console.log("✅ MSW Handler: Login successful");
      return HttpResponse.json(response, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("🚫 MSW Handler: Login error", error);
      return createErrorResponse("サーバーエラーが発生しました", 500);
    }
  }),

  // 開発環境専用ログアウト
  http.post(`${API_BASE}/auth/logout`, async ({ request }) => {
    console.log("🔍 MSW Handler: POST /api/auth/logout called");

    const authError = requireAuth(request);
    if (authError) return authError;

    console.log("🚪 MSW Handler: Logout successful");
    return HttpResponse.json(
      {
        message: "ログアウトしました",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }),

  // 認証状態チェック
  http.get(`${API_BASE}/auth/me`, async ({ request }) => {
    console.log("🔍 MSW Handler: GET /api/auth/me called");

    const authError = requireAuth(request);
    if (authError) return authError;

    const admin: Admin = {
      id: 1,
      email: DEVELOPMENT_CREDENTIALS.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("🔍 MSW Handler: Auth check successful");
    return HttpResponse.json(
      { admin },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }),

  // ========== 管理者用API（開発環境専用） ==========

  // ブログ投稿（管理者用）
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

      // 実際のblogsに追加（開発環境でのみ有効）
      const newBlog = {
        id: Math.max(...blogs.map((b) => b.id), 0) + 1,
        title: body.title,
        content: body.content,
        category: body.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      blogs.push(newBlog);
      console.log("✅ MSW Handler: Admin blog created", newBlog);

      return HttpResponse.json(
        {
          blog: newBlog,
          message: "ブログを作成しました",
        },
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      console.error("❌ MSW Handler: Admin blog creation error", error);
      return createErrorResponse("ブログの作成に失敗しました", 500);
    }
  }),

  // ブログ更新（管理者用）
  http.put(`${API_BASE}/admin/blogs/:id`, async ({ request, params }) => {
    console.log("🔍 MSW Handler: PUT /api/admin/blogs/:id called");

    const authError = requireAuth(request);
    if (authError) return authError;

    const id = parseInt(params.id as string, 10);
    const body = await request.json();

    console.log("📝 MSW Handler: Admin blog update", { id, body });

    return HttpResponse.json(
      {
        message: "ブログを更新しました",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }),

  // ブログ削除（管理者用）
  http.delete(`${API_BASE}/admin/blogs/:id`, async ({ request, params }) => {
    console.log("🔍 MSW Handler: DELETE /api/admin/blogs/:id called");

    const authError = requireAuth(request);
    if (authError) return authError;

    const id = parseInt(params.id as string, 10);
    console.log("🗑️ MSW Handler: Admin blog deletion", { id });

    return HttpResponse.json(
      {
        message: "ブログを削除しました",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }),

  // ========== 後方互換性のため ==========

  // 古いAPI endpoints
  http.get(`${API_BASE}/articles`, ({ request }) => {
    console.log(
      "🔍 MSW Handler: GET /api/articles (redirecting to /api/blogs)",
    );

    const url = new URL(request.url);
    const blogsUrl = url.toString().replace("/articles", "/blogs");
    return fetch(blogsUrl)
      .then((res) => res.json())
      .then((data) => HttpResponse.json(data));
  }),
];
