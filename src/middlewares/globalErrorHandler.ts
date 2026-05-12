import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { ZodError } from 'zod';
import ApiError from '../errors/ApiError';

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorMessages: { path: string | number; message: string }[] = [];

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorMessages = err.issues.map((issue) => {
      return {
        path: issue.path[issue.path.length - 1] as string | number,
        message: issue.message,
      };
    });
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorMessages = err?.message ? [{ path: '', message: err?.message }] : [];
  } else if (err instanceof Error) {
    message = err.message;
    errorMessages = err?.message ? [{ path: '', message: err?.message }] : [];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: env.node_env !== 'production' ? err.stack : undefined,
  });
};

export default globalErrorHandler;
