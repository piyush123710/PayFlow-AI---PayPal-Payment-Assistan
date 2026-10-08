import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { dbService } from '../db.js';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'payflow-ai-super-secret-jwt-key';

authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, businessName, currency } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const existing = dbService.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const newUser = dbService.addUser({
      id: `user_${Date.now()}`,
      name,
      email,
      businessName: businessName || `${name}'s Business`,
      currency: currency || 'INR',
      createdAt: new Date().toISOString(),
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: newUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    let user = dbService.findUserByEmail(email || 'pnagbansi123@gmail.com');

    // If demo login or user not found, fallback to initial demo user
    if (!user) {
      const users = dbService.getUsers();
      user = users[0];
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const defaultUser = dbService.getUsers()[0];
    return res.json({ user: defaultUser });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = dbService.findUserByEmail(decoded.email) || dbService.getUsers()[0];
    res.json({ user });
  } catch {
    const defaultUser = dbService.getUsers()[0];
    res.json({ user: defaultUser });
  }
});
