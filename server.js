import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import productsRouter from './src/routes/products.js';
import ordersRouter from './src/routes/orders.js';
import addressesRouter from './src/routes/addresses.js';
import ratingsRouter from './src/routes/ratings.js';
import couponsRouter from './src/routes/coupons.js';
import usersRouter from './src/routes/users.js';
import authRouter from './src/routes/auth.js';
import smsRouter from './src/routes/sms.js';
import settingsRouter from './src/routes/settings.js';

// Comma-separated list of allowed origins, e.g. "http://localhost:3000,https://mangalsuperfoods.com"
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const port = process.env.PORT || 4000;

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
app.use('/api/settings', settingsRouter);

// Fallback error handler (route handlers already catch their own errors,
// this only catches anything unexpected e.g. malformed JSON bodies).
app.use((error, request, response, next) => {
  console.error('Unhandled error:', error);
  response.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`mangal-superfoods-backend listening on http://localhost:${port}`);
});
