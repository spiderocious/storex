import { body, param } from 'express-validator';

/**
 * Validation rules for bucket creation
 */
export const createBucketValidation = [
  body('name')
    .notEmpty()
    .withMessage('Bucket name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Bucket name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9-_\s]+$/)
    .withMessage('Bucket name can only contain letters, numbers, hyphens, underscores, and spaces'),
];

/**
 * Validation rules for file upload
 */
export const uploadFileValidation = [
  param('bucketId')
    .notEmpty()
    .withMessage('Bucket ID is required')
    .isMongoId()
    .withMessage('Invalid bucket ID format'),

  body('name')
    .notEmpty()
    .withMessage('File name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('File name must be between 1 and 255 characters'),

  body('originalName')
    .notEmpty()
    .withMessage('Original file name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Original file name must be between 1 and 255 characters'),

  body('type')
    .notEmpty()
    .withMessage('File type is required')
    .matches(/^[a-z]+\/[a-z0-9\-\\+\\.]+$/i)
    .withMessage('Invalid MIME type format'),

  body('size')
    .isNumeric()
    .withMessage('File size must be a number')
    .custom(value => {
      if (value < 0) {
        throw new Error('File size cannot be negative');
      }
      if (value > 100 * 1024 * 1024) {
        // 100MB limit
        throw new Error('File size cannot exceed 100MB');
      }
      return true;
    }),

  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
];

/**
 * Validation rules for bucket ID parameter
 */
export const bucketIdValidation = [
  param('bucketId')
    .notEmpty()
    .withMessage('Bucket ID is required')
    .isMongoId()
    .withMessage('Invalid bucket ID format'),
];

/**
 * Validation rules for file ID parameter
 */
export const fileIdValidation = [
  param('fileId')
    .notEmpty()
    .withMessage('File ID is required')
    .isMongoId()
    .withMessage('Invalid file ID format'),
];

/**
 * Combined validation for bucket and file ID parameters
 */
export const bucketFileValidation = [...bucketIdValidation, ...fileIdValidation];
