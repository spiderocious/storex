import { authRouter } from './auth.routes';
import { appRouter } from './app.routes';

export const v1Router = [...authRouter, ...appRouter];
