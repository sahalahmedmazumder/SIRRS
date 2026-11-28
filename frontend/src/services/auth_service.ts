
import { API_BASE_URL } from "./api";

export interface AuthResult {
  access_token: string;
  token_type?: string;
  user?: {
    user_id: string;
    name: string;
    email: string;
    role: "Reporter" | "Staff" | "Admin";
  };
}

export async function authRequest<T>(
  endpoint: string,
  payload: Record<string, unknown>
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail || "Authentication request failed."
    );
  }

  return data as T;
}
