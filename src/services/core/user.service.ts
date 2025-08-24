import {
  UserServiceImpl,
  UpdateUserRequest,
  ChangePasswordRequest,
} from '../impl/user.service.impl';
import { userRepository } from '@/repositories/core/user.repository';
import { IUser } from '@/models';

class UserService implements UserServiceImpl {
  async getUserByEmail(email: string): Promise<IUser | null> {
    if (!email || email.trim() === '') {
      throw new Error('Email is required');
    }

    return await userRepository.getUserByEmail(email);
  }

  async getUserById(userId: string): Promise<IUser | null> {
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required');
    }

    return await userRepository.getUserByID(userId);
  }

  async updateUser(userId: string, updateData: UpdateUserRequest): Promise<IUser | null> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check if user exists
    const existingUser = await userRepository.getUserByID(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // If email is being updated, check if new email already exists
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await userRepository.getUserByEmail(updateData.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    return await userRepository.updateUser(userId, updateData);
  }

  async deleteUser(userId: string): Promise<boolean> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check if user exists
    const existingUser = await userRepository.getUserByID(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    return await userRepository.deleteUser(userId);
  }

  async changePassword(userId: string, passwordData: ChangePasswordRequest): Promise<boolean> {
    const { currentPassword, newPassword } = passwordData;

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required');
    }

    if (currentPassword === newPassword) {
      throw new Error('New password must be different from current password');
    }

    // Get user
    const user = await userRepository.getUserByID(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    const updateResult = await userRepository.updateUser(userId, {
      password: newPassword,
    } as Partial<IUser>);
    return updateResult !== null;
  }

  async getAllUsers(): Promise<IUser[]> {
    // This method should typically have pagination and admin-only access
    // For now, returning all users without pagination
    return await userRepository.getAllUsers();
  }
}

export const userService = new UserService();
