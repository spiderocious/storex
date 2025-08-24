import { Response, NextFunction } from 'express';
import { bucketService } from '@/services/core/bucket.service';
import { UnauthorizedResponse } from '@/utils/response';
import { PublicKeyRequest } from '@/types/request';

/**
 * Middleware to validate public key authorization
 * Expects Authorization header in format: "Bearer {public_key}"
 */
export const PublicKeyMiddleware = async (
  req: PublicKeyRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      UnauthorizedResponse(res, 'Authorization header is required');
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      UnauthorizedResponse(res, 'Authorization header must start with "Bearer "');
      return;
    }

    const publicKey = authHeader.slice(7); // Remove "Bearer " prefix

    if (!publicKey || publicKey.trim() === '') {
      UnauthorizedResponse(res, 'Public key is required');
      return;
    }

    // Find bucket by public key
    const bucket = await bucketService.getBucketByPublicKey(publicKey);

    if (!bucket) {
      UnauthorizedResponse(res, 'Invalid public key');
      return;
    }

    // Attach bucket and public key to request
    req.bucket = bucket;
    req.publicKey = publicKey;

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Public key validation failed';
    UnauthorizedResponse(res, errorMessage);
  }
};
