
import type { Role, User } from "../types/user";


export function getSavedToken(): string | null {
  return localStorage.getItem("access_token");
}


export function getSavedRole(): Role | null {
  const role = localStorage.getItem("user_role");

  if (
    role === "Reporter" ||
    role === "Staff" ||
    role === "Admin"
  ) {
    return role;
  }

  return null;
}


export function getSavedUser(): User | null {
  try {
    const savedUser = localStorage.getItem("user");

    return savedUser
      ? (JSON.parse(savedUser) as User)
      : null;
  } catch {
    return null;
  }
}


export function saveSession(
  token: string,
  user: User
): void {
  localStorage.setItem("access_token", token);
  localStorage.setItem("user_role", user.role);
  localStorage.setItem("user", JSON.stringify(user));
}


export function clearSession(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user");
}


export function hasValidSavedSession(): boolean {
  return Boolean(
    getSavedToken() &&
    getSavedRole() &&
    getSavedUser()
  );
}
