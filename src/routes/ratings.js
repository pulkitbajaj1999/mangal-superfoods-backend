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

    // Validate rating is 1-5
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return response.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return response.status(404).json({ error: 'Product not found' });
    }

    // Check user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    const newRating = await prisma.rating.create({
      data: {
        rating: ratingNum,
        review: review || '',
        userId,
        productId,
        orderId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: true,
      },
    });

    response.status(201).json(newRating);
  } catch (error) {
    console.error('Error creating rating:', error);
    if (error.code === 'P2002') {
      return response.status(409).json({ error: 'You have already rated this product in this order' });
    }
    if (error.code === 'P2003') {
      return response.status(404).json({ error: 'Product or user not found' });
    }
    response.status(500).json({ error: 'Failed to create rating' });
  }
});

export default router;
