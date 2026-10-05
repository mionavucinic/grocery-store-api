import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { HttpError } from '../utils/http-error';


export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
 
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: err.message });
  }
  
  if (typeof err === 'object' && err !== null && 'code' in err && err.code === 11000) {
    return res.status(409).json({ message: 'Email already in use' });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}