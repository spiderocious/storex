import { FileServiceImpl, CreateFileRequest, UpdateFileRequest } from '../impl/file.service.impl';
import { fileRepository } from '@/repositories/core/file.repository';
import { bucketRepository } from '@/repositories/core/bucket.repository';
import { IFile } from '@/models';
import { generateAppID } from '@/utils/id';

class FileService implements FileServiceImpl {
  async createFile(fileData: CreateFileRequest): Promise<IFile> {
    const { bucketId, name, originalName, type, size, metadata } = fileData;

    // Validate required fields
    if (!bucketId || !name || !originalName || !type || size === undefined) {
      throw new Error('All file fields are required');
    }

    if (size < 0) {
      throw new Error('File size cannot be negative');
    }

    // Check if bucket exists
    const bucket = await bucketRepository.getBucketByID(bucketId);
    if (!bucket) {
      throw new Error('Bucket not found');
    }

    // Check if file with same name already exists in bucket
    const existingFile = await fileRepository.getFileByName(bucketId, name);
    if (existingFile) {
      throw new Error('File with this name already exists in bucket');
    }

    // Create file
    const newFile = await fileRepository.createFile({
      id: generateAppID('FILE'),
      key: generateAppID('FILE_KEY'),
      bucketId,
      name,
      originalName,
      type,
      size,
      downloads: 0,
      metadata: metadata || {},
    } as IFile);

    // Update bucket stats
    await bucketRepository.updateBucketStats(bucketId, size, 1);
    await bucketRepository.incrementUploadCount(bucketId);

    return newFile;
  }

  async getFileById(fileId: string): Promise<IFile | null> {
    if (!fileId || fileId.trim() === '') {
      throw new Error('File ID is required');
    }

    return await fileRepository.getFileByID(fileId);
  }

  async getFilesByBucketId(bucketId: string): Promise<IFile[]> {
    if (!bucketId || bucketId.trim() === '') {
      throw new Error('Bucket ID is required');
    }

    // Verify bucket exists
    const bucket = await bucketRepository.getBucketByID(bucketId);
    if (!bucket) {
      throw new Error('Bucket not found');
    }

    return await fileRepository.getFilesByBucketID(bucketId);
  }

  async getFileByName(bucketId: string, name: string): Promise<IFile | null> {
    if (!bucketId || bucketId.trim() === '') {
      throw new Error('Bucket ID is required');
    }

    if (!name || name.trim() === '') {
      throw new Error('File name is required');
    }

    return await fileRepository.getFileByName(bucketId, name);
  }

  async updateFile(fileId: string, updateData: UpdateFileRequest): Promise<IFile | null> {
    if (!fileId || fileId.trim() === '') {
      throw new Error('File ID is required');
    }

    // Check if file exists
    const existingFile = await fileRepository.getFileByID(fileId);
    if (!existingFile) {
      throw new Error('File not found');
    }

    // If name is being updated, check if new name already exists in the same bucket
    if (updateData.name && updateData.name !== existingFile.name) {
      const fileWithNewName = await fileRepository.getFileByName(
        existingFile.bucketId,
        updateData.name
      );
      if (fileWithNewName) {
        throw new Error('File with this name already exists in bucket');
      }
    }

    return await fileRepository.updateFile(fileId, updateData);
  }

  async deleteFile(fileId: string): Promise<boolean> {
    if (!fileId || fileId.trim() === '') {
      throw new Error('File ID is required');
    }

    // Check if file exists
    const existingFile = await fileRepository.getFileByID(fileId);
    if (!existingFile) {
      throw new Error('File not found');
    }

    // Delete file
    const deleted = await fileRepository.deleteFile(fileId);

    if (deleted) {
      // Update bucket stats (decrease size and file count)
      await bucketRepository.updateBucketStats(existingFile.bucketId, -existingFile.size, -1);
    }

    return deleted;
  }

  async incrementDownloads(fileId: string): Promise<IFile | null> {
    if (!fileId || fileId.trim() === '') {
      throw new Error('File ID is required');
    }

    // Check if file exists
    const existingFile = await fileRepository.getFileByID(fileId);
    if (!existingFile) {
      throw new Error('File not found');
    }

    // Increment file downloads
    const updatedFile = await fileRepository.incrementDownloads(fileId);

    // Increment bucket download count
    if (updatedFile) {
      await bucketRepository.incrementDownloadCount(existingFile.bucketId);
    }

    return updatedFile;
  }
}

export const fileService = new FileService();
