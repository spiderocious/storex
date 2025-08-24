import { IUser } from '@/models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}

export interface AuthServiceImpl {
  login(loginData: LoginRequest): Promise<AuthResponse>;
  register(registerData: RegisterRequest): Promise<AuthResponse>;
}
