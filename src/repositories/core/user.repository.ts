import { UserRepositoryImpl } from '../impl/user.repository.impl';
import { IUser, User } from '@/models';

class UserRepository implements UserRepositoryImpl {
  async getUserByID(userID: string): Promise<IUser | null> {
    return User.findById(userID);
  }

  async createUser(user: IUser): Promise<IUser> {
    return User.create(user);
  }

  async updateUser(userID: string, user: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(userID, user, { new: true });
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async deleteUser(userID: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(userID);
    return result !== null;
  }

  async getAllUsers(): Promise<IUser[]> {
    return User.find({}).sort({ createdAt: -1 });
  }
}

export const userRepository = new UserRepository();
