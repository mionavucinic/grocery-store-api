import bcrypt from 'bcryptjs';
import { isValidObjectId } from 'mongoose';
import { NodeModel } from '../models/node.model';
import { Role, UserModel } from '../models/user.model';
import { AuthUser } from '../middleware/auth.middleware';
import { HttpError } from '../utils/http-error';
import { canManage, canView } from './access.service';

export interface UserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  node?: string;
}

async function findUserOrFail(id: string) {
  if (!isValidObjectId(id)) throw new HttpError(400, 'Invalid user id');
  const user = await UserModel.findById(id);
  if (!user) throw new HttpError(404, 'User not found');
  return user;
}

async function assertNodeExists(nodeId: string) {
  if (!isValidObjectId(nodeId) || !(await NodeModel.exists({ _id: nodeId }))) {
    throw new HttpError(400, 'Node does not exist');
  }
}

export async function getUser(viewer: AuthUser, id: string) {
  const user = await findUserOrFail(id);
  if (!(await canView(viewer, user))) throw new HttpError(403, 'Forbidden');
  return user;
}

export async function createUser(viewer: AuthUser, input: UserInput) {
  const { name, email, password, role, node } = input;
  if (!password || password.length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters');
  }
  if (!node) throw new HttpError(400, 'Node is required');
  await assertNodeExists(node);
  if (!(await canManage(viewer, node))) throw new HttpError(403, 'Forbidden');

  const created = await UserModel.create({
    name,
    email,
    role,
    node,
    password: await bcrypt.hash(password, 10),
  });
  
  return UserModel.findById(created._id);
}

export async function updateUser(viewer: AuthUser, id: string, input: UserInput) {
  const user = await findUserOrFail(id);
  if (!(await canManage(viewer, user.node))) throw new HttpError(403, 'Forbidden');

  // Moving a user is allowed only to a node the manager also manages.
  if (input.node !== undefined) {
    await assertNodeExists(input.node);
    if (!(await canManage(viewer, input.node))) throw new HttpError(403, 'Forbidden');
  }

  const { name, email, role, node, password } = input;
  if (password !== undefined && password.length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters');
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (node !== undefined) user.set('node', node);
  if (password !== undefined) user.password = await bcrypt.hash(password, 10);

  await user.save();
  return UserModel.findById(user._id);
}

export async function deleteUser(viewer: AuthUser, id: string) {
  const user = await findUserOrFail(id);
  if (!(await canManage(viewer, user.node))) throw new HttpError(403, 'Forbidden');
  await user.deleteOne();
}