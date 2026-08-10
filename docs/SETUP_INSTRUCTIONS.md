# Mangal Superfoods Backend - Quick Setup Guide

Get the backend API running in under 10 minutes!

## Prerequisites

Before starting, ensure you have installed:
- **Node.js** v16+ (https://nodejs.org/)
- **Docker** (https://www.docker.com/)
- **npm** v7+

Check versions:
```bash
node --version   # Should be v16+
npm --version    # Should be v7+
docker --version # Should be v20+
```

## Step-by-Step Setup

### 1. Clone & Install (2 min)

```bash
# Navigate to backend directory
cd mangal-superfoods-backend

# Install dependencies
npm install
```

### 2. Start Docker Services (2 min)

```bash
# Start PostgreSQL and LocalStack S3
docker-compose up -d

# Verify containers are running
docker-compose ps
```

### 3. Setup Database (2 min)

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev --name init

# Seed with sample data
npm run prisma:db:seed
```

### 4. Setup S3 Storage (1 min)

```bash
# Create bucket and upload sample images
npm run init:s3
```

### 5. Create .env File (1 min)

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Or manually create `.env`:
```
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000,http://localhost:3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mangal_superfoods
WHAPI_BASE_URL=https://gate.whapi.cloud
WHAPI_TOKEN=
BUCKET_NAME=mangal-superfoods
S3_ENDPOINT=http://localhost:4566
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_ACCESS_KEY=test
NODE_ENV=development
```

### 6. Start Server (1 min)

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

Expected output:
```
mangal-superfoods-backend listening on http://localhost:4000
```

## Test the API

### Health Check
```bash
curl http://localhost:4000/health
# Response: { "status": "ok" }
```

### Get Products
```bash
curl http://localhost:4000/api/products
```

### Create User
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_user_1",
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "9999999999",
    "password": "test123"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9999999999",
    "password": "test123"
  }'
```

## Sample Data Available

After seeding, you have access to:

**Users:**
- Mobile: `1234567890` (GreatStack, greatstack@yopmail.com)
- Mobile: `0987654321` (Great Stack, great.stack@yopmail.com)
- Mobile: `1111111111` (Kristin Watson, kristin.watson@yopmail.com)
- Mobile: `9000000019` (Pulkit, pulkit19@yopmail.com)
- Mobile: `9000000029` (Ravi, ravi19@yopmail.com — ADMIN)

**Password:** All seed users have password `asphalt8`

**Products:** (ids are uuid v4 — see the `ID` map in `prisma/seed.mjs`)
- Almond, Kaju (Cashews), Alsi (Flax Seeds)
- And 17 more...

**Orders:**
- Pre-created orders for testing

## Common Commands

```bash
# Development (auto-reload, debugging)
npm run dev

# Production mode
npm start

# Database
npm run prisma:migrate:dev         # Create migration
npm run prisma:db:seed                    # Seed data
npm run prisma:studio              # GUI database tool

# S3
npm run init:s3                    # Create bucket & upload images

# View logs
npm run dev 2>&1 | tee app.log
```

## Docker Management

```bash
# View logs
docker-compose logs -f postgres
docker-compose logs -f localstack

# Stop all services
docker-compose down

# Stop and remove data
docker-compose down -v

# Rebuild containers
docker-compose build
```

## Folder Structure

```
mangal-superfoods-backend/
├── server.js                 # Entry point: Express app setup + listener
├── src/
│   ├── routes/              # API routes
│   │   ├── users.js
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── addresses.js
│   │   ├── coupons.js
│   │   ├── ratings.js
│   │   └── sms.js
│   └── lib/
│       ├── prisma.js        # Database client
│       └── s3.js            # Storage client
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.mjs             # Seed script
├── docs/                    # Documentation
├── sampleimages/            # Sample images
├── .env.example             # Environment template
├── .env.local               # Your local config (gitignored)
├── docker-compose.yml       # Docker services
└── package.json             # Dependencies
```

## Troubleshooting

### Port 4000 already in use
```bash
# Change port
PORT=5000 npm start

# Or kill process
lsof -i :4000
kill -9 <PID>
```

### Docker error: "Cannot connect to Docker daemon"
```bash
# Start Docker
docker daemon

# Or restart Docker Desktop on Mac/Windows
```

### Database connection failed
```bash
# Check PostgreSQL is running
docker-compose ps

# Restart services
docker-compose down
docker-compose up -d
```

### Prisma generate error
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate
```

### S3 upload fails
```bash
# Reinitialize S3
npm run init:s3

# Or check LocalStack
curl http://localhost:4566
```

## Next Steps

1. **Read Documentation:**
   - API_REFERENCE.md - All endpoints
   - DATABASE_SCHEMA.md - Data models
   - IMPLEMENTATION_PLAN.md - Roadmap

2. **Connect Frontend:**
   - Update FRONTEND_ORIGIN in .env
   - Update API base URL in frontend
   - Test requests from frontend

3. **Setup WhatsApp OTP:**
   - Get API token from whapi.cloud
   - Add to WHAPI_TOKEN in .env
   - Test /api/sms/send endpoint

4. **Deploy to Production:**
   - See DEPLOYMENT.md
   - Setup production database
   - Configure AWS S3
   - Setup monitoring

## Support

For issues or questions:
1. Check DEPLOYMENT.md troubleshooting section
2. Review API_REFERENCE.md for endpoint specs
3. Check docker-compose logs
4. Review error messages in console

---

**Setup Time:** ~10 minutes  
**Created:** 2026-08-08
