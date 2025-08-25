import { FileRepositoryImpl } from '../impl/file.repository.impl';
import { IFile, File } from '@/models';

class FileRepository implements FileRepositoryImpl {
  async getFileByID(fileID: string): Promise<IFile | null> {
    return File.findOne({ id: fileID });
  }

  async createFile(file: IFile): Promise<IFile> {
    return File.create(file);
  }

  async updateFile(fileID: string, file: Partial<IFile>): Promise<IFile | null> {
    return File.findOneAndUpdate({ id: fileID }, file, { new: true });
  }

  async deleteFile(fileID: string): Promise<boolean> {
    const result = await File.findOneAndDelete({ id: fileID });
    return result !== null;
  }

  async getFilesByBucketID(bucketID: string): Promise<IFile[]> {
    return File.find({ bucketId: bucketID }).sort({ createdAt: -1 });
  }

  async getFileByName(bucketID: string, name: string): Promise<IFile | null> {
    return File.findOne({ bucketId: bucketID, name });
  }

  async incrementDownloads(fileID: string): Promise<IFile | null> {
    return File.findOneAndUpdate({ id: fileID }, { $inc: { downloads: 1 } }, { new: true });
  }
}

export const fileRepository = new FileRepository();
