import { isValidObjectId } from 'mongoose';
import { NodeModel } from '../models/node.model';
import { Role, UserModel } from '../models/user.model';
import { AuthUser } from '../middleware/auth.middleware';
import { HttpError } from '../utils/http-error';
import { getSubtreeNodeIds, isInSubtree, visibleRoles } from './access.service';


export async function listMyNodes(viewer: AuthUser) {
  const ids = await getSubtreeNodeIds(viewer.node);
  return NodeModel.find({ _id: { $in: ids } }).sort({ name: 1 });
}

export async function getUsersForNode(
  viewer: AuthUser,
  nodeId: string,
  role: Role,
  includeDescendants: boolean,
) {
  if (!isValidObjectId(nodeId)) throw new HttpError(400, 'Invalid node id');
  if (!(await NodeModel.exists({ _id: nodeId }))) throw new HttpError(404, 'Node not found');

  
  if (!visibleRoles(viewer).includes(role)) throw new HttpError(403, 'Forbidden');
  if (!(await isInSubtree(nodeId, viewer.node))) throw new HttpError(403, 'Forbidden');

  const nodeIds = includeDescendants ? await getSubtreeNodeIds(nodeId) : [nodeId];
  return UserModel.find({ role, node: { $in: nodeIds } }).sort({ name: 1 });
}