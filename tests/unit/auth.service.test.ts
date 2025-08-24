import { authService } from '@/services/core/auth.service';
import { userRepository } from '@/repositories/core/user.repository';
import { JWTUtils } from '@/utils/jwt';
import { IUser } from '@/models';
import { LoginRequest, RegisterRequest } from '@/services/impl/auth.service.impl';

// Mock dependencies
jest.mock('@/repositories/core/user.repository');
jest.mock('@/utils/jwt');

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockJWTUtils = JWTUtils as jest.Mocked<typeof JWTUtils>;

describe('AuthService', () => {
  let mockUser: Partial<IUser>;
  let mockToken: string;

  beforeEach(() => {
    mockToken = 'mock-jwt-token';
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

    // Default mock implementations
    mockJWTUtils.generateAccessToken.mockReturnValue(mockToken);
  });

  describe('login', () => {
    const loginData: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(true);
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser as IUser);

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(mockJWTUtils.generateAccessToken).toHaveBeenCalledWith(mockUser);

      expect(result).toEqual({
        user: expect.objectContaining({
          _id: 'user123',
          email: 'test@example.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
        token: mockToken,
      });

      // Verify password is excluded
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error when user does not exist', async () => {
      // Arrange
      mockUserRepository.getUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');

      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockUser.comparePassword).not.toHaveBeenCalled();
      expect(mockJWTUtils.generateAccessToken).not.toHaveBeenCalled();
    });

    it('should throw error when password is invalid', async () => {
      // Arrange
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(false);
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser as IUser);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');

      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(mockJWTUtils.generateAccessToken).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockUserRepository.getUserByEmail.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Database connection failed');

      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockUser.comparePassword).not.toHaveBeenCalled();
      expect(mockJWTUtils.generateAccessToken).not.toHaveBeenCalled();
    });

    it('should handle password comparison errors gracefully', async () => {
      // Arrange
      const passwordError = new Error('Password comparison failed');
      (mockUser.comparePassword as jest.Mock).mockRejectedValue(passwordError);
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser as IUser);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Password comparison failed');

      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(mockJWTUtils.generateAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerData: RegisterRequest = {
      email: 'newuser@example.com',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      const newUser = {
        ...mockUser,
        email: registerData.email,
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: registerData.email,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      mockUserRepository.getUserByEmail.mockResolvedValue(null); // User doesn't exist
      mockUserRepository.createUser.mockResolvedValue(newUser as IUser);

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(registerData.email);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        email: registerData.email,
        password: registerData.password,
      });
      expect(mockJWTUtils.generateAccessToken).toHaveBeenCalledWith(newUser);

      expect(result).toEqual({
        user: expect.objectContaining({
          _id: 'user123',
          email: registerData.email,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
        token: mockToken,
      });

      // Verify password is excluded
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error when user already exists', async () => {
      // Arrange
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser as IUser);

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow(
        'User already exists with this email'
      );

      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(registerData.email);
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
      expect(mockJWTUtils.generateAccessToken).not.toHaveBeenCalled();
    });

    it('should handle user creation errors gracefully', async () => {
      // Arrange
      const creationError = new Error('Failed to create user');
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockRejectedValue(creationError);

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow('Failed to create user');

      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(registerData.email);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        email: registerData.email,
        password: registerData.password,
      });
      expect(mockJWTUtils.generateAccessToken).not.toHaveBeenCalled();
    });

    it('should handle email check errors gracefully', async () => {
      // Arrange
      const emailCheckError = new Error('Database error during email check');
      mockUserRepository.getUserByEmail.mockRejectedValue(emailCheckError);

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow(
        'Database error during email check'
      );

      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(registerData.email);
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
      expect(mockJWTUtils.generateAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('excludePassword private method', () => {
    it('should exclude password from user object in login response', async () => {
      // Arrange
      const userWithPassword = {
        ...mockUser,
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'test@example.com',
          password: 'shouldBeExcluded',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      (userWithPassword.comparePassword as jest.Mock).mockResolvedValue(true);
      mockUserRepository.getUserByEmail.mockResolvedValue(userWithPassword as IUser);

      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toHaveProperty('_id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('createdAt');
      expect(result.user).toHaveProperty('updatedAt');
    });

    it('should exclude password from user object in register response', async () => {
      // Arrange
      const newUserWithPassword = {
        ...mockUser,
        email: 'newuser@example.com',
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'newuser@example.com',
          password: 'shouldBeExcluded',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(newUserWithPassword as IUser);

      const registerData: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toHaveProperty('_id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('createdAt');
      expect(result.user).toHaveProperty('updatedAt');
    });
  });

  describe('JWT Integration', () => {
    it('should call JWTUtils with correct user data for login', async () => {
      // Arrange
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(true);
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser as IUser);

      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Act
      await authService.login(loginData);

      // Assert
      expect(mockJWTUtils.generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(mockJWTUtils.generateAccessToken).toHaveBeenCalledTimes(1);
    });

    it('should call JWTUtils with correct user data for register', async () => {
      // Arrange
      const newUser = {
        ...mockUser,
        email: 'newuser@example.com',
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'newuser@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(newUser as IUser);

      const registerData: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      // Act
      await authService.register(registerData);

      // Assert
      expect(mockJWTUtils.generateAccessToken).toHaveBeenCalledWith(newUser);
      expect(mockJWTUtils.generateAccessToken).toHaveBeenCalledTimes(1);
    });

    it('should return the token generated by JWTUtils', async () => {
      // Arrange
      const customToken = 'custom-jwt-token-123';
      mockJWTUtils.generateAccessToken.mockReturnValue(customToken);

      (mockUser.comparePassword as jest.Mock).mockResolvedValue(true);
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser as IUser);

      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(result.token).toBe(customToken);
    });
  });

  describe('Data Validation', () => {
    it('should handle empty email in login', async () => {
      // Arrange
      mockUserRepository.getUserByEmail.mockResolvedValue(null);

      const loginData: LoginRequest = {
        email: '',
        password: 'password123',
      };

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith('');
    });

    it('should handle empty email in register', async () => {
      // Arrange
      mockUserRepository.getUserByEmail.mockResolvedValue(null);

      const registerData: RegisterRequest = {
        email: '',
        password: 'password123',
      };

      // Act
      const result = authService.register(registerData);

      // Assert - This should create user with empty email (validation is at model level)
      await expect(result).resolves.toBeDefined();
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith('');
    });
  });
});
