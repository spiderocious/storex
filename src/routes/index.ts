import { createRouter } from '@/utils';
import { v1Router } from './v1.routes';

export const routes = [...v1Router];

export const router = createRouter(routes, '/api/v1');
