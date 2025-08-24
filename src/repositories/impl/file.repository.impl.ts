import { IFile } from '@/models';

export interface FileRepositoryImpl {
  getFileByID(fileID: string): Promise<IFile | null>;
  createFile(file: IFile): Promise<IFile>;
  updateFile(fileID: string, file: Partial<IFile>): Promise<IFile | null>;
  deleteFile(fileID: string): Promise<boolean>;
  getFilesByBucketID(bucketID: string): Promise<IFile[]>;
  getFileByName(bucketID: string, name: string): Promise<IFile | null>;
  incrementDownloads(fileID: string): Promise<IFile | null>;
}
