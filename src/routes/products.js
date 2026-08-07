import express from 'express';
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';

import prisma from '../lib/prisma.js';
import { s3Client } from '../lib/s3.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (request, response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        rating: true,
        orderItems: true,
      },
    });
    response.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    response.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/', upload.array('images'), async (request, response) => {
  try {
    const files = request.files || [];
    const { name, description, category, inStock } = request.body;
    const mrp = parseFloat(request.body.mrp);
    const price = parseFloat(request.body.price);

    const imageUrls = [];

    if (!name || !description || isNaN(mrp) || isNaN(price) || !files || !category) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    // Upload each file to LocalStack S3
    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      // LocalStack URL format
      imageUrls.push(`${process.env.S3_ENDPOINT}/${process.env.BUCKET_NAME}/${fileName}`);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        mrp: parseFloat(mrp),
        price: parseFloat(price),
        images: imageUrls,
        category,
        inStock: inStock ?? true,
      },
    });

    response.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    response.status(500).json({ error: 'Failed to create product' });
  }
});

router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        rating: true,
        orderItems: true,
      },
    });

    if (!product) {
      return response.status(404).json({ error: 'Product not found' });
    }

    response.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    response.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.put('/:id', upload.array('images'), async (request, response) => {
  try {
    const { id } = request.params;

    // Get new files and the list of URLs to keep
    const newFiles = request.files || [];
    const existingImages = JSON.parse(request.body.existingImages || '[]');

    const uploadedUrls = [];

    // Upload ONLY the modified/new images to LocalStack S3
    for (const file of newFiles) {
      const fileName = `${Date.now()}-${file.originalname}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      uploadedUrls.push(`${process.env.S3_ENDPOINT}/${process.env.BUCKET_NAME}/${fileName}`);
    }

    const finalImages = [...existingImages, ...uploadedUrls];

    const { name, description, mrp, price, category, inStock } = request.body;
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(mrp && { mrp: parseFloat(mrp) }),
        ...(price && { price: parseFloat(price) }),
        ...(finalImages && { images: finalImages }),
        ...(category && { category }),
        ...(inStock !== undefined && { inStock: inStock === 'true' ? true : false }),
      },
    });

    response.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    response.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    // Check if product exists and has any order items
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!product) {
      return response.status(404).json({ error: 'Product not found' });
    }

    // If product has been ordered, don't allow deletion
    if (product.orderItems.length > 0) {
      return response.status(400).json({ error: 'Cannot delete product that has been ordered' });
    }

    await prisma.product.delete({
      where: { id },
    });

    response.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    response.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
