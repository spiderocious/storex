/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler, Router } from 'express';

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export type RouteHandlerType = {
  method: HttpMethod;
  path: string;
  middlewares?: any[];
  handler: RequestHandler;
};

export function createRouter(
  routes: RouteHandlerType[],
  prefix: string = '',
  suffix: string = '',
  middlewares: any[] = []
) {
  const router = Router();

  routes.forEach(route => {
    const { method, path, middlewares: routeMiddlewares = [], handler } = route;
    router[method](prefix + path + suffix, ...middlewares, ...routeMiddlewares, handler);
  });

  return router;
}
