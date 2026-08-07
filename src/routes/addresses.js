import express from 'express';

import prisma from '../lib/prisma.js';

const router = express.Router();

router.get('/', async (request, response) => {
  try {
    // For now, return all. In real app, filter by user
    const addresses = await prisma.address.findMany({
      include: {
        user: true,
      },
    });
    response.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    response.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

router.post('/', async (request, response) => {
  try {
    const { userId, name, mobile, pincode, addressLine1, addressLine2, landmark, city, state } = request.body;

    if (!userId || !name || !mobile || !pincode || !addressLine1 || !addressLine2 || !city || !state) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        name,
        mobile,
        pincode,
        addressLine1,
        addressLine2,
        landmark: landmark || null,
        city,
        state,
      },
    });

    response.status(201).json(address);
  } catch (error) {
    console.error('Error creating address:', error);
    response.status(500).json({ error: 'Failed to create address' });
  }
});

export default router;
