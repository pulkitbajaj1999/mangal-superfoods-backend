# Mangal Superfoods Backend API

A complete REST API backend for the Mangal Superfoods e-commerce platform built with **Express.js**, **Prisma ORM**, and **PostgreSQL**.

## 🚀 Quick Start

Get the API running in **10 minutes**:

```bash
# 1. Install dependencies
npm install

# 2. Start Docker services (PostgreSQL + LocalStack S3)
docker-compose up -d

# 3. Setup database
npm run prisma:migrate:dev --name init
npm run db:seed

# 4. Initialize S3 bucket
npm run init:s3

# 5. Start server
npm run dev
```

The API will be running at `http://localhost:4000`

See [SETUP_INSTRUCTIONS.md](docs/SETUP_INSTRUCTIONS.md) for detailed setup.

---

## 📚 Documentation

Complete documentation is available in the `docs/` folder:

| Document | Purpose |
|----------|---------|
| [API_REFERENCE.md](docs/API_REFERENCE.md) | All endpoints with examples |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Prisma models and relations |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [SETUP_INSTRUCTIONS.md](docs/SETUP_INSTRUCTIONS.md) | Quick start guide |
| [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md) | Current implementation status |
| [IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | Original roadmap |

---

## 🎯 Features

### ✅ Complete Functionality

- **User Management** - Registration, login, profile updates
- **Product Catalog** - CRUD operations with image uploads
- **Orders** - Order creation, status tracking
- **Shopping Cart** - Cart management (JSON stored in User model)
- **Addresses** - Delivery address management
- **Coupons** - Promotional code system
- **Product Ratings** - User reviews and ratings
- **SMS/OTP** - WhatsApp-based OTP authentication

### 🔐 Security Features

- Password hashing with crypto.scryptSync
- Input validation on all endpoints
- CORS configuration
- Mobile uniqueness constraints
- Proper error handling with correct HTTP codes

### 📦 Storage

- **Database:** PostgreSQL with Prisma ORM
- **Images:** S3-compatible storage (LocalStack dev, AWS S3 prod)
- **Connection:** Driver adapters with connection pooling

---

## 🏗️ Architecture

```
mangal-superfoods-backend/
├── server.js                 # Entry point
├── src/
│   ├── app.js               # Express app setup
│   ├── routes/              # API route handlers (8 modules)
│   │   ├── auth.js          # Authentication
│   │   ├── users.js         # User management
│   │   ├── products.js      # Product CRUD
│   │   ├── orders.js        # Order management
│   │   ├── addresses.js     # Address management
│   │   ├── coupons.js       # Coupon system
│   │   ├── ratings.js       # Product reviews
│   │   └── sms.js           # OTP/SMS
│   └── lib/
│       ├── prisma.js        # Database client
│       └── s3.js            # S3 storage client
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.mjs             # Database seeding
├── docs/                    # Documentation
└── docker-compose.yml       # Development environment
```

---

## 🔌 API Endpoints

### Core Endpoints (20 fully functional)

#### Users & Authentication
- `POST /api/users` - Register new user
- `GET /api/users` - List users
- `GET /api/users?mobile=` - Query by mobile
- `PUT /api/users` - Update profile
- `POST /api/auth/login` - Login

#### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (with images)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Orders
- `GET /api/orders` - List orders (with filters)
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status

#### Other Resources
- `GET /api/addresses` - List addresses
- `POST /api/addresses` - Create address
- `GET /api/coupons` - List coupons
- `POST /api/coupons` - Create coupon
- `GET /api/ratings` - List ratings
- `POST /api/ratings` - Create rating
- `POST /api/sms/send` - Send OTP
- `POST /api/sms/verify` - Verify OTP

Full API documentation: [API_REFERENCE.md](docs/API_REFERENCE.md)

---

## 📋 Environment Variables

Create a `.env` file:

```bash
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mangal_superfoods

# Frontend CORS
FRONTEND_ORIGIN=http://localhost:3000,http://localhost:3001

# WhatsApp OTP
WHAPI_BASE_URL=https://gate.whapi.cloud
WHAPI_TOKEN=your_token_here

# S3 Storage
BUCKET_NAME=mangal-superfoods
S3_ENDPOINT=http://localhost:4566  # LocalStack dev
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_ACCESS_KEY=test
```

See `.env.example` and [DEPLOYMENT.md](docs/DEPLOYMENT.md) for more details.

---

## 📊 Implementation Status

| Phase | Status | Coverage |
|-------|--------|----------|
| 1. Core Infrastructure | ✅ Complete | 100% |
| 2. Auth & User Mgmt | ✅ Complete | 85% |
| 3. Product Management | ✅ Complete | 90% |
| 4. Orders & Cart | 🟡 Partial | 70% |
| 5. Addresses & Coupons | ✅ Complete | 80% |
| 6. Ratings & Reviews | ✅ Complete | 85% |
| 7. SMS/OTP | 🟡 Partial | 75% |
| 8. Testing & Docs | ✅ Complete | 90% |
| **OVERALL** | **75%** | **Ready for Testing** |

See [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md) for detailed breakdown.

---

## 🧪 Testing

### Quick Test
```bash
# Health check
curl http://localhost:4000/health

# List products
curl http://localhost:4000/api/products

# Create user
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id":"user_1",
    "name":"John Doe",
    "mobile":"9999999999",
    "password":"test123"
  }'
```

See [API_REFERENCE.md](docs/API_REFERENCE.md) for all endpoint examples.

---

## 🚢 Deployment

### Development
```bash
npm run dev          # With auto-reload
npm start            # Without auto-reload
```

### Production
See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- Docker deployment
- Heroku deployment
- AWS deployment
- Environment configuration
- Monitoring setup

---

## 📦 Dependencies

### Core
- **express** - Web framework
- **@prisma/client** - Database ORM
- **@prisma/adapter-pg** - PostgreSQL driver adapter
- **pg** - PostgreSQL client
- **cors** - CORS middleware
- **dotenv** - Environment variables

### Storage
- **@aws-sdk/client-s3** - S3 client
- **multer** - File upload handling

### Development
- **prisma** - Schema management and migrations

---

## 🔍 Database Models

The database includes 8 main models:

1. **User** - Accounts with roles (CUSTOMER/ADMIN/SELLER)
2. **Product** - E-commerce products with images
3. **Order** - Customer orders with status tracking
4. **OrderItem** - Individual items in orders
5. **Address** - Delivery addresses
6. **Rating** - Product reviews and ratings
7. **Coupon** - Promotional codes
8. **OtpCode** - One-time password tracking

See [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for complete schema.

---

## 🛠️ Available Commands

```bash
# Development
npm run dev                    # Start with auto-reload

# Production
npm start                      # Start server

# Database
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate:dev     # Create/apply migration
npm run prisma:migrate:deploy  # Apply in production
npm run db:seed                # Seed sample data
npm run prisma:studio          # GUI database tool

# S3
npm run init:s3                # Create bucket & upload images
```

---

## 🐛 Troubleshooting

### Port already in use
```bash
PORT=5000 npm start
```

### Database connection failed
```bash
# Check services are running
docker-compose ps

# Restart services
docker-compose restart
```

### Prisma sync error
```bash
npm run prisma:generate
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for more troubleshooting.

---

## ⚠️ Known Limitations

Before production deployment, implement:

1. **Stock validation** - Check product inventory before orders
2. **Order cancellation** - Implement order cancellation flow
3. **Rate limiting** - Prevent SMS/auth abuse
4. **JWT tokens** - Replace user object responses
5. **Request logging** - Add logging middleware
6. **Pagination** - Add limit/offset to list endpoints

See [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md) for complete list.

---

## 📈 Performance Considerations

- Prisma client memoized in development for --watch stability
- Connection pooling configured for PostgreSQL
- S3 operations async with proper error handling
- Indexes on mobile field for quick lookups
- Database relations optimized with includes

---

## 🔐 Security Notes

- Passwords hashed with crypto.scryptSync
- Input validation on all POST/PUT endpoints
- CORS allowlist from environment
- Error messages don't leak sensitive info
- Mobile uniqueness enforced

Before production, add:
- HTTPS/SSL enforcement
- JWT or session tokens
- Rate limiting
- Request logging & monitoring
- OWASP compliance audit

---

## 📞 Support

For issues or questions:
1. Check [SETUP_INSTRUCTIONS.md](docs/SETUP_INSTRUCTIONS.md)
2. Review [API_REFERENCE.md](docs/API_REFERENCE.md)
3. See [DEPLOYMENT.md](docs/DEPLOYMENT.md) troubleshooting
4. Check application logs

---

## 📄 License

Proprietary - Mangal Superfoods

---

## 👤 Author

Built with Express.js, Prisma, and PostgreSQL.

---

**Last Updated:** 2026-08-08  
**API Version:** 1.0  
**Status:** Ready for Testing ✅
