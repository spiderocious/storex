/* eslint-disable @typescript-eslint/no-explicit-any */
import { userService } from '@/services/core/user.service';
import { userRepository } from '@/repositories/core/user.repository';
import { IUser } from '@/models';
import { UpdateUserRequest, ChangePasswordRequest } from '@/services/impl/user.service.impl';

// Mock dependencies
jest.mock('@/repositories/core/user.repository');

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

describe('UserService', () => {
  let mockUser: Partial<IUser>;

  beforeEach(() => {
    mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
      comparePassword: jest.fn(),
      toObject: jest.fn().mockReturnValue({
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('should return user when found by email', async () => {
      // Arrange
      const email = 'test@example.com';
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser as IUser);

      // Act
      const result = await userService.getUserByEmail(email);

      // Assert
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(email);
      expect(result).toBe(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const email = 'notfound@example.com';
      mockUserRepository.getUserByEmail.mockResolvedValue(null);

      // Act
      const result = await userService.getUserByEmail(email);

      // Assert
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });

    it('should throw error when email is empty', async () => {
      // Act & Assert
      await expect(userService.getUserByEmail('')).rejects.toThrow('Email is required');
      expect(mockUserRepository.getUserByEmail).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const email = 'test@example.com';
      const repositoryError = new Error('Database connection failed');
      mockUserRepository.getUserByEmail.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(userService.getUserByEmail(email)).rejects.toThrow('Database connection failed');
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('getUserById', () => {
    it('should return user when found by ID', async () => {
      // Arrange
      const userId = 'user123';
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'nonexistent';
      mockUserRepository.getUserByID.mockResolvedValue(null);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });

    it('should throw error when userId is empty', async () => {
      // Act & Assert
      await expect(userService.getUserById('')).rejects.toThrow('User ID is required');
      expect(mockUserRepository.getUserByID).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const userId = 'user123';
      const repositoryError = new Error('Database connection failed');
      mockUserRepository.getUserByID.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow('Database connection failed');
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateUser', () => {
    const userId = 'user123';
    const updateData: UpdateUserRequest = {
      email: 'newemail@example.com',
    };

    it('should successfully update user', async () => {
      // Arrange
      const updatedUser = { ...mockUser, email: updateData.email };
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockUserRepository.getUserByEmail.mockResolvedValue(null); // Email not taken
      mockUserRepository.updateUser.mockResolvedValue(updatedUser as IUser);

      // Act
      const result = await userService.updateUser(userId, updateData);

      // Assert
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(updateData.email);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(result).toBe(updatedUser);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockUserRepository.getUserByID.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateUser(userId, updateData)).rejects.toThrow('User not found');
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.getUserByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw error when userId is empty', async () => {
      // Act & Assert
      await expect(userService.updateUser('', updateData)).rejects.toThrow('User ID is required');
      expect(mockUserRepository.getUserByID).not.toHaveBeenCalled();
    });

    it('should throw error when new email already exists', async () => {
      // Arrange
      const existingUserWithEmail = { ...mockUser, _id: 'different-user' };
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockUserRepository.getUserByEmail.mockResolvedValue(existingUserWithEmail as IUser);

      // Act & Assert
      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(
        'Email already exists'
      );
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(updateData.email);
      expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should allow updating to same email', async () => {
      // Arrange
      const sameEmailUpdate: UpdateUserRequest = { email: mockUser.email };
      const updatedUser = { ...mockUser };
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockUserRepository.updateUser.mockResolvedValue(updatedUser as IUser);

      // Act
      const result = await userService.updateUser(userId, sameEmailUpdate);

      // Assert
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.getUserByEmail).not.toHaveBeenCalled(); // Should skip email check
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(userId, sameEmailUpdate);
      expect(result).toBe(updatedUser);
    });

    it('should handle update without email change', async () => {
      // Arrange
      const updateWithoutEmail: UpdateUserRequest = {};
      const updatedUser = { ...mockUser };
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockUserRepository.updateUser.mockResolvedValue(updatedUser as IUser);

      // Act
      const result = await userService.updateUser(userId, updateWithoutEmail);

      // Assert
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.getUserByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(userId, updateWithoutEmail);
      expect(result).toBe(updatedUser);
    });
  });

  describe('deleteUser', () => {
    const userId = 'user123';

    it('should successfully delete user', async () => {
      // Arrange
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockUserRepository.deleteUser.mockResolvedValue(true);

      // Act
      const result = await userService.deleteUser(userId);

      // Assert
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockUserRepository.getUserByID.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteUser(userId)).rejects.toThrow('User not found');
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.deleteUser).not.toHaveBeenCalled();
    });

    it('should throw error when userId is empty', async () => {
      // Act & Assert
      await expect(userService.deleteUser('')).rejects.toThrow('User ID is required');
      expect(mockUserRepository.getUserByID).not.toHaveBeenCalled();
      expect(mockUserRepository.deleteUser).not.toHaveBeenCalled();
    });

    it('should return false when deletion fails', async () => {
      // Arrange
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockUserRepository.deleteUser.mockResolvedValue(false);

      // Act
      const result = await userService.deleteUser(userId);

      // Assert
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toBe(false);
    });
  });

  describe('changePassword', () => {
    const userId = 'user123';
    const passwordData: ChangePasswordRequest = {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword123',
    };

    it('should successfully change password', async () => {
      // Arrange
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(true);
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockUserRepository.updateUser.mockResolvedValue(mockUser as IUser);

      // Act
      const result = await userService.changePassword(userId, passwordData);

      // Assert
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(passwordData.currentPassword);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(userId, {
        password: passwordData.newPassword,
      });
      expect(result).toBe(true);
    });

    it('should throw error when userId is empty', async () => {
      // Act & Assert
      await expect(userService.changePassword('', passwordData)).rejects.toThrow(
        'User ID is required'
      );
      expect(mockUserRepository.getUserByID).not.toHaveBeenCalled();
    });

    it('should throw error when current password is missing', async () => {
      // Arrange
      const invalidData = { ...passwordData, currentPassword: '' };

      // Act & Assert
      await expect(userService.changePassword(userId, invalidData)).rejects.toThrow(
        'Current password and new password are required'
      );
      expect(mockUserRepository.getUserByID).not.toHaveBeenCalled();
    });

    it('should throw error when new password is missing', async () => {
      // Arrange
      const invalidData = { ...passwordData, newPassword: '' };

      // Act & Assert
      await expect(userService.changePassword(userId, invalidData)).rejects.toThrow(
        'Current password and new password are required'
      );
      expect(mockUserRepository.getUserByID).not.toHaveBeenCalled();
    });

    it('should throw error when passwords are the same', async () => {
      // Arrange
      const samePasswordData = {
        currentPassword: 'samepassword',
        newPassword: 'samepassword',
      };

      // Act & Assert
      await expect(userService.changePassword(userId, samePasswordData)).rejects.toThrow(
        'New password must be different from current password'
      );
      expect(mockUserRepository.getUserByID).not.toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockUserRepository.getUserByID.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.changePassword(userId, passwordData)).rejects.toThrow(
        'User not found'
      );
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockUser.comparePassword).not.toHaveBeenCalled();
      expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw error when current password is incorrect', async () => {
      // Arrange
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(false);
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);

      // Act & Assert
      await expect(userService.changePassword(userId, passwordData)).rejects.toThrow(
        'Current password is incorrect'
      );
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(passwordData.currentPassword);
      expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should return false when password update fails', async () => {
      // Arrange
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(true);
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockUserRepository.updateUser.mockResolvedValue(null);

      // Act
      const result = await userService.changePassword(userId, passwordData);

      // Assert
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(passwordData.currentPassword);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(userId, {
        password: passwordData.newPassword,
      });
      expect(result).toBe(false);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      // Arrange
      const users = [mockUser, { ...mockUser, _id: 'user456', email: 'user2@example.com' }];
      mockUserRepository.getAllUsers.mockResolvedValue(users as IUser[]);

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(mockUserRepository.getAllUsers).toHaveBeenCalled();
      expect(result).toBe(users);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users found', async () => {
      // Arrange
      mockUserRepository.getAllUsers.mockResolvedValue([]);

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(mockUserRepository.getAllUsers).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockUserRepository.getAllUsers.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(userService.getAllUsers()).rejects.toThrow('Database connection failed');
      expect(mockUserRepository.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('Input Validation Edge Cases', () => {
    it('should handle undefined userId gracefully', async () => {
      // Act & Assert
      await expect(userService.getUserById(undefined as any)).rejects.toThrow(
        'User ID is required'
      );
      await expect(userService.updateUser(undefined as any, {})).rejects.toThrow(
        'User ID is required'
      );
      await expect(userService.deleteUser(undefined as any)).rejects.toThrow('User ID is required');
    });

    it('should handle null email gracefully', async () => {
      // Act & Assert
      await expect(userService.getUserByEmail(null as any)).rejects.toThrow('Email is required');
    });

    it('should handle whitespace-only inputs', async () => {
      // Act & Assert
      await expect(userService.getUserByEmail('   ')).rejects.toThrow('Email is required');
      await expect(userService.getUserById('   ')).rejects.toThrow('User ID is required');
    });
  });

  describe('Repository Integration', () => {
    it('should call repository methods with correct parameters', async () => {
      // Arrange
      const email = 'test@example.com';
      const userId = 'user123';

      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser as IUser);
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockUserRepository.updateUser.mockResolvedValue(mockUser as IUser);
      mockUserRepository.deleteUser.mockResolvedValue(true);
      mockUserRepository.getAllUsers.mockResolvedValue([mockUser as IUser]);

      // Act
      await userService.getUserByEmail(email);
      await userService.getUserById(userId);
      await userService.getAllUsers();

      // Assert
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(email);
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.getAllUsers).toHaveBeenCalledWith();
    });
  });
});
