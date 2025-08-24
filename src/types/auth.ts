export interface AuthenticatedUser {
  id: string;
  email: string;
  iat?: number; // Issued at (JWT timestamp)
  exp?: number; // Expires at (JWT timestamp)
}

export interface JWTPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: {
    _id: string;
    email: string;
    createdAt: Date;
  };
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}
