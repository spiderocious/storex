import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  ValidationErrorResponse,
  ConflictResponse,
  UnauthorizedResponse,
  NotFoundResponse,
  InternalServerErrorResponse,
} from '@/utils/response';

export type ControllerFunction = (req: Request, res: Response) => Promise<void>;

export interface ErrorMappingRule {
  condition: (errorMessage: string) => boolean;
  handler: (res: Response, errorMessage: string) => void;
}

/**
 * Default error mapping rules for common error patterns
 */
const DEFAULT_ERROR_MAPPINGS: ErrorMappingRule[] = [
  {
    condition: msg => msg.includes('already exists') || msg.includes('duplicate'),
    handler: (res, msg) => ConflictResponse(res, msg),
  },
  {
    condition: msg =>
      msg.includes('not found') ||
      msg.includes('Invalid credentials') ||
      msg.includes('Unauthorized'),
    handler: (res, msg) => UnauthorizedResponse(res, msg),
  },
  {
    condition: msg =>
      msg.includes('does not exist') || msg.includes('Not found') || msg.includes('cannot find'),
    handler: (res, msg) => NotFoundResponse(res, msg),
  },
];

/**
 * Controller wrapper that handles validation errors and common error patterns
 * @param controllerFn The actual controller function to execute
 * @param customErrorMappings Additional error mapping rules specific to the controller
 * @returns Wrapped controller function with error handling
 */
export const controllerWrapper = (
  controllerFn: ControllerFunction,
  customErrorMappings: ErrorMappingRule[] = []
): ControllerFunction => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      // Handle validation errors first
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ValidationErrorResponse(res, errors.array()[0].msg, errors.array());
        return;
      }

      // Execute the actual controller function
      await controllerFn(req, res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';

      // Combine custom and default error mappings
      const allMappings = [...customErrorMappings, ...DEFAULT_ERROR_MAPPINGS];

      // Find matching error mapping rule
      const matchingRule = allMappings.find(rule => rule.condition(errorMessage));

      if (matchingRule) {
        matchingRule.handler(res, errorMessage);
      } else {
        // Default to internal server error
        InternalServerErrorResponse(res, errorMessage);
      }
    }
  };
};

/**
 * Async wrapper for controller functions - alternative syntax
 */
export const asyncController = (controllerFn: ControllerFunction) =>
  controllerWrapper(controllerFn);

/**
 * Pre-configured wrappers for common controller patterns
 */
export const authControllerWrapper = (controllerFn: ControllerFunction) =>
  controllerWrapper(controllerFn, [
    {
      condition: msg => msg.includes('email') && msg.includes('already'),
      handler: res => ConflictResponse(res, 'Email already registered'),
    },
    // {
    //   condition: msg => msg.includes('login') || msg.includes('credentials'),
    //   handler: res => UnauthorizedResponse(res, 'Invalid login credentials'),
    // },
  ]);

export const resourceControllerWrapper = (controllerFn: ControllerFunction) =>
  controllerWrapper(controllerFn, [
    {
      condition: msg => msg.includes('permission') || msg.includes('access'),
      handler: res => UnauthorizedResponse(res, 'Access denied'),
    },
  ]);
