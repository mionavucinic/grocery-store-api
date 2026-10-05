import { Request, Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getUsersForNode, listMyNodes } from '../services/node.service';

export const nodesRouter = Router();

nodesRouter.use(authenticate);


function includeDescendants(req: Request) {
  return req.query.descendants === 'true';
}

nodesRouter.get('/', async (req, res) => {
  res.json(await listMyNodes(req.user!));
});

nodesRouter.get('/:id/employees', async (req, res) => {
  res.json(await getUsersForNode(req.user!, req.params.id, 'employee', includeDescendants(req)));
});

nodesRouter.get('/:id/managers', async (req, res) => {
  res.json(await getUsersForNode(req.user!, req.params.id, 'manager', includeDescendants(req)));
});