import { Router, RequestHandler } from 'express';
import { createRouter, RouteHandlerType, HttpMethod } from '@/utils/router';

// Mock Express Router
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  })),
}));

describe('createRouter Utility', () => {
  let mockRouter: any;
  let mockHandler: RequestHandler;
  let mockMiddleware1: RequestHandler;
  let mockMiddleware2: RequestHandler;
  let mockRouteMiddleware: RequestHandler;

  beforeEach(() => {
    mockRouter = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
    };

    (Router as jest.Mock).mockReturnValue(mockRouter);

    mockHandler = jest.fn();
    mockMiddleware1 = jest.fn();
    mockMiddleware2 = jest.fn();
    mockRouteMiddleware = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should create a router instance', () => {
      const routes: RouteHandlerType[] = [];
      const router = createRouter(routes);

      expect(Router).toHaveBeenCalled();
      expect(router).toBe(mockRouter);
    });

    it('should register routes with correct HTTP methods', () => {
      const routes: RouteHandlerType[] = [
        { method: 'get', path: '/users', handler: mockHandler },
        { method: 'post', path: '/users', handler: mockHandler },
        { method: 'put', path: '/users/:id', handler: mockHandler },
        { method: 'delete', path: '/users/:id', handler: mockHandler },
        { method: 'patch', path: '/users/:id', handler: mockHandler },
      ];

      createRouter(routes);

      expect(mockRouter.get).toHaveBeenCalledWith('/users', mockHandler);
      expect(mockRouter.post).toHaveBeenCalledWith('/users', mockHandler);
      expect(mockRouter.put).toHaveBeenCalledWith('/users/:id', mockHandler);
      expect(mockRouter.delete).toHaveBeenCalledWith('/users/:id', mockHandler);
      expect(mockRouter.patch).toHaveBeenCalledWith('/users/:id', mockHandler);
    });

    it('should handle empty routes array', () => {
      const routes: RouteHandlerType[] = [];
      createRouter(routes);

      expect(mockRouter.get).not.toHaveBeenCalled();
      expect(mockRouter.post).not.toHaveBeenCalled();
      expect(mockRouter.put).not.toHaveBeenCalled();
      expect(mockRouter.delete).not.toHaveBeenCalled();
      expect(mockRouter.patch).not.toHaveBeenCalled();
    });
  });

  describe('Path Handling', () => {
    it('should apply prefix to routes', () => {
      const routes: RouteHandlerType[] = [
        { method: 'get', path: '/users', handler: mockHandler },
        { method: 'post', path: '/posts', handler: mockHandler },
      ];

      createRouter(routes, '/api');

      expect(mockRouter.get).toHaveBeenCalledWith('/api/users', mockHandler);
      expect(mockRouter.post).toHaveBeenCalledWith('/api/posts', mockHandler);
    });

    it('should apply suffix to routes', () => {
      const routes: RouteHandlerType[] = [
        { method: 'get', path: '/users', handler: mockHandler },
        { method: 'post', path: '/posts', handler: mockHandler },
      ];

      createRouter(routes, '', '/v1');

      expect(mockRouter.get).toHaveBeenCalledWith('/users/v1', mockHandler);
      expect(mockRouter.post).toHaveBeenCalledWith('/posts/v1', mockHandler);
    });

    it('should apply both prefix and suffix to routes', () => {
      const routes: RouteHandlerType[] = [{ method: 'get', path: '/users', handler: mockHandler }];

      createRouter(routes, '/api', '/v1');

      expect(mockRouter.get).toHaveBeenCalledWith('/api/users/v1', mockHandler);
    });

    it('should handle empty prefix and suffix', () => {
      const routes: RouteHandlerType[] = [{ method: 'get', path: '/users', handler: mockHandler }];

      createRouter(routes, '', '');

      expect(mockRouter.get).toHaveBeenCalledWith('/users', mockHandler);
    });

    it('should handle paths with parameters and query strings', () => {
      const routes: RouteHandlerType[] = [
        { method: 'get', path: '/users/:id', handler: mockHandler },
        { method: 'get', path: '/posts/:postId/comments/:commentId', handler: mockHandler },
      ];

      createRouter(routes, '/api');

      expect(mockRouter.get).toHaveBeenCalledWith('/api/users/:id', mockHandler);
      expect(mockRouter.get).toHaveBeenCalledWith(
        '/api/posts/:postId/comments/:commentId',
        mockHandler
      );
    });
  });

  describe('Middleware Handling', () => {
    it('should apply global middlewares to all routes', () => {
      const routes: RouteHandlerType[] = [
        { method: 'get', path: '/users', handler: mockHandler },
        { method: 'post', path: '/users', handler: mockHandler },
      ];

      createRouter(routes, '', '', [mockMiddleware1, mockMiddleware2]);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/users',
        mockMiddleware1,
        mockMiddleware2,
        mockHandler
      );
      expect(mockRouter.post).toHaveBeenCalledWith(
        '/users',
        mockMiddleware1,
        mockMiddleware2,
        mockHandler
      );
    });

    it('should apply route-specific middlewares', () => {
      const routes: RouteHandlerType[] = [
        {
          method: 'get',
          path: '/users',
          middlewares: [mockRouteMiddleware],
          handler: mockHandler,
        },
      ];

      createRouter(routes);

      expect(mockRouter.get).toHaveBeenCalledWith('/users', mockRouteMiddleware, mockHandler);
    });

    it('should apply both global and route-specific middlewares in correct order', () => {
      const routes: RouteHandlerType[] = [
        {
          method: 'get',
          path: '/users',
          middlewares: [mockRouteMiddleware],
          handler: mockHandler,
        },
      ];

      createRouter(routes, '', '', [mockMiddleware1, mockMiddleware2]);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/users',
        mockMiddleware1,
        mockMiddleware2,
        mockRouteMiddleware,
        mockHandler
      );
    });

    it('should handle routes without middlewares', () => {
      const routes: RouteHandlerType[] = [{ method: 'get', path: '/users', handler: mockHandler }];

      createRouter(routes);

      expect(mockRouter.get).toHaveBeenCalledWith('/users', mockHandler);
    });

    it('should handle empty middlewares arrays', () => {
      const routes: RouteHandlerType[] = [
        { method: 'get', path: '/users', middlewares: [], handler: mockHandler },
      ];

      createRouter(routes, '', '', []);

      expect(mockRouter.get).toHaveBeenCalledWith('/users', mockHandler);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple routes with different configurations', () => {
      const routes: RouteHandlerType[] = [
        {
          method: 'get',
          path: '/public',
          handler: mockHandler,
        },
        {
          method: 'post',
          path: '/protected',
          middlewares: [mockRouteMiddleware],
          handler: mockHandler,
        },
        {
          method: 'put',
          path: '/admin/:id',
          middlewares: [mockRouteMiddleware, mockMiddleware1],
          handler: mockHandler,
        },
      ];

      createRouter(routes, '/api', '/v1', [mockMiddleware2]);

      expect(mockRouter.get).toHaveBeenCalledWith('/api/public/v1', mockMiddleware2, mockHandler);
      expect(mockRouter.post).toHaveBeenCalledWith(
        '/api/protected/v1',
        mockMiddleware2,
        mockRouteMiddleware,
        mockHandler
      );
      expect(mockRouter.put).toHaveBeenCalledWith(
        '/api/admin/:id/v1',
        mockMiddleware2,
        mockRouteMiddleware,
        mockMiddleware1,
        mockHandler
      );
    });

    it('should handle routes with special characters in paths', () => {
      const routes: RouteHandlerType[] = [
        { method: 'get', path: '/files/:filename([a-zA-Z0-9._-]+)', handler: mockHandler },
        { method: 'get', path: '/search*', handler: mockHandler },
      ];

      createRouter(routes, '/api');

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/api/files/:filename([a-zA-Z0-9._-]+)',
        mockHandler
      );
      expect(mockRouter.get).toHaveBeenCalledWith('/api/search*', mockHandler);
    });

    it('should handle root paths correctly', () => {
      const routes: RouteHandlerType[] = [
        { method: 'get', path: '/', handler: mockHandler },
        { method: 'get', path: '', handler: mockHandler },
      ];

      createRouter(routes, '/api');

      expect(mockRouter.get).toHaveBeenCalledWith('/api/', mockHandler);
      expect(mockRouter.get).toHaveBeenCalledWith('/api', mockHandler);
    });
  });

  describe('Type Safety', () => {
    it('should accept all valid HTTP methods', () => {
      const httpMethods: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch'];

      httpMethods.forEach(method => {
        const routes: RouteHandlerType[] = [{ method, path: '/test', handler: mockHandler }];

        expect(() => createRouter(routes)).not.toThrow();
      });
    });

    it('should handle routes with various handler types', () => {
      const asyncHandler: RequestHandler = async (req, res, next) => {
        // Async handler
        next();
      };

      const syncHandler: RequestHandler = (req, res) => {
        res.json({ success: true });
      };

      const routes: RouteHandlerType[] = [
        { method: 'get', path: '/async', handler: asyncHandler },
        { method: 'get', path: '/sync', handler: syncHandler },
      ];

      expect(() => createRouter(routes)).not.toThrow();
      expect(mockRouter.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined middlewares gracefully', () => {
      const routes: RouteHandlerType[] = [
        { method: 'get', path: '/users', middlewares: undefined, handler: mockHandler },
      ];

      createRouter(routes);

      expect(mockRouter.get).toHaveBeenCalledWith('/users', mockHandler);
    });

    it('should handle routes with duplicate paths but different methods', () => {
      const routes: RouteHandlerType[] = [
        { method: 'get', path: '/users', handler: mockHandler },
        { method: 'post', path: '/users', handler: mockHandler },
        { method: 'put', path: '/users', handler: mockHandler },
      ];

      createRouter(routes);

      expect(mockRouter.get).toHaveBeenCalledWith('/users', mockHandler);
      expect(mockRouter.post).toHaveBeenCalledWith('/users', mockHandler);
      expect(mockRouter.put).toHaveBeenCalledWith('/users', mockHandler);
    });

    it('should preserve middleware order with multiple middlewares', () => {
      const middlewares = [mockMiddleware1, mockMiddleware2];
      const routeMiddlewares = [mockRouteMiddleware];

      const routes: RouteHandlerType[] = [
        { method: 'get', path: '/users', middlewares: routeMiddlewares, handler: mockHandler },
      ];

      createRouter(routes, '', '', middlewares);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/users',
        mockMiddleware1,
        mockMiddleware2,
        mockRouteMiddleware,
        mockHandler
      );
    });
  });

  describe('Return Value', () => {
    it('should return the configured router instance', () => {
      const routes: RouteHandlerType[] = [{ method: 'get', path: '/test', handler: mockHandler }];

      const router = createRouter(routes);

      expect(router).toBe(mockRouter);
      expect(Router).toHaveBeenCalledTimes(1);
    });

    it('should return a new router instance on each call', () => {
      const routes: RouteHandlerType[] = [];

      const router1 = createRouter(routes);
      const router2 = createRouter(routes);

      expect(Router).toHaveBeenCalledTimes(2);
      expect(router1).toBe(mockRouter);
      expect(router2).toBe(mockRouter);
    });
  });
});
