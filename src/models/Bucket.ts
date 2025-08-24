import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IBucket extends Document {
  _id: string;
  name: string;
  ownerId: string;
  publicKey: string;
  privateKey: string;
  downloadCount: number;
  uploadCount: number;
  totalSize: number;
  fileCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BucketSchema = new Schema<IBucket>(
  {
    name: {
      type: String,
      required: [true, 'Bucket name is required'],
      trim: true,
      minlength: [2, 'Bucket name must be at least 2 characters long'],
      maxlength: [50, 'Bucket name cannot exceed 50 characters'],
    },
    ownerId: {
      type: String,
      required: [true, 'Owner ID is required'],
      ref: 'User',
    },
    publicKey: {
      type: String,
      required: [true, 'Public key is required'],
      unique: true,
    },
    privateKey: {
      type: String,
      required: [true, 'Private key is required'],
      unique: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: [0, 'Download count cannot be negative'],
    },
    uploadCount: {
      type: Number,
      default: 0,
      min: [0, 'Upload count cannot be negative'],
    },
    totalSize: {
      type: Number,
      default: 0,
      min: [0, 'Total size cannot be negative'],
    },
    fileCount: {
      type: Number,
      default: 0,
      min: [0, 'File count cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate keys if not provided
BucketSchema.pre<IBucket>('save', function (next) {
  if (!this.publicKey) {
    this.publicKey = `pub_${uuidv4().replace(/-/g, '')}`;
  }
  if (!this.privateKey) {
    this.privateKey = `prv_${uuidv4().replace(/-/g, '')}`;
  }
  next();
});

// Indexes for better query performance
BucketSchema.index({ ownerId: 1 });
BucketSchema.index({ publicKey: 1 });
BucketSchema.index({ privateKey: 1 });
BucketSchema.index({ name: 1, ownerId: 1 });

export const Bucket = mongoose.model<IBucket>('Bucket', BucketSchema);
