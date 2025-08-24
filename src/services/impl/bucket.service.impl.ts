import { IBucket } from '@/models';

export interface CreateBucketRequest {
  name: string;
  ownerId: string;
}

export interface UpdateBucketRequest {
  name?: string;
}

export interface BucketStatsResponse {
  bucketId: string;
  name: string;
  fileCount: number;
  totalSize: number;
  downloadCount: number;
  uploadCount: number;
}

export interface BucketServiceImpl {
  createBucket(bucketData: CreateBucketRequest): Promise<IBucket>;
  getBucketById(bucketId: string): Promise<IBucket | null>;
  getBucketsByOwnerId(ownerId: string): Promise<IBucket[]>;
  getBucketByPublicKey(publicKey: string): Promise<IBucket | null>;
  getBucketByPrivateKey(privateKey: string): Promise<IBucket | null>;
  updateBucket(bucketId: string, updateData: UpdateBucketRequest): Promise<IBucket | null>;
  deleteBucket(bucketId: string): Promise<boolean>;
  getBucketStats(bucketId: string): Promise<BucketStatsResponse | null>;
}
