import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Eliminates repetitive try-catch blocks in route controllers.
 * Propagates rejected promises directly to the Express error middleware.
 */
export const asyncHandler = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    fn(req as T, res, next).catch(next);
  };
};
