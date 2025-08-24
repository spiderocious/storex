import { publicController } from '@/controllers/public.controller';
import { PublicKeyMiddleware } from '@/middleware/auth/public-key.middleware';
import { RouteHandlerType } from '@/utils';
import {
  getUploadUriValidation,
  getDownloadUrlValidation,
  publicUploadFileValidation,
  getFileInfoValidation,
} from '@/validators';

const baseRoutes: RouteHandlerType[] = [
  // POST /api/v1/public/file/upload-uri - Get upload URL for Cloudflare R2
  {
    method: 'post',
    path: '/public/file/upload-uri',
    handler: publicController.getUploadUri,
    middlewares: [getUploadUriValidation],
  },

  // GET /api/v1/public/file/download - Get download URL from Cloudflare R2
  {
    method: 'get',
    path: '/public/file/download',
    handler: publicController.getDownloadUrl,
    middlewares: [getDownloadUrlValidation],
  },

  // POST /api/v1/public/file/upload - Upload file to Cloudflare R2
  {
    method: 'post',
    path: '/public/file/upload',
    handler: publicController.uploadFile,
    middlewares: [publicUploadFileValidation],
  },

  // GET /api/v1/public/file/info - Get file info (bonus endpoint)
  {
    method: 'get',
    path: '/public/file/info',
    handler: publicController.getFileInfo,
    middlewares: [getFileInfoValidation],
  },
];

// Apply PublicKeyMiddleware to all public routes
export const publicRouter = baseRoutes.map(route => ({
  ...route,
  middlewares: [PublicKeyMiddleware, ...(route.middlewares ?? [])],
}));
