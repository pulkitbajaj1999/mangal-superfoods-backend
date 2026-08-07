import express from 'express';

import prisma from '../lib/prisma.js';

const router = express.Router();

router.get('/', async (request, response) => {
  try {
    const { productId } = request.query;

    const ratings = await prisma.rating.findMany({
      where: productId ? { productId } : {},
      include: {
        user: true,
        product: true,
      },
    });
    response.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    response.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

router.post('/', async (request, response) => {
  try {
    const { rating, review, userId, productId, orderId } = request.body;

    if (!rating || !userId || !productId || !orderId) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    const newRating = await prisma.rating.create({
      data: {
        rating: parseInt(rating),
        review: review || '',
        userId,
        productId,
        orderId,
      },
      include: {
        user: true,
        product: true,
      },
    });

    response.status(201).json(newRating);
  } catch (error) {
    console.error('Error creating rating:', error);
    response.status(500).json({ error: 'Failed to create rating' });
  }
});

export default router;
