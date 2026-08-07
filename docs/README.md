# Backend Documentation

Complete guides for implementing and maintaining the Mangal Superfoods backend API.

---

## Quick Start

### For Implementation

If you're **building/implementing the backend**, start here:

1. **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** — Start here first
   - Project overview and architecture
   - 8 phases of implementation
   - Detailed checklist for each endpoint
   - Priority order and known issues
   - **Status:** In Progress

2. **[API_REFERENCE.md](API_REFERENCE.md)** — Reference while implementing
   - Complete endpoint specifications
   - Request/response examples
   - HTTP status codes
   - cURL test examples
   - Quick testing guide

3. **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** — Reference for data modeling
   - All Prisma models with field descriptions
   - Relationships and constraints
   - Query examples
   - Migration instructions

### For Frontend Integration

If you're **integrating the frontend**, use these:

- **[../references/api-structure.md](../references/api-structure.md)** — Frontend's API expectations
  - All endpoints the frontend expects
  - Mock data structures
  - Integration examples
  - Mock login credentials

- **[../references/frontend-architecture.md](../references/frontend-architecture.md)** — Architecture overview
  - Frontend/backend split
  - How the frontend consumes APIs
  - Mock API layer details

---

## Document Guide

### IMPLEMENTATION_PLAN.md

**Purpose:** Roadmap for building the entire backend API

**Structure:**
- Phase 1: Core Infrastructure (Express setup, Prisma, S3)
- Phase 2: Authentication & Users (login, signup, profile)
- Phase 3: Products (CRUD with image uploads)
- Phase 4: Orders (order creation and management)
- Phase 5: Addresses & Coupons
- Phase 6: Ratings & Reviews
- Phase 7: SMS/OTP (WhatsApp integration)
- Phase 8: Testing & Documentation

**Contains:**
- ✅ What's implemented
- 🟡 What's partially done
- ❌ What's not started
- Detailed implementation steps for each endpoint
- Validation requirements
- Error handling patterns
- cURL examples

**Best For:**
- Understanding what needs to be done
- Getting step-by-step instructions
- Tracking progress with checklists
- Learning validation rules

---

### API_REFERENCE.md

**Purpose:** Complete API documentation for all endpoints

**Structure:**
- 7 API categories (Auth, Products, Orders, Addresses, Coupons, Ratings, SMS)
- Each endpoint documented with:
  - HTTP method and path
  - Request/response examples
  - Error scenarios
  - Notes and requirements

**Contains:**
- Request/response schemas in JSON
- Query and path parameters
- HTTP status codes
- Error response formats
- Full cURL examples for testing

**Best For:**
- Testing endpoints with cURL
- Understanding request/response formats
- Error handling reference
- Integration testing
- API contract verification

---

### DATABASE_SCHEMA.md

**Purpose:** Complete data model documentation

**Structure:**
- User, Product, Order, OrderItem, Address, Coupon, Rating
- OtpTemplate, OtpCode
- Enums (UserRole, OrderStatus, PaymentMethod)

**Contains:**
- Field descriptions and constraints
- Required fields for creation
- Data types and validation rules
- Relationships and foreign keys
- Example records
- Common query patterns
- Performance considerations

**Best For:**
- Understanding the data model
- Writing database queries
- Creating migrations
- Performance optimization
- Data relationship reference

---

## File Organization

```
docs/
├── README.md                    # This file
├── IMPLEMENTATION_PLAN.md       # 🔴 START HERE - Full implementation roadmap
├── API_REFERENCE.md             # API endpoint specifications
├── DATABASE_SCHEMA.md           # Data model documentation
└── (future files)
   ├── DEPLOYMENT.md             # Production deployment guide
   ├── TESTING.md                # Testing strategies
   ├── TROUBLESHOOTING.md        # Common issues & solutions

references/
├── api-structure.md             # Frontend API expectations
└── frontend-architecture.md     # Frontend/backend split details
```

---

## Implementation Status

### Phase 1: Core Infrastructure ✅
- ✅ Express app setup with CORS
- ✅ Prisma client configuration
- ✅ S3 client setup

### Phase 2: Authentication & Users 🟡
- ✅ User GET by mobile (basic)
- ✅ User POST (sign up) (basic)
- 🟡 Password hashing (needs crypto utility)
- 🟡 User PUT (update) (needs testing)
- ✅ Login POST (basic)
- 🟡 Password verification (needs crypto utility)

### Phase 3: Products 🟡
- ✅ GET all products
- ✅ GET by ID
- 🟡 POST (image upload needs testing)
- 🟡 PUT (image merge needs testing)
- 🟡 DELETE (with order check)

### Phase 4: Orders 🟡
- ✅ GET orders
- 🟡 POST (nested creates)
- 🟡 PUT (status update)

### Phase 5: Addresses & Coupons 🟡
- ✅ Addresses GET/POST (basic)
- ✅ Coupons GET (basic)
- 🟡 Coupons POST (needs validation)

### Phase 6: Ratings ✅
- ✅ GET ratings
- ✅ POST ratings (basic)

### Phase 7: SMS/OTP 🟡
- 🟡 SMS send (whapi.cloud integration)
- 🟡 SMS verify (OTP validation)

### Phase 8: Testing & Documentation 🟡
- 🟡 Manual testing suite
- 🟡 Error handling audit
- ✅ API documentation (done)
- ⏳ Deployment guide (TODO)

---

## Quick Commands

```bash
# Local Development Setup
npm install
docker-compose up -d                    # Start Postgres + LocalStack
npm run prisma:migrate:dev              # Run migrations
npm run db:seed                         # Seed with dummy data
npm run init:s3                         # Setup S3 bucket
npm run dev                             # Start server with --watch

# Testing with cURL
curl http://localhost:4000/api/products    # Get all products
curl http://localhost:4000/api/products/prod_almond  # Get product by ID

# Database Utilities
npm run prisma:studio                   # Open visual DB browser
npm run prisma:generate                 # Regenerate Prisma client
npm run prisma:migrate:deploy           # Apply migrations (production)

# View Full Commands
cat package.json | grep "scripts" -A 20
```

---

## Environment Setup

### Required .env Variables

```bash
# Server
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000,http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mangal_superfoods

# WhatsApp OTP
WHAPI_BASE_URL=https://api.whapi.cloud
WHAPI_TOKEN=your_token_here

# S3 Storage
BUCKET_NAME=mangal-superfoods
S3_ENDPOINT=http://localhost:4566         # LocalStack (dev)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_ACCESS_KEY=test

# Optional
NODE_ENV=development
```

See `.env.example` for all options.

---

## Common Workflows

### Building a New Endpoint

1. **Plan** — Refer to [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the phase
2. **Validate** — Check field requirements in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
3. **Implement** — Follow patterns in `src/routes/`
4. **Test** — Use cURL examples from [API_REFERENCE.md](API_REFERENCE.md)
5. **Document** — Update this file's status section

### Testing Endpoints

```bash
# Quick test with cURL
curl -X GET http://localhost:4000/api/products

curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","mobile":"9988776655","password":"pass123"}'

# See API_REFERENCE.md for all endpoints
```

### Debugging Database Issues

```bash
# Open Prisma Studio (visual DB browser)
npm run prisma:studio              # http://localhost:5555

# Check database connection
psql postgresql://user:password@localhost:5432/mangal_superfoods

# View migrations
npx prisma migrate status
```

---

## Key Concepts

### Architecture

- **Express.js** — HTTP server
- **Prisma** — ORM for database operations
- **PostgreSQL** — Main database
- **S3 (LocalStack)** — Image storage
- **whapi.cloud** — WhatsApp/SMS OTP delivery

### API Design Principles

1. **Consistent Error Handling** — All errors follow `{ error: "message" }` format
2. **Nested Relations** — Use Prisma's `include` for related data
3. **Transaction Support** — Order creation uses nested creates
4. **Image Uploads** — FormData with multer, store URLs in database
5. **OTP Expiry** — 5-minute TTL, single-use validation

### Data Flow

```
Frontend (Next.js)
    ↓
HTTP Request
    ↓
Express Routes (src/routes/*.js)
    ↓
Input Validation
    ↓
Prisma ORM Query
    ↓
PostgreSQL Database
    ↓
JSON Response
    ↓
Frontend
```

---

## Frontend Integration Points

The frontend expects these endpoints to exist:

| Feature | Endpoint | Status |
|---------|----------|--------|
| User Lookup | GET /api/users?mobile= | ✅ |
| Sign Up | POST /api/users | ✅ |
| Login | POST /api/auth/login | ✅ |
| OTP Send | POST /api/sms/send | 🟡 |
| OTP Verify | POST /api/sms/verify | 🟡 |
| Products List | GET /api/products | ✅ |
| Product Detail | GET /api/products/:id | ✅ |
| Create Product | POST /api/products | 🟡 |
| Update Product | PUT /api/products/:id | 🟡 |
| Delete Product | DELETE /api/products/:id | 🟡 |
| Get Orders | GET /api/orders | ✅ |
| Create Order | POST /api/orders | 🟡 |
| Update Order | PUT /api/orders/:id | 🟡 |
| Get Addresses | GET /api/addresses | ✅ |
| Create Address | POST /api/addresses | ✅ |
| Get Coupons | GET /api/coupons | ✅ |
| Create Coupon | POST /api/coupons | 🟡 |
| Get Ratings | GET /api/ratings | ✅ |
| Create Rating | POST /api/ratings | ✅ |
| Update Profile | PUT /api/users | 🟡 |

---

## Recommended Reading Order

### For New Developers

1. This README (you are here)
2. [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — Overview and current status
3. [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — Understand the data model
4. [API_REFERENCE.md](API_REFERENCE.md) — Learn endpoint specifications
5. [../references/api-structure.md](../references/api-structure.md) — Understand frontend expectations

### For Implementing Specific Features

1. Find your feature in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
2. Review the detailed implementation steps in that phase
3. Look up related data models in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
4. Reference endpoint specs in [API_REFERENCE.md](API_REFERENCE.md)
5. Check example code in `src/routes/`

### For Debugging Issues

1. Check [API_REFERENCE.md](API_REFERENCE.md) for expected behavior
2. Review data model in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
3. Check implementation details in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
4. Test with cURL examples from [API_REFERENCE.md](API_REFERENCE.md)

---

## Testing Coverage

### Manual Testing

Each endpoint should be tested with:
- ✅ Valid input → 200/201
- ✅ Missing required fields → 400
- ✅ Non-existent resource → 404
- ✅ Duplicate/conflict → 409
- ✅ Error scenarios specific to endpoint

See [API_REFERENCE.md](API_REFERENCE.md) for cURL test examples.

### Integration Testing

Frontend should test the following flows:
1. **Auth Flow** — Signup → Login → Profile Update
2. **Product Flow** — List → Detail → Search
3. **Order Flow** — Create Address → Apply Coupon → Create Order
4. **Review Flow** — View Product → Submit Rating

---

## Performance Notes

### Database Queries

- Use `include` to fetch related data (avoid N+1 queries)
- Add indexes for frequently-filtered fields
- Pagination recommended for large result sets

### S3 Uploads

- Images stored with unique keys: `products/{productId}/{filename}`
- URLs stored in database as strings
- LocalStack for development, AWS S3 for production

### Caching (Future)

- Consider Redis for OTP codes
- Cache popular products
- Session storage for authenticated users

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] S3 bucket created and accessible
- [ ] WhatsApp API token valid
- [ ] CORS origin configured for frontend
- [ ] SSL certificates ready (HTTPS)
- [ ] Error logging enabled
- [ ] Database backups scheduled
- [ ] Rate limiting configured (optional)
- [ ] Health check endpoint (optional)

---

## Support & Troubleshooting

### Common Issues

**Database Connection Fails**
- Check `DATABASE_URL` in `.env`
- Ensure Postgres is running: `docker-compose up -d`
- Test connection: `psql $DATABASE_URL`

**S3 Upload Fails**
- Ensure LocalStack is running: `docker-compose up -d`
- Check bucket exists: `npm run init:s3`
- Verify AWS credentials in `.env`

**WhatsApp OTP Not Sending**
- Verify `WHAPI_TOKEN` is valid
- Check mobile number format (10 digits)
- Review whapi.cloud dashboard for errors

---

## Related Resources

- **Backend CLAUDE.md** — Project conventions and quick reference
- **Frontend CLAUDE.md** — Next.js app structure and conventions
- **Frontend API Module** — How frontend consumes these APIs
- **Prisma Docs** — https://www.prisma.io/docs/
- **Express.js Docs** — https://expressjs.com/

---

**Last Updated:** 2026-08-08  
**Status:** In Active Development  
**Next Steps:** Implement Phase 2 (Auth & Users) using IMPLEMENTATION_PLAN.md as guide
