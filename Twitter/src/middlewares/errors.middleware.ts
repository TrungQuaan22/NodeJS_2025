import { Request, Response, NextFunction } from 'express';

const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // log chi tiết trong console
  res.status(err.status || 500).json(err);
};

export default defaultErrorHandler;
