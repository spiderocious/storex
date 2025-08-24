/* eslint-disable @typescript-eslint/no-explicit-any */
import { bucketService } from '@/services/core/bucket.service';
import { bucketRepository } from '@/repositories/core/bucket.repository';
import { fileRepository } from '@/repositories/core/file.repository';
import { userRepository } from '@/repositories/core/user.repository';
import { IBucket, IUser, IFile } from '@/models';
import { CreateBucketRequest, UpdateBucketRequest } from '@/services/impl/bucket.service.impl';

// Mock dependencies
jest.mock('@/repositories/core/bucket.repository');
jest.mock('@/repositories/core/file.repository');
jest.mock('@/repositories/core/user.repository');

const mockBucketRepository = bucketRepository as jest.Mocked<typeof bucketRepository>;
const mockFileRepository = fileRepository as jest.Mocked<typeof fileRepository>;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

describe('BucketService', () => {
  let mockBucket: Partial<IBucket>;
  let mockUser: Partial<IUser>;
  let mockFile: Partial<IFile>;

  beforeEach(() => {
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

    mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createBucket', () => {
    const createBucketData: CreateBucketRequest = {
      name: 'test-bucket',
      ownerId: 'user123',
    };

    it('should successfully create bucket', async () => {
      // Arrange
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockBucketRepository.getBucketsByOwnerID.mockResolvedValue([]);
      mockBucketRepository.createBucket.mockResolvedValue(mockBucket as IBucket);

      // Act
      const result = await bucketService.createBucket(createBucketData);

      // Assert
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(createBucketData.ownerId);
      expect(mockBucketRepository.getBucketsByOwnerID).toHaveBeenCalledWith(
        createBucketData.ownerId
      );
      expect(mockBucketRepository.createBucket).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createBucketData.name,
          ownerId: createBucketData.ownerId,
          downloadCount: 0,
          uploadCount: 0,
          totalSize: 0,
          fileCount: 0,
        })
      );
      expect(result).toBe(mockBucket);
    });

    it('should throw error when bucket name is empty', async () => {
      // Arrange
      const invalidData = { ...createBucketData, name: '' };

      // Act & Assert
      await expect(bucketService.createBucket(invalidData)).rejects.toThrow(
        'Bucket name is required'
      );
      expect(mockUserRepository.getUserByID).not.toHaveBeenCalled();
    });

    it('should throw error when owner ID is empty', async () => {
      // Arrange
      const invalidData = { ...createBucketData, ownerId: '' };

      // Act & Assert
      await expect(bucketService.createBucket(invalidData)).rejects.toThrow('Owner ID is required');
      expect(mockUserRepository.getUserByID).not.toHaveBeenCalled();
    });

    it('should throw error when owner not found', async () => {
      // Arrange
      mockUserRepository.getUserByID.mockResolvedValue(null);

      // Act & Assert
      await expect(bucketService.createBucket(createBucketData)).rejects.toThrow('Owner not found');
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(createBucketData.ownerId);
      expect(mockBucketRepository.getBucketsByOwnerID).not.toHaveBeenCalled();
    });

    it('should throw error when bucket with same name already exists', async () => {
      // Arrange
      const existingBucket = { ...mockBucket, name: 'test-bucket' };
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockBucketRepository.getBucketsByOwnerID.mockResolvedValue([existingBucket as IBucket]);

      // Act & Assert
      await expect(bucketService.createBucket(createBucketData)).rejects.toThrow(
        'Bucket with this name already exists for this owner'
      );
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(createBucketData.ownerId);
      expect(mockBucketRepository.getBucketsByOwnerID).toHaveBeenCalledWith(
        createBucketData.ownerId
      );
      expect(mockBucketRepository.createBucket).not.toHaveBeenCalled();
    });

    it('should handle case-insensitive bucket name comparison', async () => {
      // Arrange
      const existingBucket = { ...mockBucket, name: 'TEST-BUCKET' };
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockBucketRepository.getBucketsByOwnerID.mockResolvedValue([existingBucket as IBucket]);

      // Act & Assert
      await expect(bucketService.createBucket(createBucketData)).rejects.toThrow(
        'Bucket with this name already exists for this owner'
      );
    });

    it('should trim bucket name before creating', async () => {
      // Arrange
      const dataWithWhitespace = { ...createBucketData, name: '  test-bucket  ' };
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockBucketRepository.getBucketsByOwnerID.mockResolvedValue([]);
      mockBucketRepository.createBucket.mockResolvedValue(mockBucket as IBucket);

      // Act
      await bucketService.createBucket(dataWithWhitespace);

      // Assert
      expect(mockBucketRepository.createBucket).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test-bucket',
        })
      );
    });
  });

  describe('getBucketById', () => {
    it('should return bucket when found', async () => {
      // Arrange
      const bucketId = 'bucket123';
      mockBucketRepository.getBucketByID.mockResolvedValue(mockBucket as IBucket);

      // Act
      const result = await bucketService.getBucketById(bucketId);

      // Assert
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(result).toBe(mockBucket);
    });

    it('should return null when bucket not found', async () => {
      // Arrange
      const bucketId = 'nonexistent';
      mockBucketRepository.getBucketByID.mockResolvedValue(null);

      // Act
      const result = await bucketService.getBucketById(bucketId);

      // Assert
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(result).toBeNull();
    });

    it('should throw error when bucket ID is empty', async () => {
      // Act & Assert
      await expect(bucketService.getBucketById('')).rejects.toThrow('Bucket ID is required');
      expect(mockBucketRepository.getBucketByID).not.toHaveBeenCalled();
    });
  });

  describe('getBucketsByOwnerId', () => {
    it('should return buckets when owner exists', async () => {
      // Arrange
      const ownerId = 'user123';
      const buckets = [mockBucket, { ...mockBucket, _id: 'bucket456' }];
      mockUserRepository.getUserByID.mockResolvedValue(mockUser as IUser);
      mockBucketRepository.getBucketsByOwnerID.mockResolvedValue(buckets as IBucket[]);

      // Act
      const result = await bucketService.getBucketsByOwnerId(ownerId);

      // Assert
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(ownerId);
      expect(mockBucketRepository.getBucketsByOwnerID).toHaveBeenCalledWith(ownerId);
      expect(result).toBe(buckets);
    });

    it('should throw error when owner not found', async () => {
      // Arrange
      const ownerId = 'nonexistent';
      mockUserRepository.getUserByID.mockResolvedValue(null);

      // Act & Assert
      await expect(bucketService.getBucketsByOwnerId(ownerId)).rejects.toThrow('Owner not found');
      expect(mockUserRepository.getUserByID).toHaveBeenCalledWith(ownerId);
      expect(mockBucketRepository.getBucketsByOwnerID).not.toHaveBeenCalled();
    });

    it('should throw error when owner ID is empty', async () => {
      // Act & Assert
      await expect(bucketService.getBucketsByOwnerId('')).rejects.toThrow('Owner ID is required');
      expect(mockUserRepository.getUserByID).not.toHaveBeenCalled();
    });
  });

  describe('getBucketByPublicKey', () => {
    it('should return bucket when found', async () => {
      // Arrange
      const publicKey = 'pub_key123';
      mockBucketRepository.getBucketByPublicKey.mockResolvedValue(mockBucket as IBucket);

      // Act
      const result = await bucketService.getBucketByPublicKey(publicKey);

      // Assert
      expect(mockBucketRepository.getBucketByPublicKey).toHaveBeenCalledWith(publicKey);
      expect(result).toBe(mockBucket);
    });

    it('should throw error when public key is empty', async () => {
      // Act & Assert
      await expect(bucketService.getBucketByPublicKey('')).rejects.toThrow(
        'Public key is required'
      );
      expect(mockBucketRepository.getBucketByPublicKey).not.toHaveBeenCalled();
    });
  });

  describe('getBucketByPrivateKey', () => {
    it('should return bucket when found', async () => {
      // Arrange
      const privateKey = 'prv_key123';
      mockBucketRepository.getBucketByPrivateKey.mockResolvedValue(mockBucket as IBucket);

      // Act
      const result = await bucketService.getBucketByPrivateKey(privateKey);

      // Assert
      expect(mockBucketRepository.getBucketByPrivateKey).toHaveBeenCalledWith(privateKey);
      expect(result).toBe(mockBucket);
    });

    it('should throw error when private key is empty', async () => {
      // Act & Assert
      await expect(bucketService.getBucketByPrivateKey('')).rejects.toThrow(
        'Private key is required'
      );
      expect(mockBucketRepository.getBucketByPrivateKey).not.toHaveBeenCalled();
    });
  });

  describe('updateBucket', () => {
    const bucketId = 'bucket123';
    const updateData: UpdateBucketRequest = {
      name: 'updated-bucket',
    };

    it('should successfully update bucket', async () => {
      // Arrange
      const updatedBucket = { ...mockBucket, ...updateData };
      mockBucketRepository.getBucketByID.mockResolvedValue(mockBucket as IBucket);
      mockBucketRepository.getBucketsByOwnerID.mockResolvedValue([]);
      mockBucketRepository.updateBucket.mockResolvedValue(updatedBucket as IBucket);

      // Act
      const result = await bucketService.updateBucket(bucketId, updateData);

      // Assert
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(mockBucketRepository.getBucketsByOwnerID).toHaveBeenCalledWith(mockBucket.ownerId);
      expect(mockBucketRepository.updateBucket).toHaveBeenCalledWith(
        bucketId,
        expect.objectContaining({
          name: updateData.name,
        })
      );
      expect(result).toBe(updatedBucket);
    });

    it('should throw error when bucket not found', async () => {
      // Arrange
      mockBucketRepository.getBucketByID.mockResolvedValue(null);

      // Act & Assert
      await expect(bucketService.updateBucket(bucketId, updateData)).rejects.toThrow(
        'Bucket not found'
      );
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(mockBucketRepository.updateBucket).not.toHaveBeenCalled();
    });

    it('should throw error when new name already exists for owner', async () => {
      // Arrange
      const existingBucketWithName = {
        ...mockBucket,
        _id: 'different-bucket',
        name: 'updated-bucket',
      };
      mockBucketRepository.getBucketByID.mockResolvedValue(mockBucket as IBucket);
      mockBucketRepository.getBucketsByOwnerID.mockResolvedValue([
        existingBucketWithName as IBucket,
      ]);

      // Act & Assert
      await expect(bucketService.updateBucket(bucketId, updateData)).rejects.toThrow(
        'Bucket with this name already exists for this owner'
      );
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(mockBucketRepository.getBucketsByOwnerID).toHaveBeenCalledWith(mockBucket.ownerId);
      expect(mockBucketRepository.updateBucket).not.toHaveBeenCalled();
    });

    it('should allow updating to same name', async () => {
      // Arrange
      const sameNameUpdate = { name: mockBucket.name };
      const updatedBucket = { ...mockBucket };
      mockBucketRepository.getBucketByID.mockResolvedValue(mockBucket as IBucket);
      mockBucketRepository.updateBucket.mockResolvedValue(updatedBucket as IBucket);

      // Act
      const result = await bucketService.updateBucket(bucketId, sameNameUpdate);

      // Assert
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(mockBucketRepository.getBucketsByOwnerID).not.toHaveBeenCalled();
      expect(mockBucketRepository.updateBucket).toHaveBeenCalledWith(bucketId, sameNameUpdate);
      expect(result).toBe(updatedBucket);
    });

    it('should trim bucket name before updating', async () => {
      // Arrange
      const dataWithWhitespace = { name: '  updated-bucket  ' };
      mockBucketRepository.getBucketByID.mockResolvedValue(mockBucket as IBucket);
      mockBucketRepository.getBucketsByOwnerID.mockResolvedValue([]);
      mockBucketRepository.updateBucket.mockResolvedValue(mockBucket as IBucket);

      // Act
      await bucketService.updateBucket(bucketId, dataWithWhitespace);

      // Assert
      expect(mockBucketRepository.updateBucket).toHaveBeenCalledWith(
        bucketId,
        expect.objectContaining({
          name: 'updated-bucket',
        })
      );
    });

    it('should handle case-insensitive name comparison during update', async () => {
      // Arrange
      const caseInsensitiveUpdate = { name: 'UPDATED-BUCKET' };
      const existingBucketWithName = {
        ...mockBucket,
        _id: 'different-bucket',
        name: 'updated-bucket',
      };
      mockBucketRepository.getBucketByID.mockResolvedValue(mockBucket as IBucket);
      mockBucketRepository.getBucketsByOwnerID.mockResolvedValue([
        existingBucketWithName as IBucket,
      ]);

      // Act & Assert
      await expect(bucketService.updateBucket(bucketId, caseInsensitiveUpdate)).rejects.toThrow(
        'Bucket with this name already exists for this owner'
      );
    });
  });

  describe('deleteBucket', () => {
    const bucketId = 'bucket123';

    it('should successfully delete empty bucket', async () => {
      // Arrange
      mockBucketRepository.getBucketByID.mockResolvedValue(mockBucket as IBucket);
      mockFileRepository.getFilesByBucketID.mockResolvedValue([]);
      mockBucketRepository.deleteBucket.mockResolvedValue(true);

      // Act
      const result = await bucketService.deleteBucket(bucketId);

      // Assert
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(mockFileRepository.getFilesByBucketID).toHaveBeenCalledWith(bucketId);
      expect(mockBucketRepository.deleteBucket).toHaveBeenCalledWith(bucketId);
      expect(result).toBe(true);
    });

    it('should throw error when bucket not found', async () => {
      // Arrange
      mockBucketRepository.getBucketByID.mockResolvedValue(null);

      // Act & Assert
      await expect(bucketService.deleteBucket(bucketId)).rejects.toThrow('Bucket not found');
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(mockFileRepository.getFilesByBucketID).not.toHaveBeenCalled();
      expect(mockBucketRepository.deleteBucket).not.toHaveBeenCalled();
    });

    it('should throw error when bucket contains files', async () => {
      // Arrange
      const files = [mockFile];
      mockBucketRepository.getBucketByID.mockResolvedValue(mockBucket as IBucket);
      mockFileRepository.getFilesByBucketID.mockResolvedValue(files as IFile[]);

      // Act & Assert
      await expect(bucketService.deleteBucket(bucketId)).rejects.toThrow(
        'Cannot delete bucket that contains files. Delete all files first.'
      );
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(mockFileRepository.getFilesByBucketID).toHaveBeenCalledWith(bucketId);
      expect(mockBucketRepository.deleteBucket).not.toHaveBeenCalled();
    });

    it('should return false when deletion fails', async () => {
      // Arrange
      mockBucketRepository.getBucketByID.mockResolvedValue(mockBucket as IBucket);
      mockFileRepository.getFilesByBucketID.mockResolvedValue([]);
      mockBucketRepository.deleteBucket.mockResolvedValue(false);

      // Act
      const result = await bucketService.deleteBucket(bucketId);

      // Assert
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(mockFileRepository.getFilesByBucketID).toHaveBeenCalledWith(bucketId);
      expect(mockBucketRepository.deleteBucket).toHaveBeenCalledWith(bucketId);
      expect(result).toBe(false);
    });
  });

  describe('getBucketStats', () => {
    const bucketId = 'bucket123';

    it('should return bucket stats when bucket exists', async () => {
      // Arrange
      mockBucketRepository.getBucketByID.mockResolvedValue(mockBucket as IBucket);

      // Act
      const result = await bucketService.getBucketStats(bucketId);

      // Assert
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(result).toEqual({
        bucketId: mockBucket._id,
        name: mockBucket.name,
        fileCount: mockBucket.fileCount,
        totalSize: mockBucket.totalSize,
        downloadCount: mockBucket.downloadCount,
        uploadCount: mockBucket.uploadCount,
      });
    });

    it('should return null when bucket not found', async () => {
      // Arrange
      mockBucketRepository.getBucketByID.mockResolvedValue(null);

      // Act
      const result = await bucketService.getBucketStats(bucketId);

      // Assert
      expect(mockBucketRepository.getBucketByID).toHaveBeenCalledWith(bucketId);
      expect(result).toBeNull();
    });

    it('should throw error when bucket ID is empty', async () => {
      // Act & Assert
      await expect(bucketService.getBucketStats('')).rejects.toThrow('Bucket ID is required');
      expect(mockBucketRepository.getBucketByID).not.toHaveBeenCalled();
    });
  });

  describe('Input Validation Edge Cases', () => {
    it('should handle undefined parameters gracefully', async () => {
      // Act & Assert
      await expect(bucketService.getBucketById(undefined as any)).rejects.toThrow(
        'Bucket ID is required'
      );
      await expect(bucketService.getBucketsByOwnerId(undefined as any)).rejects.toThrow(
        'Owner ID is required'
      );
      await expect(bucketService.getBucketByPublicKey(undefined as any)).rejects.toThrow(
        'Public key is required'
      );
      await expect(bucketService.getBucketByPrivateKey(undefined as any)).rejects.toThrow(
        'Private key is required'
      );
      await expect(bucketService.deleteBucket(undefined as any)).rejects.toThrow(
        'Bucket ID is required'
      );
      await expect(bucketService.getBucketStats(undefined as any)).rejects.toThrow(
        'Bucket ID is required'
      );
    });

    it('should handle whitespace-only inputs', async () => {
      // Act & Assert
      await expect(bucketService.getBucketById('   ')).rejects.toThrow('Bucket ID is required');
      await expect(bucketService.getBucketsByOwnerId('   ')).rejects.toThrow(
        'Owner ID is required'
      );
      await expect(bucketService.getBucketByPublicKey('   ')).rejects.toThrow(
        'Public key is required'
      );
      await expect(bucketService.getBucketByPrivateKey('   ')).rejects.toThrow(
        'Private key is required'
      );
      await expect(bucketService.deleteBucket('   ')).rejects.toThrow('Bucket ID is required');
      await expect(bucketService.getBucketStats('   ')).rejects.toThrow('Bucket ID is required');
    });

    it('should handle null parameters gracefully', async () => {
      // Act & Assert
      await expect(
        bucketService.createBucket({ name: null as any, ownerId: 'user123' })
      ).rejects.toThrow('Bucket name is required');
      await expect(
        bucketService.createBucket({ name: 'test', ownerId: null as any })
      ).rejects.toThrow('Owner ID is required');
    });
  });
});
