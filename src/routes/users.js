import express from 'express';
import { randomBytes, scryptSync } from 'crypto';

import prisma from '../lib/prisma.js';

const router = express.Router();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

router.get('/', async (request, response) => {
  try {
    const { mobile } = request.query;

    if (mobile) {
      const user = await prisma.user.findUnique({ where: { mobile } });
      if (!user) {
        return response.status(404).json({ error: 'User not found' });
      }
      return response.json(user);
    }

    const users = await prisma.user.findMany({
      include: {
        ratings: true,
        Address: true,
        buyerOrders: true,
      },
    });
    response.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    response.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', async (request, response) => {
  try {
    const { id, name, email, image, cart, mobile, password, role } = request.body;

    if (!id || !name) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = password ? hashPassword(password) : null;

    const user = await prisma.user.create({
      data: {
        id,
        name,
        email: email || '',
        image: image || '',
        cart: cart || {},
        mobile: mobile || null,
        password: hashedPassword,
        role: role || 'CUSTOMER',
      },
    });

    response.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    response.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/', async (request, response) => {
  try {
    const { id, name, email } = request.body;

    if (!id) {
      return response.status(400).json({ error: 'User ID is required' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    response.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    response.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
