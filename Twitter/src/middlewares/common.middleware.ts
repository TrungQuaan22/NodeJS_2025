import { NextFunction, Request, Response } from "express";
import { pick } from "lodash";
type FilterKeys<T> = (keyof T)[];
export const filterBodyMiddleware = <T> (filteredFields: FilterKeys<T>) => (req : Request, res: Response, next: NextFunction) => {
  req.body = pick(req.body, filteredFields);
  next();
}