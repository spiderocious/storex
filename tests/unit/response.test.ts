import { Response } from 'express';
import {
  SuccessResponse,
  CreatedResponse,
  NoContentResponse,
  ErrorResponse,
  ValidationErrorResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  NotFoundResponse,
  ConflictResponse,
  TooManyRequestsResponse,
  InternalServerErrorResponse,
  ServiceUnavailableResponse,
  GenericResponse,
  BadRequestResponse,
  ServerErrorResponse,
  ApiResponse,
} from '@/utils/response';

describe('Response Utils', () => {
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSet: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    mockSet = jest.fn().mockReturnThis();

    mockResponse = {
      json: mockJson,
      status: mockStatus,
      set: mockSet,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SuccessResponse', () => {
    it('should return 200 status with default message', () => {
      SuccessResponse(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        statusCode: 200,
        message: 'Success',
        data: undefined,
        error: undefined,
        timestamp: expect.any(String),
      });
    });

    it('should return 200 status with custom message and data', () => {
      const testData = { id: 1, name: 'test' };
      SuccessResponse(mockResponse as Response, 'Custom success', testData);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        statusCode: 200,
        message: 'Custom success',
        data: testData,
        error: undefined,
        timestamp: expect.any(String),
      });
    });
  });

  describe('CreatedResponse', () => {
    it('should return 201 status with default message', () => {
      CreatedResponse(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        statusCode: 201,
        message: 'Resource created successfully',
        data: undefined,
        error: undefined,
        timestamp: expect.any(String),
      });
    });

    it('should return 201 status with custom message and data', () => {
      const testData = { id: 2, name: 'created' };
      CreatedResponse(mockResponse as Response, 'User created', testData);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        statusCode: 201,
        message: 'User created',
        data: testData,
        error: undefined,
        timestamp: expect.any(String),
      });
    });
  });

  describe('NoContentResponse', () => {
    it('should return 204 status with default message', () => {
      NoContentResponse(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        statusCode: 204,
        message: 'No content',
        data: undefined,
        error: undefined,
        timestamp: expect.any(String),
      });
    });

    it('should return 204 status with custom message', () => {
      NoContentResponse(mockResponse as Response, 'Resource deleted');

      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        statusCode: 204,
        message: 'Resource deleted',
        data: undefined,
        error: undefined,
        timestamp: expect.any(String),
      });
    });
  });

  describe('ErrorResponse', () => {
    it('should return 400 status with default message', () => {
      ErrorResponse(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 400,
        message: undefined,
        data: undefined,
        error: 'Bad request',
        timestamp: expect.any(String),
      });
    });

    it('should return 400 status with custom message and data', () => {
      const errorData = { field: 'email', issue: 'invalid format' };
      ErrorResponse(mockResponse as Response, 'Validation error', errorData);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 400,
        message: undefined,
        data: errorData,
        error: 'Validation error',
        timestamp: expect.any(String),
      });
    });
  });

  describe('ValidationErrorResponse', () => {
    it('should return 422 status with validation errors', () => {
      const validationErrors = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password too short' },
      ];

      ValidationErrorResponse(mockResponse as Response, 'Validation failed', validationErrors);

      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 422,
        message: undefined,
        data: validationErrors,
        error: 'Validation failed',
        timestamp: expect.any(String),
      });
    });
  });

  describe('UnauthorizedResponse', () => {
    it('should return 401 status with default message', () => {
      UnauthorizedResponse(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 401,
        message: undefined,
        data: undefined,
        error: 'Unauthorized',
        timestamp: expect.any(String),
      });
    });

    it('should return 401 status with custom message', () => {
      UnauthorizedResponse(mockResponse as Response, 'Invalid token');

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 401,
        message: undefined,
        data: undefined,
        error: 'Invalid token',
        timestamp: expect.any(String),
      });
    });
  });

  describe('ForbiddenResponse', () => {
    it('should return 403 status with default message', () => {
      ForbiddenResponse(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 403,
        message: undefined,
        data: undefined,
        error: 'Forbidden',
        timestamp: expect.any(String),
      });
    });
  });

  describe('NotFoundResponse', () => {
    it('should return 404 status with default message', () => {
      NotFoundResponse(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 404,
        message: undefined,
        data: undefined,
        error: 'Resource not found',
        timestamp: expect.any(String),
      });
    });

    it('should return 404 status with custom message', () => {
      NotFoundResponse(mockResponse as Response, 'User not found');

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 404,
        message: undefined,
        data: undefined,
        error: 'User not found',
        timestamp: expect.any(String),
      });
    });
  });

  describe('ConflictResponse', () => {
    it('should return 409 status with default message', () => {
      ConflictResponse(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 409,
        message: undefined,
        data: undefined,
        error: 'Resource conflict',
        timestamp: expect.any(String),
      });
    });

    it('should return 409 status with custom message and data', () => {
      const conflictData = { email: 'test@example.com' };
      ConflictResponse(mockResponse as Response, 'Email already exists', conflictData);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 409,
        message: undefined,
        data: conflictData,
        error: 'Email already exists',
        timestamp: expect.any(String),
      });
    });
  });

  describe('TooManyRequestsResponse', () => {
    it('should return 429 status without retry header', () => {
      TooManyRequestsResponse(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(429);
      expect(mockSet).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 429,
        message: undefined,
        data: undefined,
        error: 'Too many requests',
        timestamp: expect.any(String),
      });
    });

    it('should return 429 status with retry header', () => {
      TooManyRequestsResponse(mockResponse as Response, 'Rate limit exceeded', 300);

      expect(mockStatus).toHaveBeenCalledWith(429);
      expect(mockSet).toHaveBeenCalledWith('Retry-After', '300');
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 429,
        message: undefined,
        data: undefined,
        error: 'Rate limit exceeded',
        timestamp: expect.any(String),
      });
    });
  });

  describe('InternalServerErrorResponse', () => {
    it('should return 500 status with default message', () => {
      InternalServerErrorResponse(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 500,
        message: undefined,
        data: undefined,
        error: 'Internal server error',
        timestamp: expect.any(String),
      });
    });

    it('should return 500 status with custom message and data', () => {
      const errorData = { stackTrace: 'Error stack...' };
      InternalServerErrorResponse(
        mockResponse as Response,
        'Database connection failed',
        errorData
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 500,
        message: undefined,
        data: errorData,
        error: 'Database connection failed',
        timestamp: expect.any(String),
      });
    });
  });

  describe('ServiceUnavailableResponse', () => {
    it('should return 503 status without retry header', () => {
      ServiceUnavailableResponse(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(503);
      expect(mockSet).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 503,
        message: undefined,
        data: undefined,
        error: 'Service unavailable',
        timestamp: expect.any(String),
      });
    });

    it('should return 503 status with retry header', () => {
      ServiceUnavailableResponse(mockResponse as Response, 'Maintenance mode', 600);

      expect(mockStatus).toHaveBeenCalledWith(503);
      expect(mockSet).toHaveBeenCalledWith('Retry-After', '600');
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 503,
        message: undefined,
        data: undefined,
        error: 'Maintenance mode',
        timestamp: expect.any(String),
      });
    });
  });

  describe('GenericResponse', () => {
    it('should return custom status code with success response', () => {
      const customData = { result: 'test' };
      GenericResponse(mockResponse as Response, 206, true, 'Partial content', customData);

      expect(mockStatus).toHaveBeenCalledWith(206);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        statusCode: 206,
        message: 'Partial content',
        data: customData,
        error: undefined,
        timestamp: expect.any(String),
      });
    });

    it('should return custom status code with error response', () => {
      GenericResponse(mockResponse as Response, 418, false, "I'm a teapot");

      expect(mockStatus).toHaveBeenCalledWith(418);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 418,
        message: "I'm a teapot",
        data: undefined,
        error: undefined,
        timestamp: expect.any(String),
      });
    });
  });

  describe('Legacy Aliases', () => {
    it('BadRequestResponse should be alias for ErrorResponse', () => {
      BadRequestResponse(mockResponse as Response, 'Bad request test');

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 400,
        message: undefined,
        data: undefined,
        error: 'Bad request test',
        timestamp: expect.any(String),
      });
    });

    it('ServerErrorResponse should be alias for InternalServerErrorResponse', () => {
      ServerErrorResponse(mockResponse as Response, 'Server error test');

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        statusCode: 500,
        message: undefined,
        data: undefined,
        error: 'Server error test',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Response Structure', () => {
    it('should always include timestamp in ISO format', () => {
      const beforeCall = new Date().toISOString();
      SuccessResponse(mockResponse as Response, 'Test');
      const afterCall = new Date().toISOString();

      const callArgs = mockJson.mock.calls[0][0] as ApiResponse;
      const timestamp = callArgs.timestamp;

      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(timestamp >= beforeCall).toBe(true);
      expect(timestamp <= afterCall).toBe(true);
    });

    it('should maintain consistent response structure', () => {
      SuccessResponse(mockResponse as Response, 'Test', { id: 1 });

      const callArgs = mockJson.mock.calls[0][0] as ApiResponse;

      expect(callArgs).toHaveProperty('success');
      expect(callArgs).toHaveProperty('statusCode');
      expect(callArgs).toHaveProperty('message');
      expect(callArgs).toHaveProperty('data');
      expect(callArgs).toHaveProperty('error');
      expect(callArgs).toHaveProperty('timestamp');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined data gracefully', () => {
      SuccessResponse(mockResponse as Response, 'Test', undefined);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: undefined,
        })
      );
    });

    it('should handle null data gracefully', () => {
      SuccessResponse(mockResponse as Response, 'Test', null);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: null,
        })
      );
    });

    it('should handle complex data objects', () => {
      const complexData = {
        nested: { object: true },
        array: [1, 2, 3],
        date: new Date(),
        null: null,
        undefined: undefined,
      };

      SuccessResponse(mockResponse as Response, 'Test', complexData);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: complexData,
        })
      );
    });
  });
});
