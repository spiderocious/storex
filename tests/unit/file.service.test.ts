/* eslint-disable @typescript-eslint/no-explicit-any */
import { fileService } from '@/services/core/file.service';
import { fileRepository } from '@/repositories/core/file.repository';
import { bucketRepository } from '@/repositories/core/bucket.repository';
import { IFile, IBucket } from '@/models';
import { CreateFileRequest, UpdateFileRequest } from '@/services/impl/file.service.impl';

// Mock dependencies
jest.mock('@/repositories/core/file.repository');
jest.mock('@/repositories/core/bucket.repository');

const mockFileRepository = fileRepository as jest.Mocked<typeof fileRepository>;
const mockBucketRepository = bucketRepository as jest.Mocked<typeof bucketRepository>;

describe('FileService', () => {
  let mockFile: Partial<IFile>;
  let mockBucket: Partial<IBucket>;

  beforeEach(() => {
    mockFile = {
      _id: 'file123',
      bucketId: 'bucket123',
      name: 'test-file.jpg',
      originalName: 'original-test-file.jpg',
      type: 'image/jpeg',
      size: 1024,
      downloads: 0,
      metadata: { description: 'Test file' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockBucket = {
      _id: 'bucket123',
      name: 'test-bucket',
      ownerId: 'user123',
      publicKey: 'pub_key123',
      privateKey: 'prv_key123',
      downloadCount: 0,
      uploadCount: 0,
      totalSize: 0,
      fileCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createFile', () => {
    const createFileData: CreateFileRequest = {
      bucketId: 'bucket123',
      name: 'test-file.jpg',
      originalName: 'original-test-file.jpg',
      type: 'image/jpeg',
      size: 1024,
      metadata: { description: 'Test file' },
    };

    it('should successfully create file', async () => {
      // Arrange
      mockBucketRepository.getBucketByID.mockResolvedValue(mockBucket as IBucket);
      mockFileRepository.getFileByName.mockResolvedValue(null);
      mockFileRepository.createFile.mockResolvedValue(mockFile as IFile);
      mockBucketRepository.updateBucketStats.mockResolvedValue(mockBucket as IBucket);
      mockBucketRepository.incrementUploadCount.mockResolvedValue(mockBucket as IBucket);

      // Act
      const result = await fileService.createFile(createFileData);

      // Assert
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(createFileData.bucketId);
      expect(mockFileRepository.getFileByName).toHaveBeenCalledWith(
        createFileData.bucketId,
        createFileData.name
      );
      expect(mockFileRepository.createFile).toHaveBeenCalledWith(
        expect.objectContaining({
          bucketId: createFileData.bucketId,
          name: createFileData.name,
          originalName: createFileData.originalName,
          type: createFileData.type,
          size: createFileData.size,
          downloads: 0,
          metadata: createFileData.metadata,
        })
      );
      expect(mockBucketRepository.updateBucketStats).toHaveBeenCalledWith(
        createFileData.bucketId,
        createFileData.size,
        1
      );
      expect(mockBucketRepository.incrementUploadCount).toHaveBeenCalledWith(
        createFileData.bucketId
      );
      expect(result).toBe(mockFile);
    });

    it('should throw error when bucket not found', async () => {
      // Arrange
      mockBucketRepository.getBucketByID.mockResolvedValue(null);

      // Act & Assert
      await expect(fileService.createFile(createFileData)).rejects.toThrow('Bucket not found');
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(createFileData.bucketId);
      expect(mockFileRepository.getFileByName).not.toHaveBeenCalled();
      expect(mockFileRepository.createFile).not.toHaveBeenCalled();
    });

    it('should throw error when file with same name exists', async () => {
      // Arrange
      mockBucketRepository.getBucketByID.mockResolvedValue(mockBucket as IBucket);
      mockFileRepository.getFileByName.mockResolvedValue(mockFile as IFile);

      // Act & Assert
      await expect(fileService.createFile(createFileData)).rejects.toThrow(
        'File with this name already exists in bucket'
      );
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(createFileData.bucketId);
      expect(mockFileRepository.getFileByName).toHaveBeenCalledWith(
        createFileData.bucketId,
        createFileData.name
      );
      expect(mockFileRepository.createFile).not.toHaveBeenCalled();
    });

    it('should throw error when required fields are missing', async () => {
      // Arrange
      const invalidData = { ...createFileData, name: '' };

      // Act & Assert
      await expect(fileService.createFile(invalidData)).rejects.toThrow(
        'All file fields are required'
      );
      expect(mockBucketRepository.getBucketByID).not.toHaveBeenCalled();
    });

    it('should throw error when file size is negative', async () => {
      // Arrange
      const invalidData = { ...createFileData, size: -100 };

      // Act & Assert
      await expect(fileService.createFile(invalidData)).rejects.toThrow(
        'File size cannot be negative'
      );
      expect(mockBucketRepository.getBucketByID).not.toHaveBeenCalled();
    });
  });

  describe('getFileById', () => {
    it('should return file when found', async () => {
      // Arrange
      const fileId = 'file123';
      mockFileRepository.getFileByID.mockResolvedValue(mockFile as IFile);

      // Act
      const result = await fileService.getFileById(fileId);

      // Assert
      expect(mockFileRepository.getFileByID).toHaveBeenCalledWith(fileId);
      expect(result).toBe(mockFile);
    });

    it('should return null when file not found', async () => {
      // Arrange
      const fileId = 'nonexistent';
      mockFileRepository.getFileByID.mockResolvedValue(null);

      // Act
      const result = await fileService.getFileById(fileId);

      // Assert
      expect(mockFileRepository.getFileByID).toHaveBeenCalledWith(fileId);
      expect(result).toBeNull();
    });

    it('should throw error when fileId is empty', async () => {
      // Act & Assert
      await expect(fileService.getFileById('')).rejects.toThrow('File ID is required');
      expect(mockFileRepository.getFileByID).not.toHaveBeenCalled();
    });
  });

  describe('getFilesByBucketId', () => {
    it('should return files when bucket exists', async () => {
      // Arrange
      const bucketId = 'bucket123';
      const files = [mockFile, { ...mockFile, _id: 'file456' }];
      mockBucketRepository.getBucketByID.mockResolvedValue(mockBucket as IBucket);
      mockFileRepository.getFilesByBucketID.mockResolvedValue(files as IFile[]);

      // Act
      const result = await fileService.getFilesByBucketId(bucketId);

      // Assert
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(mockFileRepository.getFilesByBucketID).toHaveBeenCalledWith(bucketId);
      expect(result).toBe(files);
    });

    it('should throw error when bucket not found', async () => {
      // Arrange
      const bucketId = 'nonexistent';
      mockBucketRepository.getBucketByID.mockResolvedValue(null);

      // Act & Assert
      await expect(fileService.getFilesByBucketId(bucketId)).rejects.toThrow('Bucket not found');
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(mockFileRepository.getFilesByBucketID).not.toHaveBeenCalled();
    });

    it('should throw error when bucketId is empty', async () => {
      // Act & Assert
      await expect(fileService.getFilesByBucketId('')).rejects.toThrow('Bucket ID is required');
      expect(mockBucketRepository.getBucketByID).not.toHaveBeenCalled();
    });
  });

  describe('getFileByName', () => {
    it('should return file when found', async () => {
      // Arrange
      const bucketId = 'bucket123';
      const fileName = 'test-file.jpg';
      mockFileRepository.getFileByName.mockResolvedValue(mockFile as IFile);

      // Act
      const result = await fileService.getFileByName(bucketId, fileName);

      // Assert
      expect(mockFileRepository.getFileByName).toHaveBeenCalledWith(bucketId, fileName);
      expect(result).toBe(mockFile);
    });

    it('should throw error when bucketId is empty', async () => {
      // Act & Assert
      await expect(fileService.getFileByName('', 'test.jpg')).rejects.toThrow(
        'Bucket ID is required'
      );
      expect(mockFileRepository.getFileByName).not.toHaveBeenCalled();
    });

    it('should throw error when fileName is empty', async () => {
      // Act & Assert
      await expect(fileService.getFileByName('bucket123', '')).rejects.toThrow(
        'File name is required'
      );
      expect(mockFileRepository.getFileByName).not.toHaveBeenCalled();
    });
  });

  describe('updateFile', () => {
    const fileId = 'file123';
    const updateData: UpdateFileRequest = {
      name: 'updated-file.jpg',
      metadata: { description: 'Updated file' },
    };

    it('should successfully update file', async () => {
      // Arrange
      const updatedFile = { ...mockFile, ...updateData };
      mockFileRepository.getFileByID.mockResolvedValue(mockFile as IFile);
      mockFileRepository.getFileByName.mockResolvedValue(null);
      mockFileRepository.updateFile.mockResolvedValue(updatedFile as IFile);

      // Act
      const result = await fileService.updateFile(fileId, updateData);

      // Assert
      expect(mockFileRepository.getFileByID).toHaveBeenCalledWith(fileId);
      expect(mockFileRepository.getFileByName).toHaveBeenCalledWith(
        mockFile.bucketId,
        updateData.name
      );
      expect(mockFileRepository.updateFile).toHaveBeenCalledWith(fileId, updateData);
      expect(result).toBe(updatedFile);
    });

    it('should throw error when file not found', async () => {
      // Arrange
      mockFileRepository.getFileByID.mockResolvedValue(null);

      // Act & Assert
      await expect(fileService.updateFile(fileId, updateData)).rejects.toThrow('File not found');
      expect(mockFileRepository.getFileByID).toHaveBeenCalledWith(fileId);
      expect(mockFileRepository.updateFile).not.toHaveBeenCalled();
    });

    it('should throw error when new name already exists', async () => {
      // Arrange
      const existingFileWithName = { ...mockFile, _id: 'different-file' };
      mockFileRepository.getFileByID.mockResolvedValue(mockFile as IFile);
      mockFileRepository.getFileByName.mockResolvedValue(existingFileWithName as IFile);

      // Act & Assert
      await expect(fileService.updateFile(fileId, updateData)).rejects.toThrow(
        'File with this name already exists in bucket'
      );
      expect(mockFileRepository.getFileByID).toHaveBeenCalledWith(fileId);
      expect(mockFileRepository.getFileByName).toHaveBeenCalledWith(
        mockFile.bucketId,
        updateData.name
      );
      expect(mockFileRepository.updateFile).not.toHaveBeenCalled();
    });

    it('should allow updating to same name', async () => {
      // Arrange
      const sameNameUpdate = { name: mockFile.name };
      const updatedFile = { ...mockFile };
      mockFileRepository.getFileByID.mockResolvedValue(mockFile as IFile);
      mockFileRepository.updateFile.mockResolvedValue(updatedFile as IFile);

      // Act
      const result = await fileService.updateFile(fileId, sameNameUpdate);

      // Assert
      expect(mockFileRepository.getFileByID).toHaveBeenCalledWith(fileId);
      expect(mockFileRepository.getFileByName).not.toHaveBeenCalled();
      expect(mockFileRepository.updateFile).toHaveBeenCalledWith(fileId, sameNameUpdate);
      expect(result).toBe(updatedFile);
    });
  });

  describe('incrementDownloads', () => {
    const fileId = 'file123';

    it('should successfully increment downloads and update bucket stats', async () => {
      // Arrange
      const updatedFile = { ...mockFile, downloads: 1 };
      mockFileRepository.getFileByID.mockResolvedValue(mockFile as IFile);
      mockFileRepository.incrementDownloads.mockResolvedValue(updatedFile as IFile);
      mockBucketRepository.incrementDownloadCount.mockResolvedValue(mockBucket as IBucket);

      // Act
      const result = await fileService.incrementDownloads(fileId);

      // Assert
      expect(mockFileRepository.getFileByID).toHaveBeenCalledWith(fileId);
      expect(mockFileRepository.incrementDownloads).toHaveBeenCalledWith(fileId);
      expect(mockBucketRepository.incrementDownloadCount).toHaveBeenCalledWith(mockFile.bucketId);
      expect(result).toBe(updatedFile);
    });

    it('should not update bucket stats when increment fails', async () => {
      // Arrange
      mockFileRepository.getFileByID.mockResolvedValue(mockFile as IFile);
      mockFileRepository.incrementDownloads.mockResolvedValue(null);

      // Act
      const result = await fileService.incrementDownloads(fileId);

      // Assert
      expect(mockFileRepository.getFileByID).toHaveBeenCalledWith(fileId);
      expect(mockFileRepository.incrementDownloads).toHaveBeenCalledWith(fileId);
      expect(mockBucketRepository.incrementDownloadCount).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should throw error when file not found', async () => {
      // Arrange
      mockFileRepository.getFileByID.mockResolvedValue(null);

      // Act & Assert
      await expect(fileService.incrementDownloads(fileId)).rejects.toThrow('File not found');
      expect(mockFileRepository.getFileByID).toHaveBeenCalledWith(fileId);
      expect(mockFileRepository.incrementDownloads).not.toHaveBeenCalled();
    });
  });

  describe('Input Validation Edge Cases', () => {
    it('should handle undefined parameters gracefully', async () => {
      // Act & Assert
      await expect(fileService.getFileById(undefined as any)).rejects.toThrow(
        'File ID is required'
      );
      await expect(fileService.getFilesByBucketId(undefined as any)).rejects.toThrow(
        'Bucket ID is required'
      );
      await expect(fileService.deleteFile(undefined as any)).rejects.toThrow('File ID is required');
    });

    it('should handle whitespace-only inputs', async () => {
      // Act & Assert
      await expect(fileService.getFileById('   ')).rejects.toThrow('File ID is required');
      await expect(fileService.getFilesByBucketId('   ')).rejects.toThrow('Bucket ID is required');
      await expect(fileService.getFileByName('   ', 'test.jpg')).rejects.toThrow(
        'Bucket ID is required'
      );
    });
  });
});
