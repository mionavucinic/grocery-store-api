import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createUser, deleteUser, getUser, updateUser } from '../services/user.service';

export const usersRouter = Router();


usersRouter.use(authenticate);

usersRouter.get('/:id', async (req, res) => {
  res.json(await getUser(req.user!, req.params.id));
});

usersRouter.post('/', async (req, res) => {
  res.status(201).json(await createUser(req.user!, req.body ?? {}));
});

usersRouter.patch('/:id', async (req, res) => {
  res.json(await updateUser(req.user!, req.params.id, req.body ?? {}));
});

usersRouter.delete('/:id', async (req, res) => {
  await deleteUser(req.user!, req.params.id);
  res.status(204).send();
});