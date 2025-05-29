import { Request, Response, NextFunction } from 'express';
import HttpException from '../utils/error-exception.util';

export const errorHandlerMiddleware = (
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status,
    message,
  });
};
