import { IUser } from '@/models';

export interface UpdateUserRequest {
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserServiceImpl {
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserById(userId: string): Promise<IUser | null>;
  updateUser(userId: string, updateData: UpdateUserRequest): Promise<IUser | null>;
  deleteUser(userId: string): Promise<boolean>;
  changePassword(userId: string, passwordData: ChangePasswordRequest): Promise<boolean>;
  getAllUsers(): Promise<IUser[]>;
}
