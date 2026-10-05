import { Router } from 'express';
import { login } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  res.json(await login(email, password));
});


authRouter.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});