
export const API_BASE_URL = "http://127.0.0.1:8001";

export function getAuthHeaders(
  token: string,
  includeJsonContentType = false
): HeadersInit {
  return {
    ...(includeJsonContentType
      ? { "Content-Type": "application/json" }
      : {}),
    Authorization: `Bearer ${token}`,
  };
}

export async function apiRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        ...getAuthHeaders(
          token,
          options.body !== undefined
        ),
        ...options.headers,
      },
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      `Request failed (${response.status}).`
    );
  }

  return data as T;
}
