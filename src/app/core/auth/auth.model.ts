export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
  email: string;
  name: string;
  role: string;
  expiresAt: string;
  permissions?: string[];
}

export interface CurrentUser {
  email: string;
  name: string;
  role: string;
  permissions: string[];
  expiresAt: Date;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
}
