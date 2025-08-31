// app/src/api/client.ts
// APIクライアント
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// 認証トークンの取得
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// 汎用的なfetch関数
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    // ヘッダーの準備
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options?.headers,
    };

    // 認証トークンがある場合は追加
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers,
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      // 認証エラーの場合、トークンをクリア
      if (response.status === 401) {
        localStorage.removeItem("token");
      }
      return { error: data.message || "API Error" };
    }

    return { data };
  } catch (error) {
    console.error("API Error:", error);
    return { error: "Network Error" };
  }
}

// 記事関連API
export const blogsApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.category) searchParams.set("category", params.category);

    const queryString = searchParams.toString();
    return apiCall(`/blogs${queryString ? `?${queryString}` : ""}`);
  },

  getById: (id: number) => apiCall(`/blogs/${id}`),

  getComments: (id: number) => apiCall(`/blogs/${id}/comments`),

  // 管理者用API
  create: (data: any) =>
    apiCall("/admin/blogs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    apiCall(`/admin/blogs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiCall(`/admin/blogs/${id}`, {
      method: "DELETE",
    }),
};

// 認証API
export const authApi = {
  login: (email: string, password: string) =>
    apiCall<{ admin: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiCall("/auth/logout", {
      method: "POST",
    }),

  // 認証状態チェック用のエンドポイントを追加
  me: () => apiCall("/auth/me"),
};

// コメントAPI
export const commentsApi = {
  create: (blogId: number, data: { user_name: string; comment: string }) =>
    apiCall(`/blogs/${blogId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
