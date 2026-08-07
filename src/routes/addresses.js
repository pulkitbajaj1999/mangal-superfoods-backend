import express from 'express';

import prisma from '../lib/prisma.js';

const router = express.Router();

router.get('/', async (request, response) => {
  try {
    const { userId } = request.query;

    const whereClause = userId ? { userId } : {};

    const addresses = await prisma.address.findMany({
      where: whereClause,
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

    // Validate required fields (addressLine2 is optional per schema)
    if (!userId || !name || !mobile || !pincode || !addressLine1 || !city || !state) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    // Validate mobile format (10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      return response.status(400).json({ error: 'Invalid mobile format (must be 10 digits)' });
    }

    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return response.status(400).json({ error: 'Invalid pincode format (must be 6 digits)' });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        name,
        mobile,
        pincode,
        addressLine1,
        addressLine2: addressLine2 || null,
        landmark: landmark || null,
        city,
        state,
      },
    });

    response.status(201).json(address);
  } catch (error) {
    console.error('Error creating address:', error);
    if (error.code === 'P2003') {
      return response.status(404).json({ error: 'User not found' });
    }
    response.status(500).json({ error: 'Failed to create address' });
  }
});

export default router;
