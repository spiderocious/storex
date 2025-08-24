import { IUser } from '@/models';

export interface UserRepositoryImpl {
  getUserByID(userID: string): Promise<IUser | null>;
  createUser(user: IUser): Promise<IUser>;
  updateUser(userID: string, user: Partial<IUser>): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
}
