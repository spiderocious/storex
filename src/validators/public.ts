import { body, query } from 'express-validator';

/**
 * Validation rules for getting upload URI
 */
export const getUploadUriValidation = [
  body('fileName')
    .notEmpty()
    .withMessage('File name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('File name must be between 1 and 255 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('File name can only contain letters, numbers, dots, hyphens, and underscores'),

  body('fileType')
    .notEmpty()
    .withMessage('File type is required')
    .matches(/^[a-z]+\/[a-z0-9\-\\+\\.]+$/i)
    .withMessage('Invalid MIME type format'),

  body('fileSize')
    .optional()
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
];

/**
 * Validation rules for getting download URL
 */
export const getDownloadUrlValidation = [
  query('fileName')
    .notEmpty()
    .withMessage('fileName query parameter is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('File name must be between 1 and 255 characters'),
];

/**
 * Validation rules for file upload
 */
export const publicUploadFileValidation = [
  body('fileName')
    .notEmpty()
    .withMessage('File name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('File name must be between 1 and 255 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('File name can only contain letters, numbers, dots, hyphens, and underscores'),

  body('originalName')
    .notEmpty()
    .withMessage('Original file name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Original file name must be between 1 and 255 characters'),

  body('fileType')
    .notEmpty()
    .withMessage('File type is required')
    .matches(/^[a-z]+\/[a-z0-9\-\\+\\.]+$/i)
    .withMessage('Invalid MIME type format'),

  body('fileSize')
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
 * Validation rules for getting file info
 */
export const getFileInfoValidation = [
  query('fileName')
    .notEmpty()
    .withMessage('fileName query parameter is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('File name must be between 1 and 255 characters'),
];
