export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  name: string;
  role: string;
  expiresAt: string;
}

export interface CurrentUser {
  email: string;
  name: string;
  role: string;
  expiresAt: Date;
}
