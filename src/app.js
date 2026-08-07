import express from 'express';
import cors from 'cors';

import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import addressesRouter from './routes/addresses.js';
import ratingsRouter from './routes/ratings.js';
import couponsRouter from './routes/coupons.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import smsRouter from './routes/sms.js';

// Comma-separated list of allowed origins, e.g. "http://localhost:3000,https://mangalsuperfoods.com"
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

app.get('/health', (request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/sms', smsRouter);

// Fallback error handler (route handlers already catch their own errors,
// this only catches anything unexpected e.g. malformed JSON bodies).
app.use((error, request, response, next) => {
  console.error('Unhandled error:', error);
  response.status(500).json({ error: 'Internal server error' });
});

export default app;
