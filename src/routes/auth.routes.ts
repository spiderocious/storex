import { authController } from '@/controllers';
import { RouteHandlerType } from '@/utils';
import { loginValidation, signupValidation } from '@/validators';

export const authRouter: RouteHandlerType[] = [
  {
    method: 'post',
    path: '/signup',
    handler: authController.signup,
    middlewares: [signupValidation],
  },
  {
    method: 'post',
    path: '/login',
    handler: authController.login,
    middlewares: [loginValidation],
  },
];
