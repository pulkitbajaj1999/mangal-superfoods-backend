import express from 'express';
import { scryptSync } from 'crypto';

import prisma from '../lib/prisma.js';

const router = express.Router();

function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return derivedKey === key;
}

router.post('/login', async (request, response) => {
  try {
    const { mobile, password } = request.body;

    if (!mobile || !/^\d{10}$/.test(mobile) || !password) {
      return response.status(400).json({ error: 'Invalid mobile or password' });
    }

    const user = await prisma.user.findUnique({ where: { mobile } });
    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    if (!user.password || !verifyPassword(password, user.password)) {
      return response.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _password, ...safeUser } = user;
    response.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Auth login error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
