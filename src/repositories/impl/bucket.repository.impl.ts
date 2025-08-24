import { IBucket } from '@/models';

export interface BucketRepositoryImpl {
  getBucketByID(bucketID: string): Promise<IBucket | null>;
  createBucket(bucket: IBucket): Promise<IBucket>;
  updateBucket(bucketID: string, bucket: Partial<IBucket>): Promise<IBucket | null>;
  deleteBucket(bucketID: string): Promise<boolean>;
  getBucketsByOwnerID(ownerID: string): Promise<IBucket[]>;
  getBucketByPublicKey(publicKey: string): Promise<IBucket | null>;
  getBucketByPrivateKey(privateKey: string): Promise<IBucket | null>;
  incrementDownloadCount(bucketID: string): Promise<IBucket | null>;
  incrementUploadCount(bucketID: string): Promise<IBucket | null>;
  updateBucketStats(
    bucketID: string,
    fileSizeDelta: number,
    fileCountDelta: number
  ): Promise<IBucket | null>;
}
