import { Response } from 'express';
import { bucketService } from '@/services/core/bucket.service';
import { fileService } from '@/services/core/file.service';
import { userService } from '@/services/core/user.service';
import { SuccessResponse, CreatedResponse } from '@/utils/response';
import { controllerWrapper } from '@/utils/controller';
import { AuthenticatedRequest } from '@/types/request';

export class AppController {
  // GET /api/v1/buckets - List all buckets for the authenticated user
  getBuckets = controllerWrapper(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const buckets = await bucketService.getBucketsByOwnerId(userId);

      SuccessResponse(res, 'Buckets retrieved successfully', {
        buckets,
        count: buckets.length,
      });
    }
  );

  // GET /api/v1/buckets/{bucketId} - Get specific bucket details
  getBucket = controllerWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { bucketId } = req.params;
    if (!req.user?.id) {
      throw new Error('User not authenticated');
    }
    const userId = req.user.id;

    const bucket = await bucketService.getBucketById(bucketId);

    // Check if bucket belongs to user (authorization)
    if (bucket?.ownerId !== userId) {
      throw new Error('Bucket not found or access denied');
    }

    SuccessResponse(res, 'Bucket retrieved successfully', { bucket });
  });

  // GET /api/v1/buckets/{bucketId}/files - List files in bucket
  getBucketFiles = controllerWrapper(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { bucketId } = req.params;
      if (!req.user?.id) {
        throw new Error('User not authenticated');
      }
      const userId = req.user.id;

      // Verify bucket ownership
      const bucket = await bucketService.getBucketById(bucketId);
      if (bucket?.ownerId !== userId) {
        throw new Error('Bucket not found or access denied');
      }

      const files = await fileService.getFilesByBucketId(bucketId);

      SuccessResponse(res, 'Files retrieved successfully', {
        files,
        count: files.length,
        bucketId,
      });
    }
  );

  // GET /api/v1/buckets/{bucketId}/files/{fileId} - Get specific file details
  getFile = controllerWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { bucketId, fileId } = req.params;
    if (!req.user?.id) {
      throw new Error('User not authenticated');
    }
    const userId = req.user.id;

    // Verify bucket ownership
    const bucket = await bucketService.getBucketById(bucketId);
    if (bucket?.ownerId !== userId) {
      throw new Error('Bucket not found or access denied');
    }

    const file = await fileService.getFileById(fileId);

    // Verify file belongs to the bucket
    if (file?.bucketId !== bucketId) {
      throw new Error('File not found in this bucket');
    }

    SuccessResponse(res, 'File retrieved successfully', { file });
  });

  // POST /api/v1/buckets/create - Create new bucket
  createBucket = controllerWrapper(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { name } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const bucket = await bucketService.createBucket({
        name,
        ownerId: userId,
      });

      CreatedResponse(res, 'Bucket created successfully', {
        bucket: {
          id: bucket._id,
          name: bucket.name,
          publicKey: bucket.publicKey,
          privateKey: bucket.privateKey,
          createdAt: bucket.createdAt,
        },
      });
    }
  );

  // POST /api/v1/buckets/{bucketId}/upload - Upload file to bucket
  uploadFile = controllerWrapper(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { bucketId } = req.params;
      const { name, originalName, type, size, metadata } = req.body;
      const userId = req.user?.id;

      // Verify bucket ownership
      const bucket = await bucketService.getBucketById(bucketId);
      if (bucket?.ownerId !== userId) {
        throw new Error('Bucket not found or access denied');
      }

      const file = await fileService.createFile({
        bucketId,
        name,
        originalName,
        type,
        size,
        metadata,
      });

      CreatedResponse(res, 'File uploaded successfully', {
        file: {
          id: file._id,
          name: file.name,
          originalName: file.originalName,
          type: file.type,
          size: file.size,
          bucketId: file.bucketId,
          createdAt: file.createdAt,
        },
      });
    }
  );

  // GET /api/v1/app/dashboard - Analytics dashboard
  getDashboard = controllerWrapper(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Get user's buckets
      const buckets = await bucketService.getBucketsByOwnerId(userId);
      const bucketCount = buckets.length;

      // Calculate total files across all buckets
      let totalFiles = 0;
      let totalApiCalls = 0;

      for (const bucket of buckets) {
        totalFiles += bucket.fileCount || 0;
        totalApiCalls += bucket.uploadCount || 0;
      }

      // Get user info
      const user = await userService.getUserById(userId);

      const dashboardStats = {
        user: {
          id: user?._id,
          email: user?.email,
          memberSince: user?.createdAt,
        },
        stats: {
          totalBuckets: bucketCount,
          totalFiles,
          totalApiCalls,
        },
        recentBuckets: buckets.slice(0, 5).map(bucket => ({
          id: bucket._id,
          name: bucket.name,
          fileCount: bucket.fileCount,
          totalSize: bucket.totalSize,
          lastUpdated: bucket.updatedAt,
        })),
      };

      SuccessResponse(res, 'Dashboard data retrieved successfully', dashboardStats);
    }
  );
}

export const appController = new AppController();
