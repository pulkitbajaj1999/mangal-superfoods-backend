import express from 'express';

import prisma from '../lib/prisma.js';

const router = express.Router();

router.get('/', async (request, response) => {
  try {
    const coupons = await prisma.coupon.findMany();
    response.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    response.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

router.post('/', async (request, response) => {
  try {
    const { code, description, discount, forNewUser, forMember, isPublic, expiresAt } = request.body;

    if (!code || !description || discount === undefined || expiresAt === undefined) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    // Validate discount is 0-100
    const discountNum = parseFloat(discount);
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      return response.status(400).json({ error: 'Discount must be between 0 and 100' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description,
        discount: discountNum,
        forNewUser: forNewUser || false,
        forMember: forMember || false,
        isPublic: isPublic || false,
        expiresAt: new Date(expiresAt),
      },
    });

    response.status(201).json(coupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
      return response.status(409).json({ error: 'Coupon code already exists' });
    }
    response.status(500).json({ error: 'Failed to create coupon' });
  }
});

export default router;
