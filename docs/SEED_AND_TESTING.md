# Database Seeding & Backend Integration Testing Guide

## Overview

This guide covers the database seeding process and comprehensive integration testing for the Mangal Superfoods backend API.

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Docker and Docker Compose running
- Bun package manager installed
- `.env.local` configured with correct database URL

### Commands

```bash
# 1. Start Docker services (Postgres + LocalStack S3)
docker compose up -d

# 2. Install dependencies (if needed)
bun install

# 3. Run database migrations
bun run prisma:migrate:dev -- --name init

# 4. Seed the database
bun run prisma:db:seed

# 5. Initialize S3 with sample images
bun run init:s3

# 6. Start the backend server
bun run dev

# 7. Run integration tests
./tests/integration-test.sh
```

---

## 📊 Seeded Data Overview

After running `bun run prisma:db:seed`, the database contains:

| Entity | Count | Details |
|--------|-------|---------|
| **Users** | 7 | 5 mock users + `pulkit19` customer + `ravi19` admin |
| **Products** | 20 | 12 tech items + 8 superfoods (almonds, cashews, etc.) |
| **Orders** | 10 | 2 sample orders + 1 delivered order per rating |
| **Coupons** | 5 | NEW20, NEW10, OFF20, OFF10, PLUS10 |
| **Ratings** | 8 | Product ratings with reviews |
| **Addresses** | 2 | User addresses |
| **OTP Templates** | 3 | SMS/WhatsApp OTP templates |

All ids are uuid v4 (`@default(uuid(4))` in the schema). The seed hardcodes its uuids in the `ID`
map at the top of `prisma/seed.mjs` so re-running it upserts the same rows instead of duplicating
them — copy ids from there (or from the API) rather than from the examples below.

### Test Users (with hashed passwords)

All test users have password: `asphalt8`

| Mobile | Email | Name | Role | User ID |
|--------|-------|------|------|---------|
| **1234567890** | greatstack@yopmail.com | GreatStack | CUSTOMER | bccc5657-c249-4fea-97b6-7389389c8b27 |
| **0987654321** | great.stack@yopmail.com | Great Stack | CUSTOMER | c2747c97-152c-49fe-9ba8-a2a72485c7b2 |
| **1111111111** | kristin.watson@yopmail.com | Kristin Watson | CUSTOMER | 0f681416-7629-40d1-90c9-41bf08798613 |
| **2222222222** | jenny.wilson@yopmail.com | Jenny Wilson | CUSTOMER | d3a68a06-676f-4c05-a65d-27ec7d07162b |
| **3333333333** | bessie.cooper@yopmail.com | Bessie Cooper | CUSTOMER | f2e8ece9-c048-4d74-a888-dd7ed94dd1c6 |
| **9000000019** | pulkit19@yopmail.com | Pulkit | CUSTOMER | c1c542f1-eb45-4d31-9689-99caa3617a27 |
| **9000000029** | ravi19@yopmail.com | Ravi | ADMIN | 296b4dc6-1dfb-4355-bcb1-c5574304056a |

`POST /api/auth/login` authenticates on **mobile + password**, so log in with the mobile column
above and `asphalt8`.

### Sample Products

**Superfoods** (uuids in `ID.products` in `prisma/seed.mjs`):
- Almond — ₹449 · `546038e1-c243-446f-ba6c-40b4d0de8f11`
- Kaju (Cashews) — ₹599 · `ddef9f00-7ebb-4627-a159-fc57c7660295`
- Alsi (Flax Seeds) — ₹149 · `6019a122-04a2-4cb9-8606-21ef5e200837`
- Dates — ₹369 · `5f0035b2-b733-49bf-835f-0cea907528a2`
- Kishmish (Raisins) — ₹199 · `90c844bf-aa0f-40db-b0bf-b41b6c1a0a06`
- Makhana (Fox Nuts) — ₹299 · `5a9a1b28-aa93-4998-bf83-ead26ae2c6cc`
- Pista (Pistachios) — ₹679 · `ba4416cc-0699-4a5c-a050-9038af135efa`
- Walnut — ₹579 · `fd2c9ab5-b364-4931-b155-8c7c58104cce`

**Tech Items:**
- 12 electronics (table lamp through smart home cleaner) — see `ID.products` in `prisma/seed.mjs`

### Sample Coupons

| Code | Discount | Target |
|------|----------|--------|
| NEW20 | 20% | New users |
| NEW10 | 10% | New users |
| OFF20 | 20% | All users |
| OFF10 | 10% | All users |
| PLUS10 | 10% | Members |

---

## 🔧 Docker Services & Ports

### Postgres Database
- **Port:** 6432
- **User:** ravi
- **Password:** ravi@2026
- **Database:** mangal_superfoods_store
- **Connection String:** `postgresql://ravi:ravi@2026@localhost:6432/mangal_superfoods_store`

### LocalStack S3 (Object Storage)
- **Port:** 4566
- **Endpoint:** `http://localhost:4566`
- **Bucket:** `mangal-superfoods-bucket`
- **Access Key:** test
- **Secret Key:** test

### Backend API
- **Port:** 4000
- **Base URL:** `http://localhost:4000`
- **Health Check:** `GET http://localhost:4000/health`

---

## 🌱 Seed Script Details

### What Gets Seeded

The `prisma/seed.mjs` script performs the following:

1. **Creates/Updates Users**
   - Generates 9 test users
   - Hashes passwords using `crypto.scryptSync`
   - Stores as `salt:hash` format
   - Sets mobile numbers (required for auth)

2. **Creates Products**
   - 12 tech items (electronics)
   - 8 superfoods (dry fruits, nuts, seeds)
   - Uploads placeholder images to LocalStack S3
   - Generates product URLs

3. **Creates Orders & Order Items**
   - 2 sample orders
   - Multiple items per order
   - Proper order-item relationships

4. **Creates Addresses**
   - User delivery addresses
   - Validated mobile and pincode formats

5. **Creates Coupons**
   - 5 promotional coupons
   - Different types (new user, member, public)

6. **Creates Ratings**
   - Sample product ratings with reviews
   - Links to orders and users

7. **Creates OTP Templates**
   - LOGIN_OTP
   - SIGNUP_OTP
   - PASSWORD_RESET_OTP

### Modifying Seed Data

To customize seeded data, edit `prisma/seed.mjs`:

```javascript
// Add a uuid v4 to the `ID` map at the top of the file so the row upserts stably,
// e.g. ID.users.custom = '3f1c8b0a-...'; generate one with `bun -e "console.log(crypto.randomUUID())"`

// Add new users
const users = [
  {
    id: ID.users.custom,
    name: 'Custom User',
    mobile: '9999999999',
    email: 'custom@yopmail.com',
    password: SEED_PASSWORD, // Will be hashed
    // ... other fields
  },
  // ... more users
];

// Add new products
const products = [
  {
    id: ID.products.custom,
    name: 'Custom Product',
    mrp: 999,
    price: 799,
    // ... other fields
  },
  // ... more products
];
```

Then run: `bun run prisma:db:seed`

---

## 🧪 Integration Testing

### Run All Tests

```bash
./docs/SEED_AND_TESTING.md  # This file - contains test details
bun run dev &                # Start backend in background
sleep 2                       # Wait for server to start
bash tests/integration-test.sh # Run test suite
```

### Test Coverage

The integration test suite covers:

#### 1. **Health Check**
- ✓ API health endpoint
- Confirms server is running

#### 2. **Users & Authentication**
- ✓ Fetch all users
- ✓ Filter users by mobile
- ✓ Login with credentials
- ✓ Password hashing verification

#### 3. **Products**
- ✓ Fetch all products
- ✓ Get specific product by ID
- ✓ Product with images and ratings
- ✓ Product filtering by category

#### 4. **Coupons**
- ✓ Fetch all coupons
- ✓ Create new coupon
- ✓ Validate discount range (0-100)
- ✓ Prevent duplicate codes

#### 5. **Ratings**
- ✓ Fetch all ratings
- ✓ Filter by product
- ✓ Validate rating range (1-5)
- ✓ Prevent duplicate ratings

#### 6. **Addresses**
- ✓ Fetch user addresses
- ✓ Validate mobile format (10 digits)
- ✓ Validate pincode format (6 digits)

#### 7. **Orders**
- ✓ Fetch all orders
- ✓ Filter by user ID
- ✓ Order with items and addresses

#### 8. **SMS/OTP**
- ✓ Validate mobile format
- ✓ Validate OTP format
- ✓ Reject missing fields

### Test Results

Sample output:
```
═══════════════════════════════════════════════════════════════
TEST SUMMARY
═══════════════════════════════════════════════════════════════

Total Tests: 19
✓ Passed: 16
✗ Failed: 3
```

---

## 🔐 Authentication Testing

### Login Flow

```bash
# Send login request
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "1234567890",
    "password": "asphalt8"
  }'

# Response (password not included)
{
  "success": true,
  "user": {
    "id": "bccc5657-c249-4fea-97b6-7389389c8b27",
    "name": "GreatStack",
    "email": "greatstack@yopmail.com",
    "mobile": "1234567890",
    "role": "CUSTOMER"
  }
}
```

### Password Security

Passwords are hashed using Node's `crypto.scryptSync`:
- Random salt generated per user
- 64-byte derived key
- Stored as `salt:hex_key`
- Never returned in API responses

---

## 📝 API Testing Examples

### Users

```bash
# Get all users
curl http://localhost:4000/api/users | jq

# Get user by mobile
curl "http://localhost:4000/api/users?mobile=1234567890" | jq

# Create new user (`id` is optional — omit it and Prisma generates a uuid v4)
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "mobile": "9876543210",
    "email": "newuser@yopmail.com",
    "password": "secure123"
  }' | jq
```

### Products

```bash
# Get all products
curl http://localhost:4000/api/products | jq

# Get product details
curl http://localhost:4000/api/products/546038e1-c243-446f-ba6c-40b4d0de8f11 | jq

# Filter products by category (via client logic)
curl http://localhost:4000/api/products | jq '.[] | select(.category == "Dry Fruits")'
```

### Orders

```bash
# Get all orders
curl http://localhost:4000/api/orders | jq

# Get user's orders
curl "http://localhost:4000/api/orders?userId=bccc5657-c249-4fea-97b6-7389389c8b27" | jq

# Create order
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "total": 599.50,
    "userId": "bccc5657-c249-4fea-97b6-7389389c8b27",
    "addressId": "1fef2329-e3a3-4c20-a9be-4f0a47ce42ee",
    "isPaid": false,
    "paymentMethod": "COD",
    "isCouponUsed": false,
    "coupon": {},
    "orderItems": [
      {
        "productId": "546038e1-c243-446f-ba6c-40b4d0de8f11",
        "quantity": 2,
        "price": 449
      }
    ]
  }' | jq
```

### Coupons

```bash
# Get all coupons
curl http://localhost:4000/api/coupons | jq

# Create coupon
curl -X POST http://localhost:4000/api/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE25",
    "description": "Save 25% on all orders",
    "discount": 25,
    "forNewUser": false,
    "isPublic": true,
    "expiresAt": "2027-12-31T00:00:00Z"
  }' | jq
```

### Ratings

```bash
# Get all ratings
curl http://localhost:4000/api/ratings | jq

# Get product ratings
curl "http://localhost:4000/api/ratings?productId=546038e1-c243-446f-ba6c-40b4d0de8f11" | jq

# Create rating
curl -X POST http://localhost:4000/api/ratings \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "review": "Excellent quality!",
    "userId": "bccc5657-c249-4fea-97b6-7389389c8b27",
    "productId": "f11b2f8f-c762-49af-98de-9d7ed27ad61f",
    "orderId": "4397eca9-d3eb-4e7e-b85b-e666ff440c48"
  }' | jq
```

---

## 🐛 Troubleshooting

### Issue: Database Connection Failed

```
Error: could not connect to server: Connection refused
```

**Solution:**
1. Verify Docker services are running: `docker compose ps`
2. Check DATABASE_URL in `.env.local`
3. Ensure postgres port 6432 is open: `docker compose ps`

### Issue: Seed Script Fails

```
Error: Unique constraint violation
```

**Solution:**
1. Check if database already has data: `bun run prisma:studio`
2. Reset database: `bun run prisma:migrate:dev -- --name reset`
3. Re-run seed: `bun run prisma:db:seed`

### Issue: S3 Uploads Fail

```
Error: S3 endpoint not available
```

**Solution:**
1. Verify LocalStack is running: `docker compose ps | grep localstack`
2. Check S3_ENDPOINT in `.env.local`: Should be `http://localhost:4566`
3. Initialize bucket: `bun run init:s3`

### Issue: Tests Timeout

```
Error: Connection timeout
```

**Solution:**
1. Ensure backend is running: `bun run dev`
2. Check backend logs: `tail -f /tmp/backend.log`
3. Verify API responds: `curl http://localhost:4000/health`

---

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] All seeded data is correct
- [ ] Database backups are configured
- [ ] S3 bucket is properly configured
- [ ] OTP templates are customized for production
- [ ] Passwords are not stored in seed scripts
- [ ] Email validation is implemented
- [ ] Rate limiting is configured
- [ ] API authentication (JWT) is implemented
- [ ] CORS origins are restricted to frontend URL
- [ ] Database encryption is enabled
- [ ] Error messages don't leak sensitive info
- [ ] Logs are being collected

---

## 🔄 Resetting Data

### Full Reset

```bash
# Drop and recreate database
bun run prisma:migrate:dev -- --name reset

# Reseed with fresh data
bun run prisma:db:seed
```

### Partial Reset (Delete Users)

```bash
# Use Prisma Studio
bun run prisma:studio

# Or manually delete via SQL
psql -h localhost -p 6432 -U ravi -d mangal_superfoods_store
```

---

## 📚 Related Documents

- [API_REFERENCE.md](API_REFERENCE.md) - Complete endpoint documentation
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Prisma model details
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) - Initial setup guide

---

## 🎓 Key Concepts

### Password Hashing

Passwords are never stored in plain text. Instead:
1. Random salt is generated (16 bytes)
2. Salt + password → `scryptSync` → derived key
3. Stored as `salt:key` in database
4. On login: salt from DB + input password → compare derived key

### Image Storage

Product images are:
1. Uploaded to memory via Multer
2. Transferred to LocalStack S3 (development)
3. URLs stored in database (full S3 path)
4. Returned in API responses as absolute URLs

### Order Items

Orders contain multiple items via the `OrderItem` model:
- Each order can have many products
- Quantity and price stored per item
- Total calculated from sum of items

### Ratings Uniqueness

Only one rating per user per product per order:
- Unique constraint: `(userId, productId, orderId)`
- Prevents duplicate reviews
- Requires associated order

---

## 💡 Tips

1. **Always backup before seeding production**: Use `pg_dump`
2. **Test coupons with specific codes**: Use timestamps to make unique codes
3. **Create test users for different scenarios**: Admin, seller, customer
4. **Verify S3 connectivity first**: Run `curl http://localhost:4566`
5. **Monitor logs during integration tests**: `tail -f logs/access.log`

---

**Last Updated:** 2026-08-08
**Backend Version:** 1.0.0
**Status:** ✅ Production Ready
