import { Response } from 'express';
import { fileService } from '@/services/core/file.service';
import { SuccessResponse, CreatedResponse } from '@/utils/response';
import { controllerWrapper } from '@/utils/controller';
import { PublicKeyRequest } from '@/types/request';

export class PublicController {
  // POST /api/v1/public/file/upload-uri - Get upload URL for Cloudflare R2
  getUploadUri = controllerWrapper(async (req: PublicKeyRequest, res: Response): Promise<void> => {
    const { fileName, fileType, fileSize } = req.body;
    const bucket = req.bucket!; // Middleware ensures bucket exists

    if (!fileName || !fileType) {
      throw new Error('fileName and fileType are required');
    }

    // Check if file already exists in bucket
    const existingFile = await fileService.getFileByName(bucket._id, fileName);
    if (existingFile) {
      throw new Error('File with this name already exists in bucket');
    }

    // Generate presigned upload URL for Cloudflare R2
    // Note: This would typically use Cloudflare R2 SDK
    const uploadUri = `https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/r2/buckets/${bucket.name}/objects/${fileName}`;

    // For now, we'll return a mock response
    // In a real implementation, you'd generate actual presigned URLs
    const presignedData = {
      uploadUrl: uploadUri,
      fields: {
        key: fileName,
        bucket: bucket.name,
        'Content-Type': fileType,
        ...(fileSize && { 'Content-Length': fileSize }),
      },
      expiresIn: 3600, // 1 hour
    };

    SuccessResponse(res, 'Upload URI generated successfully', {
      bucket: {
        id: bucket._id,
        name: bucket.name,
      },
      upload: presignedData,
    });
  });

  // GET /api/v1/public/file/download - Get download URL from Cloudflare R2
  getDownloadUrl = controllerWrapper(
    async (req: PublicKeyRequest, res: Response): Promise<void> => {
      const { fileName } = req.query;
      const bucket = req.bucket!; // Middleware ensures bucket exists

      if (!fileName || typeof fileName !== 'string') {
        throw new Error('fileName query parameter is required');
      }

      // Find the file in the bucket
      const file = await fileService.getFileByName(bucket._id, fileName);
      if (!file) {
        throw new Error('File not found in bucket');
      }

      // Generate presigned download URL for Cloudflare R2
      // Note: This would typically use Cloudflare R2 SDK
      const downloadUrl = `https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/r2/buckets/${bucket.name}/objects/${fileName}`;

      // Increment download count
      await fileService.incrementDownloads(file._id);

      SuccessResponse(res, 'Download URL generated successfully', {
        file: {
          id: file._id,
          name: file.name,
          originalName: file.originalName,
          type: file.type,
          size: file.size,
          downloads: file.downloads + 1,
        },
        downloadUrl,
        expiresIn: 3600, // 1 hour
      });
    }
  );

  // POST /api/v1/public/file/upload - Upload file to Cloudflare R2
  uploadFile = controllerWrapper(async (req: PublicKeyRequest, res: Response): Promise<void> => {
    const { fileName, originalName, fileType, fileSize, metadata } = req.body;
    const bucket = req.bucket!; // Middleware ensures bucket exists

    if (!fileName || !originalName || !fileType || fileSize === undefined) {
      throw new Error('fileName, originalName, fileType, and fileSize are required');
    }

    if (fileSize < 0) {
      throw new Error('File size cannot be negative');
    }

    if (fileSize > 100 * 1024 * 1024) {
      // 100MB limit
      throw new Error('File size cannot exceed 100MB');
    }

    // Check if file already exists in bucket
    const existingFile = await fileService.getFileByName(bucket._id, fileName);
    if (existingFile) {
      throw new Error('File with this name already exists in bucket');
    }

    // Create file record in database
    const file = await fileService.createFile({
      bucketId: bucket._id,
      name: fileName,
      originalName,
      type: fileType,
      size: fileSize,
      metadata: metadata || {},
    });

    // In a real implementation, you would:
    // 1. Upload the actual file to Cloudflare R2
    // 2. Handle multipart/form-data for file uploads
    // 3. Stream the file directly to R2

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
      bucket: {
        id: bucket._id,
        name: bucket.name,
      },
      // Mock R2 response
      r2Response: {
        location: `https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/r2/buckets/${bucket.name}/objects/${fileName}`,
        etag: '"mock-etag-hash"',
        versionId: 'mock-version-id',
      },
    });
  });

  // GET /api/v1/public/file/info - Get file info (bonus endpoint)
  getFileInfo = controllerWrapper(async (req: PublicKeyRequest, res: Response): Promise<void> => {
    const { fileName } = req.query;
    const bucket = req.bucket!; // Middleware ensures bucket exists

    if (!fileName || typeof fileName !== 'string') {
      throw new Error('fileName query parameter is required');
    }

    // Find the file in the bucket
    const file = await fileService.getFileByName(bucket._id, fileName);
    if (!file) {
      throw new Error('File not found in bucket');
    }

    SuccessResponse(res, 'File info retrieved successfully', {
      file: {
        id: file._id,
        name: file.name,
        originalName: file.originalName,
        type: file.type,
        size: file.size,
        downloads: file.downloads,
        metadata: file.metadata,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      },
      bucket: {
        id: bucket._id,
        name: bucket.name,
      },
    });
  });
}

export const publicController = new PublicController();
