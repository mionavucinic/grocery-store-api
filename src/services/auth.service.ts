import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { UserModel } from '../models/user.model';
import { HttpError } from '../utils/http-error';

export async function login(email: string, password: string) {
  const user = await UserModel.findOne({ email: email?.toLowerCase() }).select('+password');

  if (!user || !(await bcrypt.compare(password ?? '', user.password))) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const token = jwt.sign({ sub: user.id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as SignOptions);

  return { token };
}