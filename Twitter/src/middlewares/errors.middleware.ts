/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // log chi tiết trong console
  res.status(err.status || 500).json(err);
};

export default defaultErrorHandler;
