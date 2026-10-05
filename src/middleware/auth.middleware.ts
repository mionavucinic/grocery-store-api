import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { config } from '../config';
import { Role, UserModel } from '../models/user.model';
import { HttpError } from '../utils/http-error';

export interface AuthUser {
  id: string;
  role: Role;
  node: Types.ObjectId;
}


declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}


export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Missing token');
  }

  let userId: string;
  try {
    const payload = jwt.verify(header.slice('Bearer '.length), config.jwtSecret) as { sub: string };
    userId = payload.sub;
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }


  const user = await UserModel.findById(userId);
  if (!user) {
    throw new HttpError(401, 'User no longer exists');
  }

  req.user = { id: user.id, role: user.role, node: user.node };
  next();
}