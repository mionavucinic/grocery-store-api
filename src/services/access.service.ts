import { Types } from 'mongoose';
import { NodeModel } from '../models/node.model';
import { Role } from '../models/user.model';
import { AuthUser } from '../middleware/auth.middleware';

type Id = Types.ObjectId | string;

export async function getSubtreeNodeIds(rootId: Id): Promise<Types.ObjectId[]> {
  const descendants = await NodeModel.find({ ancestors: rootId }).select('_id');
  return [new Types.ObjectId(String(rootId)), ...descendants.map((n) => n._id)];
}


export async function isInSubtree(nodeId: Id, rootId: Id): Promise<boolean> {
  if (String(nodeId) === String(rootId)) return true;
  return (await NodeModel.exists({ _id: nodeId, ancestors: rootId })) !== null;
}

export function visibleRoles(user: AuthUser): Role[] {
  return user.role === 'manager' ? ['employee', 'manager'] : ['employee'];
}

export async function canView(user: AuthUser, target: { role: Role; node: Id }) {
  return visibleRoles(user).includes(target.role) && (await isInSubtree(target.node, user.node));
}

// Only managers can create, update or delete, and only inside their own subtree.
export async function canManage(user: AuthUser, targetNode: Id) {
  return user.role === 'manager' && (await isInSubtree(targetNode, user.node));
}