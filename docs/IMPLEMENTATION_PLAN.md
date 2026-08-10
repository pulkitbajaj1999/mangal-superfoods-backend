# Mangal Superfoods Backend - Implementation Plan

**Project:** Mangal Superfoods Backend API  
**Stack:** Express.js + Prisma ORM + PostgreSQL  
**Database:** Postgres with driver adapters  
**Date Created:** 2026-08-08  
**Status:** In Progress

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Setup](#architecture--setup)
3. [Phase 1: Core Infrastructure](#phase-1-core-infrastructure)
4. [Phase 2: Authentication & User Management](#phase-2-authentication--user-management)
5. [Phase 3: Product Management](#phase-3-product-management)
6. [Phase 4: Orders & Cart](#phase-4-orders--cart)
7. [Phase 5: Addresses & Coupons](#phase-5-addresses--coupons)
8. [Phase 6: Ratings & Reviews](#phase-6-ratings--reviews)
9. [Phase 7: SMS/OTP Integration](#phase-7-smsotp-integration)
10. [Phase 8: Testing & Documentation](#phase-8-testing--documentation)
11. [Implementation Checklist](#implementation-checklist)

---

## Project Overview

**Purpose:** Build a complete REST API backend for the Mangal Superfoods e-commerce storefront.

**Key Characteristics:**
- Single-vendor e-commerce platform
- User roles: CUSTOMER, ADMIN, SELLER
- Product catalog management
- Order management with status tracking
- WhatsApp OTP-based authentication
- Password-based login
- S3-compatible image uploads
- Coupon/promotion system
- Product ratings and reviews

**API Base URL:** `http://localhost:4000`

**Frontend Integration:** All endpoints consumed by Next.js frontend at `/mangal-superfoods-frontend`

---

## Architecture & Setup

### Directory Structure

```
mangal-superfoods-backend/
├── server.js                    # Entry point: Express app setup + listener
├── src/
│   ├── routes/                  # Route handlers
│   │   ├── products.js          # Product CRUD
│   │   ├── orders.js            # Order management
│   │   ├── addresses.js         # Delivery addresses
│   │   ├── ratings.js           # Product reviews
│   │   ├── coupons.js           # Promotions
│   │   ├── users.js             # User management
│   │   ├── auth.js              # Password-based login
│   │   └── sms.js               # OTP via WhatsApp
│   └── lib/
│       ├── prisma.js            # Prisma client singleton
│       └── s3.js                # S3/LocalStack config
├── prisma/
│   ├── schema.prisma            # Data models
│   └── seed.mjs                 # Database seeding script (sample data inlined)
├── .env.example                 # Environment template
└── docker-compose.yml           # Local Postgres + LocalStack

```

### Environment Configuration

**Required `.env` variables:**

```bash
# API Server
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000,http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mangal_superfoods

# WhatsApp OTP (whapi.cloud)
WHAPI_BASE_URL=https://api.whapi.cloud
WHAPI_TOKEN=your_token_here

# S3 Object Storage (LocalStack in dev, AWS/Backblaze in prod)
BUCKET_NAME=mangal-superfoods
S3_ENDPOINT=http://localhost:4566  # LocalStack; use AWS S3 URL in production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_ACCESS_KEY=test

# Optional: Node Environment
NODE_ENV=development
```

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   # Start Postgres via Docker
   docker-compose up -d

   # Generate Prisma Client
   npm run prisma:generate

   # Create initial migration
   npm run prisma:migrate:dev --name init

   # Seed with dummy data
   npm run prisma:db:seed
   ```

3. **S3 Setup (LocalStack)**
   ```bash
   # Initialize S3 bucket and upload sample images
   npm run init:s3
   ```

4. **Start Development Server**
   ```bash
   npm run dev  # With --watch, restarts on file changes
   ```

   Server will be available at `http://localhost:4000`

---

## Phase 1: Core Infrastructure

### 1.1 Express App Setup (server.js)

**Status:** ✅ Implemented

**What's Done:**
- CORS configuration with `FRONTEND_ORIGIN` allowlist parsing
- `express.json()` body parser for JSON requests
- Route mounting under `/api/*` prefix
- App-level error handler (catches unhandled exceptions)

**Validation:**
- [ ] CORS headers correctly set for frontend origin
- [ ] Max body size reasonable (typically 50MB for file uploads)
- [ ] Content-Type properly validated
- [ ] Test with curl: `curl -X OPTIONS http://localhost:4000/api/products`

**Related Files:**
- `server.js`
- `.env` / `FRONTEND_ORIGIN` setting

---

### 1.2 Prisma Client Singleton (src/lib/prisma.js)

**Status:** ✅ Implemented

**What's Done:**
- Uses driver adapters (`@prisma/adapter-pg`) with native `pg.Pool`
- Memoized on `global.prisma` for development (survives --watch reloads)
- Disconnects on process exit in production

**Implementation Details:**
```javascript
const adapter = new PrismaPgDialect({
  pool: new Pool({ connectionString: DATABASE_URL })
});
const prisma = new PrismaClient({ adapter });
```

**Validation:**
- [ ] `npm run prisma:generate` completes without errors
- [ ] Database connection pooling works (check connection count in Postgres)
- [ ] Client properly memoized in development (inspect `global.prisma`)
- [ ] Test: `node -e "const p = require('./src/lib/prisma'); p.user.findMany()"`

**Related Files:**
- `src/lib/prisma.js`
- `prisma/schema.prisma`

---

### 1.3 S3 Configuration (src/lib/s3.js)

**Status:** ✅ Implemented

**What's Done:**
- S3Client configured with `forcePathStyle: true` (LocalStack/Backblaze compatible)
- Exports `s3Client` and `BUCKET_NAME` singleton
- Supports both LocalStack (dev) and AWS/Backblaze B2 (prod)

**Implementation Details:**
```javascript
const s3Client = new S3Client({
  region: AWS_REGION,
  endpoint: S3_ENDPOINT,  // LocalStack: http://localhost:4566
  forcePathStyle: true,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_ACCESS_KEY,
  },
});
```

**Validation:**
- [ ] LocalStack container running (`docker-compose up`)
- [ ] S3 bucket created (`npm run init:s3`)
- [ ] Sample images uploaded (`init-s3.sh` completes)
- [ ] Test file upload works via product creation endpoint

**Related Files:**
- `src/lib/s3.js`
- `docker-compose.yml`
- `init-s3.sh`

---

## Phase 2: Authentication & User Management

### 2.1 User Management Endpoints (src/routes/users.js)

**Status:** 🟡 Partial (GET/POST implemented, PUT needs testing)

#### 2.1.1 GET /api/users (Query by Mobile)

**Purpose:** Look up a user by mobile number during login/signup

**Request:**
```
GET /api/users?mobile=9999999999
```

**Response (200):**
```json
{
  "id": "user_customer_1",
  "name": "Aditi Sharma",
  "email": "aditi.sharma@example.com",
  "mobile": "9999999999",
  "role": "CUSTOMER",
  "createdAt": "2026-05-01T10:00:00.000Z"
}
```

**Response (404):**
```json
{
  "error": "User not found"
}
```

**Implementation Checklist:**
- [ ] Route handler defined
- [ ] Query parameter validation (mobile is required)
- [ ] Prisma query: `prisma.user.findUnique({ where: { mobile } })`
- [ ] Password field stripped from response
- [ ] Handle missing mobile parameter (400 error)
- [ ] Test with mock data

**Related Files:**
- `src/routes/users.js` → GET handler
- `prisma/seed.mjs` → seeds users with different mobiles

---

#### 2.1.2 POST /api/users (Create User/Sign Up)

**Purpose:** Register a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9988776655",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "id": "user_new_1",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9988776655",
  "role": "CUSTOMER",
  "createdAt": "2026-08-08T10:30:00.000Z"
}
```

**Response (409):**
```json
{
  "error": "Mobile number already registered"
}
```

**Implementation Details:**
- Generate unique user ID using `uuid(4)`
- Hash password with `crypto.scryptSync`:
  ```javascript
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.scryptSync(password, salt, 64).toString('hex');
  const hashedPassword = `${salt}:${key}`;
  ```
- New users always get `role: 'CUSTOMER'` by default
- Return user WITHOUT password field
- Check for duplicate mobile (409 Conflict)

**Implementation Checklist:**
- [ ] Validate required fields (name, email, mobile, password)
- [ ] Check mobile uniqueness before creation
- [ ] Hash password with proper salt generation
- [ ] Generate uuid v4 for user.id
- [ ] Set role = CUSTOMER
- [ ] Return 201 with created user (no password)
- [ ] Test duplicate mobile handling (409)
- [ ] Test with invalid email format

**Related Files:**
- `src/routes/users.js` → POST handler
- `src/lib/crypto.js` (new utility file for password hashing)

---

#### 2.1.3 PUT /api/users (Update User Profile)

**Purpose:** Update user profile (name, email)

**Request Body:**
```json
{
  "id": "user_customer_1",
  "name": "Aditi Updated",
  "email": "aditi.new@example.com"
}
```

**Response (200):**
```json
{
  "id": "user_customer_1",
  "name": "Aditi Updated",
  "email": "aditi.new@example.com",
  "mobile": "9999999999",
  "role": "CUSTOMER",
  "createdAt": "2026-05-01T10:00:00.000Z"
}
```

**Response (404):**
```json
{
  "error": "User not found"
}
```

**Implementation Checklist:**
- [ ] Extract user.id from request body
- [ ] Validate id is provided
- [ ] Prisma query: `prisma.user.update({ where: { id }, data: { name, email } })`
- [ ] Return updated user WITHOUT password
- [ ] Handle non-existent user (404)
- [ ] Test update with only name, only email, both
- [ ] Verify updatedAt timestamp changes

**Related Files:**
- `src/routes/users.js` → PUT handler

---

### 2.2 Password-Based Login (src/routes/auth.js)

**Status:** 🟡 Partial (Basic structure exists)

#### 2.2.1 POST /api/auth/login

**Purpose:** Authenticate user with mobile + password

**Request Body:**
```json
{
  "mobile": "9999999999",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_customer_1",
    "name": "Aditi Sharma",
    "email": "aditi.sharma@example.com",
    "mobile": "9999999999",
    "role": "CUSTOMER",
    "createdAt": "2026-05-01T10:00:00.000Z"
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials."
}
```

**Implementation Details:**

1. **Find user by mobile:**
   ```javascript
   const user = await prisma.user.findUnique({ where: { mobile } });
   ```

2. **Verify password using stored salt:key:**
   ```javascript
   function verifyPassword(inputPassword, storedHash) {
     const [salt, key] = storedHash.split(':');
     const inputKey = crypto.scryptSync(inputPassword, salt, 64).toString('hex');
     return inputKey === key;
   }
   ```

3. **Return user WITHOUT password**

**Implementation Checklist:**
- [ ] Validate mobile and password are provided
- [ ] Query user by mobile
- [ ] Return 401 if user not found
- [ ] Verify password against stored hash
- [ ] Return 401 if password doesn't match
- [ ] Return 200 with user (no password)
- [ ] Test with correct credentials → 200
- [ ] Test with wrong password → 401
- [ ] Test with non-existent mobile → 401
- [ ] Test missing fields → 400

**Related Files:**
- `src/routes/auth.js` → POST /login handler
- `src/lib/crypto.js` → verifyPassword utility

---

## Phase 3: Product Management

### 3.1 Product CRUD Operations (src/routes/products.js)

**Status:** 🟡 Partial (Structure exists, image upload needs verification)

#### 3.1.1 GET /api/products (Get All Products)

**Purpose:** Fetch all products in catalog

**Request:** `GET /api/products`

**Response (200):**
```json
[
  {
    "id": "prod_almond",
    "name": "Premium California Almonds",
    "description": "Hand-picked, naturally air-dried...",
    "mrp": 649,
    "price": 549,
    "images": ["https://s3.example.com/almond.jpg"],
    "category": "Food & Drink",
    "inStock": true,
    "rating": [
      {
        "id": "rating_prod_almond_1",
        "rating": 5,
        "review": "Fresh and crunchy...",
        "user": {
          "name": "Kavita Rao",
          "image": "https://example.com/profile1.jpg"
        },
        "productId": "prod_almond",
        "createdAt": "2026-06-15T09:30:00.000Z"
      }
    ],
    "createdAt": "2026-07-29T09:15:25.000Z"
  }
]
```

**Implementation Checklist:**
- [ ] Query all products: `prisma.product.findMany({ include: { rating: true } })`
- [ ] Include nested ratings in response
- [ ] For each rating, include user.name and user.image
- [ ] Return 200 with array of products
- [ ] Test with sample data
- [ ] Pagination support (optional: limit, offset params)

**Related Files:**
- `src/routes/products.js` → GET / handler

---

#### 3.1.2 GET /api/products/:id (Get Product by ID)

**Purpose:** Fetch detailed product information

**Request:** `GET /api/products/prod_almond`

**Response (200):** Same structure as 3.1.1 but single product

**Response (404):**
```json
{
  "error": "Product not found"
}
```

**Implementation Checklist:**
- [ ] Extract productId from params
- [ ] Query: `prisma.product.findUnique({ where: { id: productId }, include: { rating: true } })`
- [ ] Include nested ratings with user data
- [ ] Return 200 with product
- [ ] Return 404 if not found
- [ ] Test with valid ID, non-existent ID

**Related Files:**
- `src/routes/products.js` → GET /:id handler

---

#### 3.1.3 POST /api/products (Create Product - Admin Only)

**Purpose:** Create new product with image upload

**Request:** `POST /api/products` (FormData)

```
multipart/form-data:
- name (text): "New Premium Almonds"
- description (text): "Description here..."
- mrp (number): 500
- price (number): 450
- category (text): "Food & Drink"
- images[] (file[]): [file1.jpg, file2.jpg, ...]
```

**Response (201):**
```json
{
  "id": "prod_new_1",
  "name": "New Premium Almonds",
  "description": "Description here...",
  "mrp": 500,
  "price": 450,
  "images": [
    "https://s3.example.com/products/prod_new_1/image1.jpg",
    "https://s3.example.com/products/prod_new_1/image2.jpg"
  ],
  "category": "Food & Drink",
  "inStock": true,
  "rating": [],
  "createdAt": "2026-08-08T10:30:00.000Z"
}
```

**Implementation Details:**

1. **Parse multipart FormData** with `multer` (memory storage):
   ```javascript
   const upload = multer({ storage: multer.memoryStorage() });
   router.post('/', upload.array('images'), async (req, res) => { ... });
   ```

2. **Upload each image to S3:**
   ```javascript
   const uploadedUrls = [];
   for (const file of req.files) {
     const key = `products/${randomUUID()}/${file.originalname}`;
     await s3Client.send(new PutObjectCommand({
       Bucket: BUCKET_NAME,
       Key: key,
       Body: file.buffer,
       ContentType: file.mimetype,
     }));
     uploadedUrls.push(`${S3_ENDPOINT}/${BUCKET_NAME}/${key}`);
   }
   ```

3. **Create product with S3 image URLs:**
   ```javascript
   const product = await prisma.product.create({
     data: {
       name, description, mrp, price, category,
       images: uploadedUrls,
       inStock: true
     }
   });
   ```

**Implementation Checklist:**
- [ ] Install `multer` package (memory storage)
- [ ] Configure multer middleware for `/api/products` POST
- [ ] Validate required fields (name, description, mrp, price, category)
- [ ] Validate at least 1 image provided
- [ ] Upload images to S3 with unique keys
- [ ] Handle S3 upload errors gracefully (400/500)
- [ ] Create product with uploaded image URLs
- [ ] Generate product.id with uuid(4)
- [ ] Return 201 with created product
- [ ] Test with valid images
- [ ] Test with no images (400)
- [ ] Test with invalid image types

**Related Files:**
- `src/routes/products.js` → POST / handler
- `src/lib/s3.js` → S3 client
- `package.json` → add multer dependency

---

#### 3.1.4 PUT /api/products/:id (Update Product)

**Purpose:** Update product details or toggle stock

**Request Option 1 - Full Edit (FormData):**
```
PUT /api/products/prod_almond
multipart/form-data:
- name: "Updated Name"
- description: "Updated description..."
- mrp: 649
- price: 549
- category: "Food & Drink"
- inStock: true
- images[] (file[], optional): [newfile.jpg]
- existingImages (JSON string): ["https://s3.example.com/almond.jpg"]
```

**Request Option 2 - Stock Toggle (JSON):**
```json
PUT /api/products/prod_almond
{
  "inStock": false
}
```

**Response (200):**
```json
{
  "id": "prod_almond",
  "name": "Updated Name",
  "description": "Updated description...",
  "mrp": 649,
  "price": 549,
  "images": ["https://s3.example.com/almond.jpg", "https://s3.example.com/new.jpg"],
  "category": "Food & Drink",
  "inStock": false,
  "updatedAt": "2026-08-08T11:00:00.000Z"
}
```

**Response (404):**
```json
{
  "error": "Product not found"
}
```

**Implementation Details:**

1. **Determine update type:**
   - If `Content-Type: application/json`, it's a stock toggle
   - If `Content-Type: multipart/form-data`, it's a full edit

2. **For stock toggle:**
   ```javascript
   const product = await prisma.product.update({
     where: { id: productId },
     data: { inStock: req.body.inStock }
   });
   ```

3. **For full edit (merge images):**
   ```javascript
   // Upload new images to S3
   const newImageUrls = [...]; // from file uploads
   
   // Parse existing images from JSON string
   const existingImages = JSON.parse(req.body.existingImages || '[]');
   
   // Merge: keep existing, add new
   const allImages = [...existingImages, ...newImageUrls];
   
   const product = await prisma.product.update({
     where: { id: productId },
     data: {
       name, description, mrp, price, category, inStock,
       images: allImages
     }
   });
   ```

**Implementation Checklist:**
- [ ] Extract productId from params
- [ ] Handle both JSON and FormData content types
- [ ] Check product exists (404 if not)
- [ ] For stock toggle: update only inStock field
- [ ] For full edit:
  - [ ] Upload new images to S3
  - [ ] Parse existingImages from JSON string
  - [ ] Merge old + new images
  - [ ] Update all fields
- [ ] Return 200 with updated product
- [ ] Test stock toggle (inStock only)
- [ ] Test full edit (all fields)
- [ ] Test image merge (existing + new)
- [ ] Test non-existent product (404)

**Related Files:**
- `src/routes/products.js` → PUT /:id handler

---

#### 3.1.5 DELETE /api/products/:id (Delete Product)

**Purpose:** Delete product from catalog (admin only)

**Request:** `DELETE /api/products/prod_almond`

**Response (200):**
```json
{
  "success": true
}
```

**Response (404):**
```json
{
  "error": "Product not found"
}
```

**Response (409):**
```json
{
  "error": "Cannot delete product with existing orders"
}
```

**Implementation Details:**

1. **Check for associated OrderItems:**
   ```javascript
   const existingOrders = await prisma.orderItem.findMany({
     where: { productId }
   });
   if (existingOrders.length > 0) {
     return res.status(409).json({ error: '...' });
   }
   ```

2. **Delete product:**
   ```javascript
   await prisma.product.delete({ where: { id: productId } });
   ```

**Implementation Checklist:**
- [ ] Extract productId from params
- [ ] Check for existing OrderItems
- [ ] Return 409 if product has orders
- [ ] Delete product from database
- [ ] Return 200 with success flag
- [ ] Test deletion with no orders
- [ ] Test deletion with existing orders (409)
- [ ] Test non-existent product (404)

**Related Files:**
- `src/routes/products.js` → DELETE /:id handler

---

## Phase 4: Orders & Cart

### 4.1 Order Management (src/routes/orders.js)

**Status:** 🟡 Partial (Structure exists, needs full implementation)

#### 4.1.1 GET /api/orders (Get Orders, optionally filtered by userId)

**Purpose:** Fetch orders (all or filtered by customer)

**Request:**
```
GET /api/orders                    # All orders (admin)
GET /api/orders?userId=user_id     # User's orders (customer)
```

**Response (200):**
```json
[
  {
    "id": "order_1",
    "total": 1078,
    "status": "DELIVERED",
    "userId": "user_customer_1",
    "addressId": "addr_1",
    "isPaid": true,
    "paymentMethod": "COD",
    "isCouponUsed": false,
    "coupon": null,
    "orderItems": [
      {
        "orderId": "order_1",
        "productId": "prod_almond",
        "quantity": 1,
        "price": 549,
        "product": {
          "id": "prod_almond",
          "name": "Premium California Almonds",
          "category": "Food & Drink"
        }
      }
    ],
    "address": {
      "id": "addr_1",
      "name": "Aditi Sharma",
      "mobile": "9999999999",
      "addressLine1": "Flat 302",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "user": {
      "id": "user_customer_1",
      "name": "Aditi Sharma",
      "email": "aditi.sharma@example.com",
      "mobile": "9999999999"
    },
    "createdAt": "2026-07-15T09:15:03.000Z"
  }
]
```

**Implementation Checklist:**
- [ ] Get userId from query params (optional)
- [ ] If userId provided: filter orders by userId
- [ ] Include nested: orderItems > product, address, user
- [ ] Query: `prisma.order.findMany({ where, include: { ... } })`
- [ ] Return 200 with orders array
- [ ] Test without userId (all orders)
- [ ] Test with userId (filtered orders)
- [ ] Test non-existent userId (empty array)

**Related Files:**
- `src/routes/orders.js` → GET / handler

---

#### 4.1.2 POST /api/orders (Create Order)

**Purpose:** Create new order from cart

**Request Body:**
```json
{
  "userId": "user_customer_1",
  "addressId": "addr_1",
  "total": 1078.4,
  "paymentMethod": "COD",
  "isCouponUsed": true,
  "coupon": {
    "code": "OFF10",
    "description": "10% Off for All Users",
    "discount": 10,
    "expiresAt": "2026-12-31T00:00:00.000Z"
  },
  "orderItems": [
    {
      "productId": "prod_almond",
      "quantity": 1,
      "price": 549
    },
    {
      "productId": "prod_alsi",
      "quantity": 2,
      "price": 169
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "order_new_1",
  "total": 1078.4,
  "status": "ORDER_PLACED",
  "userId": "user_customer_1",
  "addressId": "addr_1",
  "isPaid": false,
  "paymentMethod": "COD",
  "isCouponUsed": true,
  "coupon": {
    "code": "OFF10",
    "discount": 10
  },
  "orderItems": [...],
  "address": {...},
  "user": {...},
  "createdAt": "2026-08-08T12:00:00.000Z"
}
```

**Implementation Details:**

Use `prisma.order.create()` with nested `orderItems` create:

```javascript
const order = await prisma.order.create({
  data: {
    id: randomUUID(),
    total: req.body.total,
    status: 'ORDER_PLACED',
    paymentMethod: req.body.paymentMethod,
    userId: req.body.userId,
    addressId: req.body.addressId,
    isPaid: req.body.paymentMethod === 'COD' ? false : true,
    isCouponUsed: req.body.isCouponUsed,
    coupon: req.body.coupon || {},
    orderItems: {
      create: req.body.orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    }
  },
  include: {
    orderItems: { include: { product: true } },
    address: true,
    user: true
  }
});
```

**Implementation Checklist:**
- [ ] Validate required fields (userId, addressId, total, paymentMethod, orderItems)
- [ ] Validate orderItems is non-empty array
- [ ] Generate order.id with uuid(4)
- [ ] Set status = 'ORDER_PLACED'
- [ ] Set isPaid based on paymentMethod (COD = false, STRIPE = assume true)
- [ ] Create order with nested orderItems in single transaction
- [ ] Include nested orderItems.product, address, user in response
- [ ] Return 201 with created order
- [ ] Test with valid data
- [ ] Test with missing fields (400)
- [ ] Test with empty orderItems (400)
- [ ] Test with coupon, without coupon

**Related Files:**
- `src/routes/orders.js` → POST / handler

---

#### 4.1.3 PUT /api/orders/:id (Update Order Status)

**Purpose:** Update order status (admin only)

**Request Body:**
```json
{
  "status": "SHIPPED"
}
```

**Response (200):**
```json
{
  "id": "order_1",
  "total": 1078,
  "status": "SHIPPED",
  "userId": "user_customer_1",
  "addressId": "addr_1",
  "updatedAt": "2026-08-08T12:30:00.000Z"
}
```

**Response (404):**
```json
{
  "error": "Order not found"
}
```

**Response (400):**
```json
{
  "error": "Invalid status"
}
```

**Valid Status Values:**
- `ORDER_PLACED`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`

**Implementation Checklist:**
- [ ] Extract orderId from params, status from body
- [ ] Validate status is in OrderStatus enum
- [ ] Query order exists (404 if not)
- [ ] Update: `prisma.order.update({ where: { id }, data: { status } })`
- [ ] Return 200 with updated order
- [ ] Test with valid status
- [ ] Test with invalid status (400)
- [ ] Test non-existent order (404)

**Related Files:**
- `src/routes/orders.js` → PUT /:id handler

---

## Phase 5: Addresses & Coupons

### 5.1 Address Management (src/routes/addresses.js)

**Status:** 🟡 Partial (Basic structure exists)

#### 5.1.1 GET /api/addresses (Get User's Addresses)

**Purpose:** Fetch all saved addresses for logged-in user

**Request:** `GET /api/addresses` (typically with userId in session, but here as query param)

**Note:** Frontend will pass userId in body or params

**Response (200):**
```json
[
  {
    "id": "addr_1",
    "userId": "user_customer_1",
    "name": "Aditi Sharma",
    "mobile": "9999999999",
    "pincode": "400001",
    "addressLine1": "Flat 302, Sunrise Apartments",
    "addressLine2": "Near Marine Lines Station",
    "landmark": "Opposite City Hospital",
    "city": "Mumbai",
    "state": "Maharashtra",
    "createdAt": "2026-06-01T08:30:00.000Z"
  }
]
```

**Implementation Checklist:**
- [ ] Get userId from query param or body
- [ ] Query: `prisma.address.findMany({ where: { userId } })`
- [ ] Return 200 with addresses array
- [ ] Test with valid userId
- [ ] Test non-existent userId (empty array)

**Related Files:**
- `src/routes/addresses.js` → GET / handler

---

#### 5.1.2 POST /api/addresses (Create Address)

**Purpose:** Save new delivery address

**Request Body:**
```json
{
  "userId": "user_customer_1",
  "name": "Aditi Sharma",
  "mobile": "9999999999",
  "pincode": "400001",
  "addressLine1": "Flat 302, Sunrise Apartments",
  "addressLine2": "Near Marine Lines Station",
  "landmark": "Opposite City Hospital",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

**Response (201):**
```json
{
  "id": "addr_new_1",
  "userId": "user_customer_1",
  "name": "Aditi Sharma",
  "mobile": "9999999999",
  "pincode": "400001",
  "addressLine1": "Flat 302, Sunrise Apartments",
  "addressLine2": "Near Marine Lines Station",
  "landmark": "Opposite City Hospital",
  "city": "Mumbai",
  "state": "Maharashtra",
  "createdAt": "2026-08-08T12:15:00.000Z"
}
```

**Implementation Checklist:**
- [ ] Validate required fields (userId, name, mobile, pincode, addressLine1, city, state)
- [ ] Validate mobile format (10 digits)
- [ ] Validate pincode format (6 digits)
- [ ] Generate address.id with uuid(4)
- [ ] Create: `prisma.address.create({ data })`
- [ ] Return 201 with created address
- [ ] Test with valid data
- [ ] Test with missing fields (400)
- [ ] Test with invalid mobile/pincode (400)

**Related Files:**
- `src/routes/addresses.js` → POST / handler

---

### 5.2 Coupon Management (src/routes/coupons.js)

**Status:** 🟡 Partial (Basic structure exists)

#### 5.2.1 GET /api/coupons (Get Available Coupons)

**Purpose:** Fetch all active coupons

**Request:** `GET /api/coupons`

**Response (200):**
```json
[
  {
    "code": "NEW20",
    "description": "20% Off for New Users",
    "discount": 20,
    "forNewUser": true,
    "forMember": false,
    "isPublic": false,
    "expiresAt": "2026-12-31T00:00:00.000Z",
    "createdAt": "2026-01-10T08:35:31.000Z"
  },
  {
    "code": "OFF10",
    "description": "10% Off for All Users",
    "discount": 10,
    "forNewUser": false,
    "forMember": false,
    "isPublic": false,
    "expiresAt": "2026-12-31T00:00:00.000Z",
    "createdAt": "2026-01-10T08:42:21.000Z"
  }
]
```

**Implementation Checklist:**
- [ ] Query all coupons: `prisma.coupon.findMany()`
- [ ] Filter by expiry date (optional: only active coupons)
- [ ] Return 200 with coupons array
- [ ] Test with seed data

**Related Files:**
- `src/routes/coupons.js` → GET / handler
- `prisma/schema.prisma` → Coupon model

---

#### 5.2.2 POST /api/coupons (Create Coupon - Admin Only)

**Purpose:** Create new promotion code (admin only)

**Request Body:**
```json
{
  "code": "SAVE30",
  "description": "30% Off Summer Sale",
  "discount": 30,
  "forNewUser": false,
  "forMember": false,
  "isPublic": true,
  "expiresAt": "2026-12-31T00:00:00.000Z"
}
```

**Response (201):**
```json
{
  "code": "SAVE30",
  "description": "30% Off Summer Sale",
  "discount": 30,
  "forNewUser": false,
  "forMember": false,
  "isPublic": true,
  "expiresAt": "2026-12-31T00:00:00.000Z",
  "createdAt": "2026-08-08T12:00:00.000Z"
}
```

**Response (409):**
```json
{
  "error": "Coupon code already exists"
}
```

**Implementation Checklist:**
- [ ] Validate required fields (code, description, discount, expiresAt)
- [ ] Validate discount is 0-100
- [ ] Check code uniqueness (409 if duplicate)
- [ ] Create: `prisma.coupon.create({ data })`
- [ ] Return 201 with created coupon
- [ ] Test with valid data
- [ ] Test duplicate code (409)
- [ ] Test invalid discount (400)

**Related Files:**
- `src/routes/coupons.js` → POST / handler

---

## Phase 6: Ratings & Reviews

### 6.1 Rating Management (src/routes/ratings.js)

**Status:** 🟡 Partial (Basic structure exists)

#### 6.1.1 GET /api/ratings (Get Ratings, optionally filtered by productId)

**Purpose:** Fetch product reviews

**Request:**
```
GET /api/ratings                       # All ratings
GET /api/ratings?productId=prod_id     # Ratings for specific product
```

**Response (200):**
```json
[
  {
    "id": "rating_prod_almond_1",
    "rating": 5,
    "review": "Fresh and crunchy, exactly as described. Will order again.",
    "user": {
      "name": "Kavita Rao",
      "image": "https://example.com/profile1.jpg"
    },
    "productId": "prod_almond",
    "product": {
      "id": "prod_almond",
      "name": "Premium California Almonds",
      "category": "Food & Drink"
    },
    "createdAt": "2026-06-15T09:30:00.000Z"
  }
]
```

**Implementation Checklist:**
- [ ] Get productId from query params (optional)
- [ ] If productId: filter by productId
- [ ] Include nested: user { name, image }, product { id, name, category }
- [ ] Query: `prisma.rating.findMany({ where, include: { ... } })`
- [ ] Return 200 with ratings array
- [ ] Test without productId (all ratings)
- [ ] Test with productId (filtered)

**Related Files:**
- `src/routes/ratings.js` → GET / handler

---

#### 6.1.2 POST /api/ratings (Create Rating/Review)

**Purpose:** Submit product review

**Request Body:**
```json
{
  "productId": "prod_almond",
  "userId": "user_customer_1",
  "rating": 4.5,
  "review": "Excellent quality almonds, very fresh!"
}
```

**Response (201):**
```json
{
  "id": "rating_new_1",
  "productId": "prod_almond",
  "userId": "user_customer_1",
  "rating": 4.5,
  "review": "Excellent quality almonds, very fresh!",
  "user": {
    "name": "Aditi Sharma",
    "image": "https://example.com/profile.jpg"
  },
  "createdAt": "2026-08-08T12:45:00.000Z"
}
```

**Response (404):**
```json
{
  "error": "Product or user not found"
}
```

**Implementation Checklist:**
- [ ] Validate required fields (productId, userId, rating, review)
- [ ] Validate rating is 1-5 (or 1-5 with decimals)
- [ ] Check product exists (404 if not)
- [ ] Check user exists (404 if not)
- [ ] Generate rating.id with uuid(4)
- [ ] Create: `prisma.rating.create({ data, include: { user, product } })`
- [ ] Return 201 with created rating
- [ ] Include user.name, user.image in response
- [ ] Test with valid data
- [ ] Test non-existent product (404)
- [ ] Test non-existent user (404)
- [ ] Test invalid rating value (400)

**Related Files:**
- `src/routes/ratings.js` → POST / handler

---

## Phase 7: SMS/OTP Integration

### 7.1 OTP-Based Authentication (src/routes/sms.js)

**Status:** 🟡 Partial (Structure exists, needs whapi.cloud integration)

#### 7.1.1 POST /api/sms/send (Send OTP)

**Purpose:** Send OTP via WhatsApp to mobile number

**Request Body:**
```json
{
  "mobile": "9999999999"
}
```

**Response (200):**
```json
{
  "message": "OTP sent to your mobile"
}
```

**Response (400):**
```json
{
  "error": "Invalid mobile number"
}
```

**Implementation Details:**

1. **Generate 4-digit OTP:**
   ```javascript
   const otp = Math.floor(1000 + Math.random() * 9000).toString();
   ```

2. **Get or create OtpTemplate:**
   ```javascript
   let template = await prisma.otpTemplate.findUnique({
     where: { name: 'OtpTemplate' }
   });
   if (!template) {
     template = await prisma.otpTemplate.create({
       data: {
         name: 'OtpTemplate',
         template: 'Your OTP is {{otp}}. Valid for 5 minutes.',
         variables: ['otp']
       }
     });
   }
   ```

3. **Create OtpCode record (5-min expiry):**
   ```javascript
   const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
   await prisma.otpCode.create({
     data: {
       mobile,
       code: otp,
       expiresAt,
       isUsed: false
     }
   });
   ```

4. **Send via whapi.cloud:**
   ```javascript
   const message = template.template.replace('{{otp}}', otp);
   await fetch('https://api.whapi.cloud/messages/text', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${WHAPI_TOKEN}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       to: mobile,
       body: message
     })
   });
   ```

**Implementation Checklist:**
- [ ] Validate mobile format (10 digits)
- [ ] Generate 4-digit OTP
- [ ] Get/create OtpTemplate in database
- [ ] Create OtpCode with 5-min expiry
- [ ] Send to whapi.cloud with Bearer token
- [ ] Handle whapi.cloud API errors (500)
- [ ] Return 200 on success
- [ ] Return 400 for invalid mobile
- [ ] Test with valid mobile
- [ ] Test with invalid mobile format (400)
- [ ] Test OtpCode created in database

**Environment Variables:**
```bash
WHAPI_BASE_URL=https://api.whapi.cloud
WHAPI_TOKEN=your_whapi_token
```

**Related Files:**
- `src/routes/sms.js` → POST /send handler
- `prisma/schema.prisma` → OtpTemplate, OtpCode models

---

#### 7.1.2 POST /api/sms/verify (Verify OTP)

**Purpose:** Verify OTP code sent to mobile

**Request Body:**
```json
{
  "mobile": "9999999999",
  "otp": "1234"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Invalid OTP."
}
```

**Implementation Details:**

1. **Find matching, unused, unexpired OtpCode:**
   ```javascript
   const otpRecord = await prisma.otpCode.findFirst({
     where: {
       mobile,
       code: otp,
       isUsed: false,
       expiresAt: { gt: new Date() }
     }
   });
   ```

2. **Mark as used:**
   ```javascript
   if (!otpRecord) return 400 with error;
   
   await prisma.otpCode.update({
     where: { id: otpRecord.id },
     data: { isUsed: true }
   });
   ```

3. **Return success:**
   ```javascript
   return 200 with { success: true }
   ```

**Implementation Checklist:**
- [ ] Validate mobile and otp provided
- [ ] Query unexpired, unused OtpCode
- [ ] Return 400 if not found or expired
- [ ] Mark OtpCode as used
- [ ] Return 200 with success flag
- [ ] Test with valid OTP
- [ ] Test with expired OTP (400)
- [ ] Test with already-used OTP (400)
- [ ] Test with non-existent OTP (400)

**Related Files:**
- `src/routes/sms.js` → POST /verify handler

---

## Phase 8: Testing & Documentation

### 8.1 Manual Testing

**Test Categories:**

1. **Authentication**
   - [ ] Password login flow
   - [ ] OTP send/verify flow
   - [ ] User signup
   - [ ] User profile update

2. **Products**
   - [ ] List all products
   - [ ] Get product by ID
   - [ ] Create product with images
   - [ ] Update product (stock, details)
   - [ ] Delete product (with/without orders)

3. **Orders**
   - [ ] Create order with multiple items
   - [ ] Get all orders (admin)
   - [ ] Get orders by userId (customer)
   - [ ] Update order status
   - [ ] Order with coupon

4. **Addresses**
   - [ ] Create address
   - [ ] Get user addresses
   - [ ] Multiple addresses per user

5. **Coupons**
   - [ ] List available coupons
   - [ ] Create coupon (admin)
   - [ ] Check expiry handling

6. **Ratings**
   - [ ] Create product rating
   - [ ] Get product ratings
   - [ ] Ratings included in product details

7. **Error Handling**
   - [ ] 404 for non-existent resources
   - [ ] 400 for invalid input
   - [ ] 409 for duplicate/conflict
   - [ ] 500 for server errors

**Tools:**
- cURL for quick API calls
- Postman for detailed testing
- Frontend integration testing

---

### 8.2 API Documentation

**Required Documentation:**
- [ ] Update this IMPLEMENTATION_PLAN.md
- [ ] Create API_REFERENCE.md in `/docs` (detailed endpoint specs)
- [ ] Create DATABASE_SCHEMA.md (Prisma models)
- [ ] Create DEPLOYMENT.md (production setup)
- [ ] Update main CLAUDE.md with current status

**Example cURL Tests:**

```bash
# Test health / CORS
curl -X OPTIONS http://localhost:4000/api/products \
  -H "Origin: http://localhost:3000" \
  -v

# Get all products
curl http://localhost:4000/api/products

# Get single product
curl http://localhost:4000/api/products/prod_almond

# Create user
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John","email":"john@example.com",
    "mobile":"9988776655","password":"pass123"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9999999999","password":"password123"}'

# Send OTP
curl -X POST http://localhost:4000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9999999999"}'

# Verify OTP
curl -X POST http://localhost:4000/api/sms/verify \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9999999999","otp":"1234"}'
```

---

### 8.3 Error Handling Standards

**All endpoints should follow this pattern:**

```javascript
try {
  // Validate input
  if (!req.body.required_field) {
    return res.status(400).json({ error: 'Field is required' });
  }

  // Check existence
  const resource = await prisma.model.findUnique({ ... });
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  // Business logic
  const result = await prisma.model.update({ ... });

  // Success response
  return res.status(200).json(result);
} catch (error) {
  console.error('Error in endpoint:', error);
  return res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
}
```

**Status Codes:**
- `200 OK` — Successful GET/PUT/DELETE
- `201 Created` — Successful POST
- `400 Bad Request` — Invalid input, validation errors
- `404 Not Found` — Resource doesn't exist
- `409 Conflict` — Duplicate resource, business logic violation
- `500 Internal Server Error` — Unexpected server error

---

## Implementation Checklist

### Phase 1: Core Infrastructure ✅
- [x] Express app setup with CORS
- [x] Prisma client configuration
- [x] S3 client setup
- [ ] Docker environment validation

### Phase 2: Authentication & User Management 🟡
- [x] User GET by mobile endpoint (basic)
- [x] User POST (sign up) endpoint (basic)
- [ ] User POST password hashing (needs crypto utility)
- [ ] User PUT (update) endpoint (needs testing)
- [x] Login POST endpoint (basic)
- [ ] Login password verification (needs crypto utility)

### Phase 3: Product Management 🟡
- [x] Products GET all (basic)
- [x] Products GET by ID (basic)
- [ ] Products POST (image upload needs testing)
- [ ] Products PUT (image merge needs testing)
- [ ] Products DELETE (with order check)

### Phase 4: Orders & Cart 🟡
- [x] Orders GET (basic)
- [ ] Orders POST (nested creates)
- [ ] Orders PUT (status update)

### Phase 5: Addresses & Coupons 🟡
- [x] Addresses GET (basic)
- [ ] Addresses POST (validation)
- [x] Coupons GET (basic)
- [ ] Coupons POST (admin, validation)

### Phase 6: Ratings & Reviews 🟡
- [x] Ratings GET (basic)
- [ ] Ratings POST (with user lookup)

### Phase 7: SMS/OTP Integration 🟡
- [ ] SMS send (whapi.cloud integration)
- [ ] SMS verify (OTP validation)
- [ ] OTP expiry handling
- [ ] OtpTemplate management

### Phase 8: Testing & Documentation 🟡
- [ ] Manual testing suite
- [ ] Error handling audit
- [ ] API documentation
- [ ] Deployment guide

---

## Priority Order

**Recommended Implementation Order:**

1. **High Priority (Core Features)**
   - Phase 2: Auth & Users (password hashing, login verification)
   - Phase 3: Products (complete POST/PUT/DELETE with image handling)
   - Phase 4: Orders (complete POST with nested creates)
   - Phase 5: Addresses (complete validation and creation)

2. **Medium Priority (Supporting Features)**
   - Phase 6: Ratings (complete implementation)
   - Phase 5: Coupons (complete implementation)
   - Phase 7: SMS/OTP (whapi.cloud integration)

3. **Low Priority (Polish & Docs)**
   - Phase 8: Testing & Documentation
   - Error handling audit
   - Performance optimization

---

## Known Issues & Gaps

1. **No Server-Side Session/Auth Middleware**
   - Routes are unprotected at HTTP layer
   - Role checks (admin-only) happen client-side only
   - Frontend is responsible for enforcing permissions

2. **ID Generation**
   - Uses `uuid(4)` for most IDs
   - User.id is caller-supplied (needs clarification)
   - Coupon.code is its own primary key

3. **Missing Utilities**
   - Password hashing function in separate crypto.js module
   - Input validation helpers
   - Error response standardization

4. **Image Handling**
   - Images stored on S3, URLs in database
   - No image optimization
   - No image deletion when product updated

5. **Database Transactions**
   - Order creation uses nested creates (should be transaction)
   - Coupon code deletion doesn't cascade

---

## Resources & References

- **Frontend API Spec:** `/references/api-structure.md`
- **Frontend Architecture:** `/references/frontend-architecture.md`
- **Prisma Schema:** `prisma/schema.prisma`
- **Seed Data:** `prisma/seed.mjs` (sample data inlined; no separate fixture file)

---

## Next Steps

1. **Review this plan** with the team
2. **Set up local environment:**
   ```bash
   npm install
   docker-compose up -d
   npm run prisma:migrate:dev
   npm run prisma:db:seed
   npm run init:s3
   npm run dev
   ```
3. **Pick Phase 2 as starting point** (Authentication is foundational)
4. **Implement crypto utilities** for password hashing
5. **Test each endpoint** with provided cURL examples
6. **Document as you go** (update this file after each phase)

---

**Last Updated:** 2026-08-08  
**Status:** In Progress  
**Next Phase:** Phase 2 - Authentication & User Management
