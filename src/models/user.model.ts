import { Schema, model, Types } from 'mongoose';

export type Role = 'employee' | 'manager';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  node: Types.ObjectId;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['employee', 'manager'], required: true },
    node: { type: Schema.Types.ObjectId, ref: 'Node', required: true, index: true },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>('User', userSchema);