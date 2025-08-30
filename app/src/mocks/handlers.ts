// app/src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import { articles, comments, users, categories, tags } from "../dummy";

// APIのベースURL
const API_BASE = "/api";

export const handlers = [
  // 記事一覧取得
  http.get(`${API_BASE}/articles`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const category = url.searchParams.get("category");
    const tag = url.searchParams.get("tag");

    let filteredArticles = articles.filter((article) => article.published);

    // カテゴリフィルター
    if (category) {
      filteredArticles = filteredArticles.filter(
        (article) => article.category.slug === category,
      );
    }

    // タグフィルター
    if (tag) {
      filteredArticles = filteredArticles.filter((article) =>
        article.tags.some((t) => t.slug === tag),
      );
    }

    // ページネーション
    const total = filteredArticles.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedArticles = filteredArticles.slice(start, end);

    return HttpResponse.json({
      articles: paginatedArticles,
      pagination: {
        current_page: page,
        per_page: limit,
        total_pages: totalPages,
        total_count: total,
      },
    });
  }),

  // 記事詳細取得
  http.get(`${API_BASE}/articles/:slug`, ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);

    if (!article) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({ article });
  }),

  // 記事のコメント一覧取得
  http.get(`${API_BASE}/articles/:slug/comments`, ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);

    if (!article) {
      return new HttpResponse(null, { status: 404 });
    }

    const articleComments = comments.filter((c) => c.article_id === article.id);

    return HttpResponse.json({
      comments: articleComments.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    });
  }),

  // カテゴリ一覧取得
  http.get(`${API_BASE}/categories`, () => {
    return HttpResponse.json({ categories });
  }),

  // タグ一覧取得
  http.get(`${API_BASE}/tags`, () => {
    return HttpResponse.json({ tags });
  }),

  // ユーザー情報取得
  http.get(`${API_BASE}/users/:id`, ({ params }) => {
    const user = users.find((u) => u.id === parseInt(params.id as string, 10));

    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({ user });
  }),

  // 認証関連のAPI（簡易版）
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    // 簡易的な認証チェック
    const user = users.find((u) => u.email === body.email);

    if (!user) {
      return new HttpResponse(null, { status: 401 });
    }

    return HttpResponse.json({
      user,
      token: "mock-jwt-token",
      message: "ログインしました",
    });
  }),

  // ログアウト
  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({ message: "ログアウトしました" });
  }),
];
