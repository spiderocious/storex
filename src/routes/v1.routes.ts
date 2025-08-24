import { authRouter } from './auth.routes';
import { appRouter } from './app.routes';
import { publicRouter } from './public.routes';

export const v1Router = [...authRouter, ...appRouter, ...publicRouter];
