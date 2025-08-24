import { IFile } from '@/models';

export interface CreateFileRequest {
  bucketId: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  metadata?: Record<string, any>;
}

export interface UpdateFileRequest {
  name?: string;
  metadata?: Record<string, any>;
}

export interface FileServiceImpl {
  createFile(fileData: CreateFileRequest): Promise<IFile>;
  getFileById(fileId: string): Promise<IFile | null>;
  getFilesByBucketId(bucketId: string): Promise<IFile[]>;
  getFileByName(bucketId: string, name: string): Promise<IFile | null>;
  updateFile(fileId: string, updateData: UpdateFileRequest): Promise<IFile | null>;
  deleteFile(fileId: string): Promise<boolean>;
  incrementDownloads(fileId: string): Promise<IFile | null>;
}
