import express from 'express';

import prisma from '../lib/prisma.js';

const router = express.Router();

router.get('/', async (request, response) => {
  try {
    const { userId } = request.query;

    const whereClause = userId ? { userId } : {};

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: true,
        address: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    response.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    response.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/', async (request, response) => {
  try {
    const { total, userId, addressId, paymentMethod, orderItems, isCouponUsed, coupon } = request.body;

    if (!total || !userId || !addressId || !paymentMethod || !orderItems || orderItems.length === 0) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    // Create order with orderItems
    const order = await prisma.order.create({
      data: {
        total: parseFloat(total),
        userId,
        addressId,
        paymentMethod,
        isCouponUsed: isCouponUsed || false,
        coupon: coupon || {},
        orderItems: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.price),
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    response.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    response.status(500).json({ error: 'Failed to create order' });
  }
});

router.put('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const { status } = request.body;

    if (!status) {
      return response.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return response.status(400).json({ error: 'Invalid status' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        address: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    response.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    response.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
