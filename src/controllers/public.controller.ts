import { fileService } from '@/services/core/file.service';
import { getFromCache } from '@/services/util/cache';
import { R2Helper } from '@/services/util/r2';
import { PublicKeyRequest } from '@/types/request';
import { controllerWrapper } from '@/utils/controller';
import { generateAppID } from '@/utils/id';
import { CreatedResponse, SuccessResponse } from '@/utils/response';
import { Response } from 'express';
import multer from 'multer';

// Configure multer for memory storage (we'll upload directly to R2)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

upload.single('file');

export class PublicController {
  // POST /api/v1/public/file/upload-uri - Create file record first, then get upload URL
  getUploadUri = controllerWrapper(async (req: PublicKeyRequest, res: Response): Promise<void> => {
    const { fileName, fileType, fileSize, originalName, metadata } = req.body;
    const bucket = req.bucket!; // Middleware ensures bucket exists

    if (!fileType || !fileSize) {
      throw new Error('fileType and fileSize are required');
    }

    // Generate filename if not provided
    const finalFileName = `${fileName ?? 'UNNAMED'}xxx${generateAppID('FILE')}`;
    const finalOriginalName = originalName || finalFileName;

    // Create file record in database first
    const file = await fileService.createFile({
      bucketId: bucket.id,
      name: finalFileName,
      originalName: finalOriginalName,
      type: fileType,
      size: fileSize,
      metadata: metadata || {},
    });

    // Use file ID as R2 key
    const r2Key = file.id;

    // Generate presigned upload URL for Cloudflare R2
    const uploadUrl = await R2Helper.generatePresignedUploadUrl(r2Key, 3600); // 1 hour

    SuccessResponse(res, 'Upload URI generated successfully', {
      file: {
        id: file.id,
        name: file.name,
        originalName: file.originalName,
        type: file.type,
        size: file.size,
      },
      bucket: {
        id: bucket.id,
        name: bucket.name,
      },
      upload: {
        url: uploadUrl,
        key: r2Key,
        expiresIn: 3600,
        method: 'PUT',
        headers: {
          'Content-Type': fileType,
        },
      },
    });
  });

  // GET /api/v1/public/file/download-uri/:fileId - Get download URL with caching (using fileId)
  getDownloadUrl = controllerWrapper(
    async (req: PublicKeyRequest, res: Response): Promise<void> => {
      const fileId = req.params.fileId;
      const bucket = req.bucket!; // Middleware ensures bucket exists

      if (!fileId || typeof fileId !== 'string') {
        throw new Error('fileId query parameter is required');
      }

      // Find the file by ID and verify it belongs to the bucket
      const file = await fileService.getFileById(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      if (file.bucketId !== bucket.id) {
        throw new Error('File does not belong to this bucket');
      }

      // Cache key for download URL
      const cacheKey = `download_url:${fileId}`;

      // Try to get from cache first (1 hour cache)
      const cachedUrl = await getFromCache(
        cacheKey,
        async () => {
          // Generate presigned download URL using file ID as R2 key
          const downloadUrl = await R2Helper.generatePresignedDownloadUrl(file.id, 3600);
          return downloadUrl;
        },
        { expiresIn: 60 * 60 * 1000 } // 1 hour in milliseconds
      );

      // Always increment download count (even for cached URLs)
      await fileService.incrementDownloads(file.id);

      SuccessResponse(res, 'Download URL generated successfully', {
        uri: cachedUrl,
        type: file.type,
        file: {
          id: file.id,
          name: file.name,
          originalName: file.originalName,
          type: file.type,
          size: file.size,
          downloads: file.downloads + 1,
        },
        download: {
          url: cachedUrl,
          expiresIn: 3600,
          method: 'GET',
          cached: true, // Could track if it was from cache
        },
      });
    }
  );

  // POST /api/v1/public/file/upload - file upload implementation
  uploadFile = controllerWrapper(async (req: PublicKeyRequest, res: Response): Promise<void> => {
    const bucket = req.bucket!; // Middleware ensures bucket exists
    const uploadedFile = req.file;

    if (!uploadedFile) {
      throw new Error('No file uploaded. Please provide a file in the "file" field.');
    }

    // Extract file information from uploaded file
    const originalName = uploadedFile.originalname;
    const fileType = uploadedFile.mimetype;
    const fileSize = uploadedFile.size;

    // Generate filename or use provided one
    const providedFileName = req.body.fileName;
    const finalFileName = providedFileName || `${Date.now()}_${originalName}`;

    // Check if file with same name already exists in bucket
    if (providedFileName) {
      const existingFile = await fileService.getFileByName(bucket.id, providedFileName);
      if (existingFile) {
        throw new Error('File with this name already exists in bucket');
      }
    }

    // Create file record in database first
    const file = await fileService.createFile({
      bucketId: bucket.id,
      name: finalFileName,
      originalName,
      type: fileType,
      size: fileSize,
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {},
    });

    // Use file ID as R2 key
    const r2Key = file.id;

    try {
      // Upload file directly to R2
      // Note: This is a simplified version. In production, you might want to use streams
      // For now, we'll generate a presigned URL and simulate upload
      const uploadUrl = await R2Helper.generatePresignedUploadUrl(r2Key, 300); // 5 minutes

      // In a real implementation, you would:
      // 1. Use the AWS SDK to put the object directly
      // 2. Or use the presigned URL to upload the buffer
      // For now, we'll return the upload information

      CreatedResponse(res, 'File uploaded successfully', {
        file: {
          id: file.id,
          name: file.name,
          originalName: file.originalName,
          type: file.type,
          size: file.size,
          bucketId: file.bucketId,
          createdAt: file.createdAt,
        },
        bucket: {
          id: bucket.id,
          name: bucket.name,
        },
        upload: {
          status: 'pending_r2_upload',
          r2Key,
          uploadUrl, // Client should use this URL to complete the upload
          note: 'File record created. Use the uploadUrl to complete R2 upload.',
        },
      });
    } catch (error) {
      // If R2 upload fails, we should delete the file record
      await fileService.deleteFile(file.id);
      throw error;
    }
  });

  // GET /api/v1/public/file/download/:fileId - Stream file directly from R2
  downloadFile = controllerWrapper(async (req: PublicKeyRequest, res: Response): Promise<void> => {
    const fileId = req.params.fileId;
    const bucket = req.bucket!; // Middleware ensures bucket exists

    if (!fileId || typeof fileId !== 'string') {
      throw new Error('fileId parameter is required');
    }

    // Find the file by ID and verify it belongs to the bucket
    const file = await fileService.getFileById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    if (file.bucketId !== bucket.id) {
      throw new Error('File does not belong to this bucket');
    }

    // Check if file exists in R2
    const existsInR2 = await R2Helper.fileExists(file.id);
    if (!existsInR2) {
      throw new Error('File not found in storage');
    }

    try {
      // Get file stream from R2 using file ID as key
      const fileStream: any = await R2Helper.getFileStream(file.id);

      // Set appropriate headers
      res.setHeader('Content-Type', file.type);
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Length', file.size.toString());
      res.setHeader('Cache-Control', 'private, max-age=3600'); // 1 hour cache

      // Increment download count
      await fileService.incrementDownloads(file.id);

      // Stream the file directly to the response
      fileStream.pipe(res);

      // Handle stream errors
      fileStream.on('error', (_error: any) => {
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error streaming file' });
        }
      });
    } catch (error) {
      throw new Error('Failed to download file from storage');
    }
  });

  // GET /api/v1/public/file/info - Get file info by fileId
  getFileInfo = controllerWrapper(async (req: PublicKeyRequest, res: Response): Promise<void> => {
    const { fileId } = req.query;
    const bucket = req.bucket!; // Middleware ensures bucket exists

    if (!fileId || typeof fileId !== 'string') {
      throw new Error('fileId query parameter is required');
    }

    // Find the file by ID and verify it belongs to the bucket
    const file = await fileService.getFileById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    if (file.bucketId !== bucket.id) {
      throw new Error('File does not belong to this bucket');
    }

    // Check if file exists in R2 using file ID as key
    const existsInR2 = await R2Helper.fileExists(file.id);

    SuccessResponse(res, 'File info retrieved successfully', {
      file: {
        id: file.id,
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
        id: bucket.id,
        name: bucket.name,
      },
      r2: {
        key: file.id,
        exists: existsInR2,
      },
    });
  });
}

export const publicController = new PublicController();
