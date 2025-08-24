import { Request } from 'express';
import { IBucket } from '@/models';

export interface AuthenticatedUser {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface RequiredAuthRequest extends Request {
  user: AuthenticatedUser;
}

export interface PublicKeyRequest extends Request {
  bucket?: IBucket;
  publicKey?: string;
}
