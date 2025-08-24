/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  _id: string;
  bucketId: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  downloads: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    id: {
      type: String,
      required: [true, 'File ID is required'],
      unique: true,
    },
    bucketId: {
      type: String,
      required: [true, 'Bucket ID is required'],
      ref: 'Bucket',
    },
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'File type is required'],
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative'],
    },
    downloads: {
      type: Number,
      default: 0,
      min: [0, 'Downloads cannot be negative'],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
FileSchema.index({ bucketId: 1 });
FileSchema.index({ name: 1 });
FileSchema.index({ createdAt: -1 });
FileSchema.index({ id: 1 });

export const File = mongoose.model<IFile>('File', FileSchema);
