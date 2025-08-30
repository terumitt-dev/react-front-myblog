// app/src/api/client.ts
// APIクライアント
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// 汎用的なfetch関数
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || "API Error" };
    }

    return { data };
  } catch (error) {
    console.error("API Error:", error);
    return { error: "Network Error" };
  }
}

// 記事関連API
export const articlesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.category) searchParams.set("category", params.category);
    if (params?.tag) searchParams.set("tag", params.tag);

    const queryString = searchParams.toString();
    return apiCall(`/articles${queryString ? `?${queryString}` : ""}`);
  },

  getBySlug: (slug: string) => apiCall(`/articles/${slug}`),

  getComments: (slug: string) => apiCall(`/articles/${slug}/comments`),
};

// カテゴリAPI
export const categoriesApi = {
  getAll: () => apiCall("/categories"),
};

// タグAPI
export const tagsApi = {
  getAll: () => apiCall("/tags"),
};

// ユーザーAPI
export const usersApi = {
  getById: (id: number) => apiCall(`/users/${id}`),
};

// 認証API
export const authApi = {
  login: (email: string, password: string) =>
    apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiCall("/auth/logout", {
      method: "POST",
    }),
};
