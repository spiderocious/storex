import { appController } from '@/controllers/app.controller';
import { LoggedInMiddleware } from '@/middleware/auth/user.middleware';
import { RouteHandlerType } from '@/utils';
import {
  createBucketValidation,
  uploadFileValidation,
  bucketIdValidation,
  bucketFileValidation,
} from '@/validators';

export const router: RouteHandlerType[] = [
  // Bucket Management Routes
  {
    method: 'get',
    path: '/buckets',
    handler: appController.getBuckets,
    middlewares: [],
  },
  {
    method: 'get',
    path: '/buckets/:bucketId',
    handler: appController.getBucket,
    middlewares: [bucketIdValidation],
  },
  {
    method: 'get',
    path: '/buckets/:bucketId/files',
    handler: appController.getBucketFiles,
    middlewares: [bucketIdValidation],
  },
  {
    method: 'get',
    path: '/buckets/:bucketId/files/:fileId',
    handler: appController.getFile,
    middlewares: [bucketFileValidation],
  },
  {
    method: 'post',
    path: '/buckets/create',
    handler: appController.createBucket,
    middlewares: [createBucketValidation],
  },
  {
    method: 'post',
    path: '/buckets/:bucketId/upload',
    handler: appController.uploadFile,
    middlewares: [uploadFileValidation],
  },

  // Dashboard Routes
  {
    method: 'get',
    path: '/app/dashboard',
    handler: appController.getDashboard,
    middlewares: [],
  },
];

export const appRouter = router.map(route => ({
  ...route,
  middlewares: [LoggedInMiddleware, ...(route.middlewares ?? [])],
}));
