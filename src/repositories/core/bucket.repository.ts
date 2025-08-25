import { BucketRepositoryImpl } from '../impl/bucket.repository.impl';
import { IBucket, Bucket } from '@/models';

class BucketRepository implements BucketRepositoryImpl {
  async getBucketByID(bucketID: string): Promise<IBucket | null> {
    return Bucket.findOne({ id: bucketID });
  }

  async createBucket(bucket: IBucket): Promise<IBucket> {
    return Bucket.create(bucket);
  }

  async updateBucket(bucketID: string, bucket: Partial<IBucket>): Promise<IBucket | null> {
    return Bucket.findOneAndUpdate({ id: bucketID }, bucket, { new: true });
  }

  async deleteBucket(bucketID: string): Promise<boolean> {
    const result = await Bucket.findOneAndDelete({ id: bucketID });
    return result !== null;
  }

  async getBucketsByOwnerID(ownerID: string): Promise<IBucket[]> {
    return Bucket.find({ ownerId: ownerID }).sort({ createdAt: -1 });
  }

  async getBucketByPublicKey(publicKey: string): Promise<IBucket | null> {
    return Bucket.findOne({ publicKey });
  }

  async getBucketByPrivateKey(privateKey: string): Promise<IBucket | null> {
    return Bucket.findOne({ privateKey });
  }

  async incrementDownloadCount(bucketID: string): Promise<IBucket | null> {
    return Bucket.findOneAndUpdate({ id: bucketID }, { $inc: { downloadCount: 1 } }, { new: true });
  }

  async incrementUploadCount(bucketID: string): Promise<IBucket | null> {
    return Bucket.findOneAndUpdate({ id: bucketID }, { $inc: { uploadCount: 1 } }, { new: true });
  }

  async updateBucketStats(
    bucketID: string,
    fileSizeDelta: number,
    fileCountDelta: number
  ): Promise<IBucket | null> {
    return Bucket.findOneAndUpdate(
      { id: bucketID },
      {
        $inc: {
          totalSize: fileSizeDelta,
          fileCount: fileCountDelta,
        },
      },
      { new: true }
    );
  }
}

export const bucketRepository = new BucketRepository();
