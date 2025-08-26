import { configs } from '@/configs';
import { logger } from '@/utils/logger';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Config = configs.r2;
// Validate R2 configuration
export const validateR2Config = (): void => {
  const requiredFields = ['accountId', 'accessKeyId', 'secretAccessKey', 'bucketName'];
  const missing = requiredFields.filter(field => !r2Config[field as keyof typeof r2Config]);

  if (missing.length > 0) {
    const error = `Missing R2 configuration: ${missing.join(', ')}`;
    logger.error('R2 Configuration Error:', { missing });

    if (process.env.NODE_ENV === 'production') {
      throw new Error(error);
    } else {
      logger.warn('R2 not configured - media features will be disabled');
    }
  } else {
    logger.info('R2 configuration validated successfully');
  }
};

// Create S3 client for R2 (R2 is S3-compatible)
export const createR2Client = (): S3Client => {
  const endpoint = `https://${r2Config.accountId}.r2.cloudflarestorage.com`;

  const client = new S3Client({
    region: r2Config.region,
    endpoint,
    credentials: {
      accessKeyId: r2Config.accessKeyId,
      secretAccessKey: r2Config.secretAccessKey,
    },
    // R2-specific configurations
    forcePathStyle: false,
    apiVersion: '2006-03-01',
  });

  logger.info('R2 client initialized', {
    endpoint,
    bucket: r2Config.bucketName,
    region: r2Config.region,
  });

  return client;
};

// Singleton R2 client instance
let r2Client: S3Client | null = null;

export const getR2Client = (): S3Client => {
  if (!r2Client) {
    validateR2Config();
    r2Client = createR2Client();
  }
  return r2Client;
};

// R2 Helper Functions
export class R2Helper {
  private static client = getR2Client();

  /**
   * Generate presigned URL for uploading to R2
   */
  static async generatePresignedUploadUrl(
    r2Key: string,
    expiresIn: number = 3600 // 1 hour default
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: r2Config.bucketName,
        Key: r2Key,
      });

      const presignedUrl = await getSignedUrl(this.client, command, {
        expiresIn,
      });

      logger.info('Generated presigned upload URL', {
        r2Key,
        expiresIn,
        bucket: r2Config.bucketName,
      });

      return presignedUrl;
    } catch (error) {
      logger.error('Failed to generate presigned upload URL:', {
        error: (error as Error).message,
        r2Key,
        bucket: r2Config.bucketName,
      });
      throw new Error('Failed to generate upload URL');
    }
  }

  static async uploadFile(file: any, fileKey: string): Promise<any> {
    const uploadParams = {
      Bucket: r2Config.bucketName,
      Key: fileKey,
      Body: file?.buffer,
      ContentType: file?.mimetype,
    };
    const uploadCommand = new PutObjectCommand(uploadParams);
    try {
      const data = await this.client.send(uploadCommand);
      return {
        success: true,
        data: data,
      };
    } catch (err) {
      return {
        error: err,
        success: false,
      };
    }
  }

  /**
   * Generate presigned URL for downloading from R2
   */
  static async generatePresignedDownloadUrl(
    r2Key: string,
    expiresIn: number = 520000
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: r2Config.bucketName,
        Key: r2Key,
      });

      const presignedUrl = await getSignedUrl(this.client, command, {
        expiresIn,
      });

      logger.info('Generated presigned download URL', {
        r2Key,
        expiresIn,
        bucket: r2Config.bucketName,
      });

      return presignedUrl;
    } catch (error) {
      logger.error('Failed to generate presigned download URL:', {
        error: (error as Error).message,
        r2Key,
        bucket: r2Config.bucketName,
      });
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * Delete file from R2
   */
  static async deleteFile(r2Key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: r2Config.bucketName,
        Key: r2Key,
      });

      await this.client.send(command);

      logger.info('File deleted from R2', {
        r2Key,
        bucket: r2Config.bucketName,
      });
    } catch (error) {
      logger.error('Failed to delete file from R2:', {
        error: (error as Error).message,
        r2Key,
        bucket: r2Config.bucketName,
      });
      throw new Error('Failed to delete file from R2');
    }
  }

  /**
   * Check if file exists in R2
   */
  static async fileExists(r2Key: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: r2Config.bucketName,
        Key: r2Key,
      });

      await this.client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        return false;
      }
      logger.error('Error checking file existence:', {
        error: error.message,
        r2Key,
      });
      throw error;
    }
  }

  /**
   * Get file stream from R2
   */
  static async getFileStream(r2Key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: r2Config.bucketName,
        Key: r2Key,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        throw new Error('File body is empty');
      }

      logger.info('File stream retrieved from R2', {
        r2Key,
        bucket: r2Config.bucketName,
      });

      return response.Body;
    } catch (error) {
      logger.error('Failed to get file stream from R2:', {
        error: (error as Error).message,
        r2Key,
        bucket: r2Config.bucketName,
      });
      throw new Error('Failed to retrieve file from R2');
    }
  }

  /**
   * Generate unique R2 key with date-based organization
   */
  static generateR2Key(userId: string, mediaId: string): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `${date}-${userId}-${mediaId}`;
  }
}

// Export R2 configuration and helpers
export default {
  config: r2Config,
  validateConfig: validateR2Config,
  createClient: createR2Client,
  getClient: getR2Client,
  helper: R2Helper,
};
