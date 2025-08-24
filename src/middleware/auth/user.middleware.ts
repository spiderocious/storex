/* eslint-disable @typescript-eslint/no-explicit-any */
import { userService } from '@/services';
import { JWTUtils } from '@/utils/jwt';
import { UnauthorizedResponse } from '@/utils/response';
import { NextFunction, Response } from 'express';

export const LoggedInMiddleware = async (req: any, res: Response, next: NextFunction) => {
  const token = JWTUtils.extractTokenFromHeader(req?.headers?.authorization);
  if (!token) {
    return UnauthorizedResponse(res);
  }

  const decodedData = await JWTUtils.verifyAccessToken(token);
  if (!decodedData) {
    return UnauthorizedResponse(res);
  }

  const userID = decodedData?.userId;
  // verify the userID
  const user = await userService.getUserByIDWithCache(userID);
  if (!user) {
    return UnauthorizedResponse(res);
  }

  req.user = user;

  req.headers.user = user;
  req.headers.id = userID;
  req.headers.userID = userID;
  return next();
};
