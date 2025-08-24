import {
  AuthServiceImpl,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../impl/auth.service.impl';
import { userRepository } from '@/repositories/core/user.repository';
import { IUser } from '@/models';
import { JWTUtils } from '@/utils/jwt';
import { generateAppID } from '@/utils/id';

class AuthService implements AuthServiceImpl {
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Find user by email
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = JWTUtils.generateAccessToken(user);

    // Return user (without password) and token
    return {
      user: this.excludePassword(user),
      token,
    };
  }

  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    const { email, password } = registerData;

    // Check if user already exists
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const userData = {
      id: generateAppID('USER'),
      email,
      password,
    } as IUser;

    const newUser = await userRepository.createUser(userData);

    // Generate JWT token
    const token = JWTUtils.generateAccessToken(newUser);

    // Return user (without password) and token
    return {
      user: this.excludePassword(newUser),
      token,
    };
  }

  private excludePassword(user: IUser): Omit<IUser, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
