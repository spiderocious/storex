import { Request, Response } from 'express';
import { authService } from '@/services/core/auth.service';
import { CreatedResponse, SuccessResponse } from '@/utils/response';
import { authControllerWrapper } from '@/utils/controller';

export class AuthController {
  signup = authControllerWrapper(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const result = await authService.register({ email, password });

    CreatedResponse(res, 'User registered successfully', {
      user: {
        id: result.user._id,
        email: result.user.email,
        createdAt: result.user.createdAt,
      },
      token: result.token,
    });
  });

  login = authControllerWrapper(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    SuccessResponse(res, 'Login successful', {
      user: {
        id: result.user._id,
        email: result.user.email,
        createdAt: result.user.createdAt,
      },
      token: result.token,
    });
  });
}

export const authController = new AuthController();
