import { publicController } from '@/controllers/public.controller';
import { PublicKeyMiddleware } from '@/middleware/auth/public-key.middleware';
import { RouteHandlerType } from '@/utils';
import {
  getFileInfoValidation,
  getUploadUriValidation,
  publicUploadFileValidation,
} from '@/validators';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

type route = RouteHandlerType & { public?: boolean };

const baseRoutes: route[] = [
  // POST /api/v1/public/file/upload-uri - Get upload URL for Cloudflare R2
  {
    method: 'post',
    path: '/public/file/upload-uri',
    handler: publicController.getUploadUri,
    middlewares: [getUploadUriValidation],
  },

  // GET /api/v1/public/file/download-uri - Get download URL from Cloudflare R2
  {
    method: 'get',
    path: '/public/file/download-uri/:fileId',
    handler: publicController.getDownloadUrl,
    public: true,
  },

  // GET /api/v1/public/file/download - Stream file directly from Cloudflare R2
  {
    method: 'get',
    path: '/public/file/download/:fileId',
    handler: publicController.downloadFile,
    public: true,
  },

  // POST /api/v1/public/file/upload - Upload file to Cloudflare R2
  {
    method: 'post',
    path: '/public/file/upload',
    handler: publicController.uploadFile,
    middlewares: [publicUploadFileValidation, upload.single('file')],
  },

  // GET /api/v1/public/file/info - Get file info
  {
    method: 'get',
    path: '/public/file/info',
    handler: publicController.getFileInfo,
    middlewares: [getFileInfoValidation],
    public: true,
  },
];

// Apply PublicKeyMiddleware to all public routes
export const publicRouter = baseRoutes.map(route => ({
  ...route,
  middlewares: [...(!route.public ? [PublicKeyMiddleware] : []), ...(route.middlewares ?? [])],
}));
