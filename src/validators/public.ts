import { body, query } from 'express-validator';

/**
 * Validation rules for getting upload URI
 */
export const getUploadUriValidation = [
  body('fileName')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('File name must be between 1 and 255 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('File name can only contain letters, numbers, dots, hyphens, and underscores'),

  body('fileType').notEmpty().withMessage('File type is required'),

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

  body('originalName')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Original name must be between 1 and 255 characters'),

  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
];

/**
 * Validation rules for file upload (multipart form data)
 * Note: File validation is handled by multer, this validates additional fields
 */
export const publicUploadFileValidation = [
  body('fileName')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('File name must be between 1 and 255 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('File name can only contain letters, numbers, dots, hyphens, and underscores'),

  body('metadata')
    .optional()
    .custom(value => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          throw new Error('Metadata must be valid JSON string');
        }
      }
      return true;
    })
    .withMessage('Metadata must be valid JSON string'),
];

/**
 * Validation rules for getting file info (now uses fileId)
 */
export const getFileInfoValidation = [
  query('fileId')
    .notEmpty()
    .withMessage('fileId query parameter is required')
    .isMongoId()
    .withMessage('Invalid file ID format'),
];
