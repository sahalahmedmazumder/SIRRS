
export type Role = "Reporter" | "Staff" | "Admin";

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Staff {
  user_id: string;
  name: string;
  email: string;
  role: "Staff";
  is_flagged: boolean;
}

export interface ManagedUser extends User {
  is_flagged: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
