# Database Schema

Comprehensive documentation of all Prisma data models, their relationships, constraints, validation rules, and usage patterns for the Mangal Superfoods API.

**Database:** PostgreSQL with Prisma ORM  
**Driver:** `@prisma/adapter-pg` with native connection pooling via `pg.Pool`  
**Location:** `prisma/schema.prisma`

---

## Table of Contents

1. [Models Overview](#models-overview)
2. [User Model](#user-model)
3. [Product Model](#product-model)
4. [Order & OrderItem Models](#order--orderitem-models)
5. [Address Model](#address-model)
6. [Rating Model](#rating-model)
7. [Coupon Model](#coupon-model)
8. [OTP Models](#otp-models)
9. [Enums Reference](#enums-reference)
10. [Relations Overview](#relations-overview)
11. [Query Examples](#query-examples)
12. [Cascade Deletes](#cascade-deletes)

---

## Models Overview

| Model | Purpose | ID Type | Timestamps | Key Features |
|-------|---------|---------|-----------|--------------|
| `User` | Registered users with roles and cart state | uuid v4 | createdAt, updatedAt | Mobile unique, role-based |
| `Product` | Storefront products with images and pricing | uuid v4 | createdAt, updatedAt | Stock status, image array |
| `Order` | Customer orders with payment and status tracking | uuid v4 | createdAt, updatedAt | Status transitions, payment method |
| `OrderItem` | Line items within orders | Composite (orderId + productId) | None | Price snapshot at purchase |
| `Rating` | Product reviews and ratings by users | uuid v4 | createdAt, updatedAt | Unique per user/product/order |
| `Address` | Delivery addresses for users | uuid v4 | createdAt only | Cascade delete with user |
| `Coupon` | Promotional discount codes | string (code) | createdAt | Primary key is code |
| `OtpTemplate` | SMS OTP message templates | uuid v4 | createdAt, updatedAt | Auto-created on first use |
| `OtpCode` | One-time password records for login | uuid v4 | createdAt only | Indexed on mobile for speed |

---

## User Model

Represents a registered user with authentication, profile, and shopping cart data.

**Fields:**

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `id` | String | uuid v4 | @id, @default(uuid(4)) | User identifier (auto-generated; a caller-supplied id is still accepted) |
| `name` | String | — | Required | User's display name |
| `email` | String? | null | Optional | Email address |
| `image` | String | — | Required | Profile image URL |
| `cart` | Json | `{}` | Stored as JSON | Shopping cart contents (JSON object) |
| `role` | UserRole | `CUSTOMER` | — | User type: `CUSTOMER`, `ADMIN`, or `SELLER` |
| `mobile` | String? | null | @unique, Optional | Phone number (unique if provided) |
| `firstName` | String? | null | Optional | First name |
| `lastName` | String? | null | Optional | Last name |
| `inactive` | Boolean | false | — | Account status flag |
| `verifiedEmail` | Boolean | false | — | Email verification status |
| `password` | String? | null | Optional | Hashed password (`salt:key` format via crypto.scryptSync) |
| `createdAt` | DateTime | now() | — | Account creation timestamp |
| `updatedAt` | DateTime | now() | @updatedAt | Last update timestamp |

**Required Fields for Creating a User:**
```
id, name, image, cart (optional JSON string)
```

**Validation Rules:**
- `id`: Auto-generated uuid v4; `POST /api/users` also accepts one supplied by the caller
- `name`: Non-empty string
- `image`: Non-empty URL string
- `mobile`: If provided, must be unique across all users
- `password`: If provided, should be hashed using `crypto.scryptSync` as `salt:key` format
- `role`: Must be one of `CUSTOMER`, `ADMIN`, or `SELLER`
- `cart`: Stored as JSON; typically `{}` for new users
- `email`: Optional; no uniqueness constraint
- `verifiedEmail`: Boolean flag; starts as false

**Relations:**
- One-to-many with `Rating` (cascade delete via Rating)
- One-to-many with `Address` (cascade delete)
- One-to-many with `Order` as `BuyerRelation`

**Example:**
```javascript
const user = await prisma.user.create({
  data: {
    id: "user_john_doe",
    name: "John Doe",
    email: "john@example.com",
    mobile: "9988776655",
    password: "salt:hashedkey",
    role: "CUSTOMER",
    cart: JSON.stringify({}),
    image: "https://example.com/avatar.jpg"
  }
});

// Update user
const updated = await prisma.user.update({
  where: { id: "user_john_doe" },
  data: { verifiedEmail: true }
});
```

**Notes:**
- No HTTP-layer authentication; role checks are client-side only
- Password should be hashed before storage; never store plain text passwords

---

## Product Model

Represents a product in the storefront catalog.

**Fields:**

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `id` | String | uuid v4 | @id, @default(uuid(4)) | Auto-generated product identifier |
| `name` | String | — | Required | Product name |
| `description` | String | — | Required | Detailed product description |
| `mrp` | Float | — | Required | Maximum Retail Price |
| `price` | Float | — | Required | Selling price |
| `images` | String[] | — | Required | Array of S3 image URLs |
| `category` | String | — | Required | Product category |
| `inStock` | Boolean | true | — | Inventory availability flag |
| `createdAt` | DateTime | now() | — | Creation timestamp |
| `updatedAt` | DateTime | — | @updatedAt | Last update timestamp |

**Required Fields for Creating a Product:**
```
name, description, mrp, price, images, category
```

**Validation Rules:**
- `name`: Non-empty string
- `description`: Non-empty string
- `mrp`: Float value; should be >= `price` (recommended in route handler)
- `price`: Float > 0
- `images`: Array of S3 URLs; populated via multer upload + `src/lib/s3.js`
- `category`: Non-empty string
- `inStock`: Boolean; defaults to true

**Image Handling:**
- Images are uploaded to S3 via `multer` (memory storage) before storing URLs
- `src/lib/s3.js` configures S3Client with `forcePathStyle: true` for LocalStack/Backblaze B2
- PUT endpoint merges `existingImages` (URLs to keep) with newly uploaded files
- DELETE endpoint refuses deletion if product has associated `orderItems`

**Relations:**
- One-to-many with `OrderItem` (purchases)
- One-to-many with `Rating` (cascade delete on product deletion)

**Example:**
```javascript
const product = await prisma.product.create({
  data: {
    name: "Organic Quinoa",
    description: "Premium organic quinoa seeds",
    mrp: 500,
    price: 400,
    images: ["https://s3.example.com/quinoa-1.jpg"],
    category: "Grains",
    inStock: true
  }
});

// Update with image handling
const updated = await prisma.product.update({
  where: { id: "prod_1" },
  data: {
    images: ["https://s3.example.com/q1.jpg", "https://s3.example.com/q2.jpg"],
    price: 380
  }
});

// Delete (only if no orderItems)
const deleted = await prisma.product.delete({
  where: { id: "prod_1" }
});
```

**Notes:**
- Images are stored as array of strings, not file objects
- Price can be updated independently of MRP
- Delete operation fails if product has order items (prevent orphaned purchases)

---

## Order & OrderItem Models

Represents customer purchases with associated line items and payment details.

### Order Model

**Fields:**

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `id` | String | uuid v4 | @id, @default(uuid(4)) | Auto-generated order identifier |
| `total` | Float | — | Required | Order total amount |
| `status` | OrderStatus | `ORDER_PLACED` | — | Status: `ORDER_PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED` |
| `userId` | String | — | @relation | Foreign key to `User` |
| `addressId` | String | — | @relation | Foreign key to `Address` |
| `isPaid` | Boolean | false | — | Payment completion flag |
| `paymentMethod` | PaymentMethod | — | Required | `COD` or `STRIPE` |
| `isCouponUsed` | Boolean | false | — | Coupon application flag |
| `coupon` | Json | `{}` | Stored as JSON | Applied coupon data |
| `createdAt` | DateTime | now() | — | Order creation timestamp |
| `updatedAt` | DateTime | — | @updatedAt | Last update timestamp |

**Required Fields for Creating an Order:**
```
total, userId, addressId, isPaid, paymentMethod, isCouponUsed, coupon (JSON), orderItems (nested)
```

**Validation Rules:**
- `userId`: Must reference an existing `User`
- `addressId`: Must reference an existing `Address` owned by the user
- `total`: Must be > 0
- `paymentMethod`: Must be `COD` or `STRIPE`
- `status`: Starts as `ORDER_PLACED`; transitions are client-side validated
- `coupon`: If `isCouponUsed` is true, should contain coupon details as JSON

**Status Transitions (Client-Side Validation):**
```
ORDER_PLACED → PROCESSING → SHIPPED → DELIVERED
```

**Relations:**
- Many-to-one with `User` as `BuyerRelation` (fields: `userId`)
- Many-to-one with `Address` (fields: `addressId`)
- One-to-many with `OrderItem` (cascade delete on order deletion)

**Example:**
```javascript
const order = await prisma.order.create({
  data: {
    total: 1200,
    userId: "user_123",
    addressId: "addr_456",
    isPaid: true,
    paymentMethod: "STRIPE",
    isCouponUsed: false,
    coupon: JSON.stringify({}),
    orderItems: {
      create: [
        { productId: "prod_1", quantity: 2, price: 400 },
        { productId: "prod_2", quantity: 1, price: 400 }
      ]
    }
  },
  include: {
    orderItems: { include: { product: true } },
    user: true,
    address: true
  }
});

// Update order status
const updated = await prisma.order.update({
  where: { id: "order_1" },
  data: { status: "PROCESSING" }
});
```

### OrderItem Model

Line item within an order; uses composite primary key on `orderId` + `productId`.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `orderId` | String | @relation, part of @@id | Foreign key to `Order` |
| `productId` | String | @relation, part of @@id | Foreign key to `Product` |
| `quantity` | Int | Required | Number of units ordered |
| `price` | Float | Required | Unit price at time of order |

**Composite Primary Key:**
```prisma
@@id([orderId, productId])
```
One order can have at most one line item per product.

**Required Fields for Creating an OrderItem:**
```
orderId, productId, quantity, price
```

**Validation Rules:**
- `orderId`: Must reference an existing `Order`
- `productId`: Must reference an existing `Product`
- `quantity`: Must be > 0 (integer)
- `price`: Should be the historical price at time of order, not current product price

**Relations:**
- Many-to-one with `Order` (cascade delete on order deletion)
- Many-to-one with `Product`

**Example:**
```javascript
// Create via nested order creation
const order = await prisma.order.create({
  data: {
    total: 1200,
    userId: "user_1",
    addressId: "addr_1",
    paymentMethod: "COD",
    orderItems: {
      create: [
        { productId: "prod_1", quantity: 2, price: 400 },
        { productId: "prod_2", quantity: 1, price: 400 }
      ]
    }
  }
});

// Query order items
const items = await prisma.orderItem.findMany({
  where: { orderId: "order_1" },
  include: { product: true }
});
```

**Notes:**
- OrderItems must be created as nested records within an Order
- Prices are snapshots at purchase time; don't reflect current product prices
- Cascade deletion ensures order deletion removes all associated items

---

## Address Model

Represents delivery addresses for users.

**Fields:**

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `id` | String | uuid v4 | @id, @default(uuid(4)) | Auto-generated address identifier |
| `userId` | String | — | @relation | Foreign key to `User` |
| `name` | String | — | Required | Recipient name |
| `mobile` | String | — | Required | Contact phone number |
| `pincode` | String | — | Required | Postal code |
| `addressLine1` | String? | null | Optional | Street address (line 1) |
| `addressLine2` | String? | null | Optional | Street address (line 2) |
| `landmark` | String? | null | Optional | Nearby landmark for delivery |
| `city` | String | — | Required | City name |
| `state` | String | — | Required | State name |
| `createdAt` | DateTime | now() | — | Creation timestamp |

**Required Fields for Creating an Address:**
```
userId, name, mobile, pincode, city, state
```
(addressLine1, addressLine2, landmark are optional)

**Validation Rules:**
- `userId`: Must reference an existing `User`
- `name`: Non-empty string
- `mobile`: Non-empty string (phone number format recommended)
- `pincode`: Non-empty string (format validation recommended, typically 6 digits in India)
- `city`: Non-empty string
- `state`: Non-empty string
- `addressLine1`, `addressLine2`: Optional but recommended for complete delivery address

**Relations:**
- Many-to-one with `User` (cascade delete on user deletion)
- One-to-many with `Order` (orders shipped to this address)

**Example:**
```javascript
const address = await prisma.address.create({
  data: {
    userId: "user_123",
    name: "John Doe",
    mobile: "+919876543210",
    pincode: "110001",
    addressLine1: "123 Main Street",
    addressLine2: "Apt 4B",
    landmark: "Near the park",
    city: "Delhi",
    state: "Delhi"
  }
});

// Get user's addresses
const addresses = await prisma.address.findMany({
  where: { userId: "user_123" },
  orderBy: { createdAt: "desc" }
});

// Delete address
await prisma.address.delete({
  where: { id: "addr_1" }
});
```

**Notes:**
- Addresses cascade delete when the user is deleted
- No update timestamp; only tracks creation time
- Multiple addresses per user are supported for flexible delivery options
- Addresses cannot be deleted if associated orders exist (client-side validation recommended)

---

## Rating Model

Product reviews and ratings submitted by users after purchase.

**Fields:**

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `id` | String | uuid v4 | @id, @default(uuid(4)) | Auto-generated rating identifier |
| `rating` | Int | — | Required | Star rating (typically 1-5) |
| `review` | String | — | Required | Review text |
| `userId` | String | — | @relation | Foreign key to `User` |
| `productId` | String | — | @relation | Foreign key to `Product` |
| `orderId` | String | — | Required | Associated order reference |
| `createdAt` | DateTime | now() | — | Creation timestamp |
| `updatedAt` | DateTime | — | @updatedAt | Last update timestamp |

**Unique Constraint:**
```prisma
@@unique([userId, productId, orderId])
```
A user can submit only one rating per product per order (prevents duplicate reviews).

**Required Fields for Creating a Rating:**
```
rating, review, userId, productId
```
(Note: `orderId` is also required in the schema but should be validated against the order's items)

**Validation Rules:**
- `rating`: Integer value (recommended: 1-5 range)
- `review`: Non-empty string
- `userId`: Must reference an existing `User`
- `productId`: Must reference an existing `Product`
- `orderId`: Should reference an `Order` that contains an `OrderItem` for this product
- Unique constraint prevents duplicate ratings from same user for same product in same order

**Relations:**
- Many-to-one with `User` (cascade delete on user deletion)
- Many-to-one with `Product` (cascade delete on product deletion)

**Example:**
```javascript
const rating = await prisma.rating.create({
  data: {
    rating: 4,
    review: "Great quality seeds, fast delivery!",
    userId: "user_123",
    productId: "prod_456",
    orderId: "order_789"
  },
  include: {
    user: { select: { id: true, name: true, image: true } },
    product: true
  }
});

// Get product ratings
const ratings = await prisma.rating.findMany({
  where: { productId: "prod_456" },
  include: { user: { select: { name: true, image: true } } },
  orderBy: { createdAt: "desc" }
});

// Calculate average rating
const avgRating = await prisma.rating.aggregate({
  where: { productId: "prod_456" },
  _avg: { rating: true },
  _count: true
});
```

**Notes:**
- Cascade deletes ensure ratings are removed when user or product is deleted
- Proof of purchase is enforced via `orderId` reference
- Consider adding client-side validation that user purchased the product
- Rating updates should preserve the original creation timestamp intent

---

## Coupon Model

Promotional discount codes with expiration and eligibility conditions.

**Fields:**

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `code` | String | — | @id | Unique coupon code (primary key) |
| `description` | String | — | Required | Coupon details/description |
| `discount` | Float | — | Required | Discount amount or percentage |
| `forNewUser` | Boolean | — | Required | Eligible for new users only |
| `forMember` | Boolean | false | — | Eligible for member users |
| `isPublic` | Boolean | — | Required | Public vs. private coupon |
| `expiresAt` | DateTime | — | Required | Expiration date/time |
| `createdAt` | DateTime | now() | — | Creation timestamp |

**Required Fields for Creating a Coupon:**
```
code, description, discount, forNewUser, isPublic, expiresAt
```

**Validation Rules:**
- `code`: Non-empty string; used as primary key (must be unique)
- `description`: Non-empty string
- `discount`: Should be > 0 (currency-agnostic; logic in route handler)
- `forNewUser`: Boolean flag for eligibility
- `forMember`: Boolean flag for eligibility
- `isPublic`: Boolean flag for visibility
- `expiresAt`: Must be in the future or currently valid

**Relations:**
- None direct; coupon data stored as JSON in `Order.coupon`

**Example:**
```javascript
const coupon = await prisma.coupon.create({
  data: {
    code: "SUMMER20",
    description: "20% off on first purchase",
    discount: 20,
    forNewUser: true,
    forMember: false,
    isPublic: true,
    expiresAt: new Date("2024-12-31")
  }
});

// Find valid coupon
const coupon = await prisma.coupon.findUnique({
  where: { code: "SUMMER20" }
});

if (coupon && coupon.expiresAt > new Date()) {
  // Apply coupon
}

// List active coupons for public display
const activeCoupons = await prisma.coupon.findMany({
  where: {
    isPublic: true,
    expiresAt: { gt: new Date() }
  }
});
```

**Notes:**
- Coupon data is stored as JSON in `Order.coupon` on application
- No referential integrity enforced; coupon code is just a string reference in orders
- Expiration validation should be done in route handlers
- Eligibility rules (forNewUser, forMember) are enforced client-side

---

## OTP Models

SMS/WhatsApp OTP authentication flow for login (whapi.cloud integration).

### OtpTemplate Model

Message templates for OTP delivery.

**Fields:**

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `id` | String | uuid v4 | @id, @default(uuid(4)) | Auto-generated template identifier |
| `key` | String | — | @unique, Required | Template key/identifier |
| `body` | String | — | Required | Message template body with placeholders |
| `createdAt` | DateTime | now() | — | Creation timestamp |
| `updatedAt` | DateTime | — | @updatedAt | Last update timestamp |

**Required Fields for Creating an OtpTemplate:**
```
key, body
```

**Auto-Creation:**
- Templates are auto-created on first use by the OTP flow (`POST /api/sms/send`)
- Typically hardcoded key: `"OtpTemplate"`

**Example:**
```javascript
const template = await prisma.otpTemplate.create({
  data: {
    key: "OtpTemplate",
    body: "Your Mangal Superfoods OTP is: {{otp}}. Valid for 5 minutes."
  }
});

// Update template
const updated = await prisma.otpTemplate.update({
  where: { key: "OtpTemplate" },
  data: { body: "New message template..." }
});
```

### OtpCode Model

One-time password records for login flow.

**Fields:**

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `id` | String | uuid v4 | @id, @default(uuid(4)) | Auto-generated OTP record identifier |
| `mobile` | String | — | Required, @index | Phone number (indexed for lookup) |
| `code` | String | — | Required | 4-digit OTP value |
| `expiresAt` | DateTime | — | Required | OTP expiration time (5 minutes) |
| `used` | Boolean | false | — | OTP usage flag |
| `createdAt` | DateTime | now() | — | Creation timestamp |

**Indexes:**
```prisma
@@index([mobile])
```
Mobile number is indexed for fast OTP lookup during verification.

**Required Fields for Creating an OtpCode:**
```
mobile, code, expiresAt
```

**Validation Rules:**
- `mobile`: Non-empty phone number string
- `code`: 4-digit string (generated by sms.js)
- `expiresAt`: Typically 5 minutes from creation: `new Date(Date.now() + 5 * 60 * 1000)`
- `used`: Starts as false; set to true on successful verification

**OTP Lifecycle:**

1. **Send** (`POST /api/sms/send`):
   - Generate 4-digit OTP
   - Create `OtpCode` record with 5-minute expiry
   - Post templated message to whapi.cloud API
   
2. **Verify** (`POST /api/sms/verify`):
   - Find matching, unused, unexpired `OtpCode`
   - Mark as used on success
   - Auto-create or login user

**Example:**
```javascript
// Create OTP
const otp = await prisma.otpCode.create({
  data: {
    mobile: "+919876543210",
    code: "1234",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  }
});

// Verify OTP
const verified = await prisma.otpCode.findFirst({
  where: {
    mobile: "+919876543210",
    code: "1234",
    used: false,
    expiresAt: { gt: new Date() }
  }
});

if (verified) {
  await prisma.otpCode.update({
    where: { id: verified.id },
    data: { used: true }
  });
  // Proceed with login/user creation
}

// Clean up expired OTPs (optional periodic maintenance)
await prisma.otpCode.deleteMany({
  where: { expiresAt: { lt: new Date() } }
});
```

**Notes:**
- OTPs should not be stored in plain text in production (hash before storage recommended)
- Expiration validation is critical; expired OTPs should be rejected
- Mobile index ensures fast lookups even with high OTP volume
- No direct relations; completely self-contained

---

## Enums Reference

### UserRole

Controls user permissions and access levels.

```prisma
enum UserRole {
  CUSTOMER    # Regular customer; can purchase and review
  ADMIN       # Administrative access; manages products/orders/coupons
  SELLER      # Vendor role; manages own products
}
```

**Default:** `CUSTOMER`

**Notes:**
- Role checks are enforced **client-side only** (no HTTP-layer authentication middleware)
- All routes are unprotected at the HTTP layer
- No server-side authorization enforcement

### OrderStatus

Linear progression for order lifecycle.

```prisma
enum OrderStatus {
  ORDER_PLACED   # Initial state; order just created
  PROCESSING     # Being prepared for shipment
  SHIPPED        # In transit to customer
  DELIVERED      # Successfully delivered
}
```

**Default:** `ORDER_PLACED`

**Status Transitions (Client-Side Validation):**
```
ORDER_PLACED → PROCESSING → SHIPPED → DELIVERED
```

**Notes:**
- Forward-only progression (cannot go backwards)
- Updated via `PUT /:id` endpoint
- Validation enforced in route handler, not at DB level
- Each transition typically corresponds to a business event

### PaymentMethod

Supported payment methods for orders.

```prisma
enum PaymentMethod {
  COD      # Cash on Delivery; payment at delivery time
  STRIPE   # Online payment via Stripe
}
```

**Default:** None (must be specified)

**Notes:**
- No other payment methods currently supported
- Stripe implementation details are in the frontend
- COD orders have `isPaid: false` initially; marked paid at delivery

---

## Relations Overview

### Relationship Diagram

```
User (id: string)
├── ←(userId)→ Order (cascade delete: No - orders orphaned when user deleted)
├── ←(userId)→ Rating (cascade delete: Yes - ratings deleted with user)
├── ←(userId)→ Address (cascade delete: Yes - addresses deleted with user)

Product (id: uuid v4)
├── ←(productId)→ OrderItem (cascade delete: No - item references remain)
├── ←(productId)→ Rating (cascade delete: Yes - ratings deleted with product)

Order (id: uuid v4)
├── →(userId) User (required)
├── →(addressId) Address (required)
├── ←(orderId)→ OrderItem (cascade delete: Yes - items deleted with order)

OrderItem (orderId, productId)
├── →(orderId) Order (cascade delete: Yes)
└── →(productId) Product (no cascade)

Address (id: uuid v4)
├── →(userId) User (cascade delete: Yes)
└── ←(addressId)→ Order (no cascade - order references remain)

Rating (id: uuid v4)
├── →(userId) User (cascade delete: Yes)
└── →(productId) Product (cascade delete: Yes)

Coupon (code: string)
└── Referenced in Order.coupon (JSON) - no database relation

OtpTemplate (id: uuid v4)
└── Message template (standalone)

OtpCode (id: uuid v4)
└── One-time use (standalone, indexed on mobile)
```

### Detailed Relations

**User → Order**
- Type: One-to-many (`User.buyerOrders`)
- Foreign Key: `Order.userId` → `User.id`
- Cascade: No (orphaned orders when user deleted - consider migration)
- Purpose: Track all orders by a customer

**User → Rating**
- Type: One-to-many (`User.ratings`)
- Foreign Key: `Rating.userId` → `User.id`
- Cascade: Yes (ratings deleted when user deleted)
- Purpose: Track all reviews by a user

**User → Address**
- Type: One-to-many (`User.Address`)
- Foreign Key: `Address.userId` → `User.id`
- Cascade: Yes (addresses deleted when user deleted)
- Purpose: Store multiple delivery addresses per user

**Product → OrderItem**
- Type: One-to-many (`Product.orderItems`)
- Foreign Key: `OrderItem.productId` → `Product.id`
- Cascade: No (order items preserved when product deleted)
- Purpose: Track all purchases of a product

**Product → Rating**
- Type: One-to-many (`Product.rating`)
- Foreign Key: `Rating.productId` → `Product.id`
- Cascade: Yes (ratings deleted when product deleted)
- Purpose: Display reviews on product page

**Order → OrderItem**
- Type: One-to-many (`Order.orderItems`)
- Foreign Key: `OrderItem.orderId` → `Order.id`
- Cascade: Yes (items deleted when order deleted)
- Purpose: Store line items for an order

**Order → Address**
- Type: Many-to-one (`Order.address`)
- Foreign Key: `Order.addressId` → `Address.id`
- Cascade: No (orders not deleted when address deleted)
- Purpose: Delivery address for this order

**Address → User**
- Type: Many-to-one (`Address.user`)
- Foreign Key: `Address.userId` → `User.id`
- Cascade: Yes (addresses deleted when user deleted)
- Purpose: Associate address with user

**OrderItem → Product**
- Type: Many-to-one (`OrderItem.product`)
- Foreign Key: `OrderItem.productId` → `Product.id`
- Cascade: No
- Purpose: Reference product details for order item

**Rating → User**
- Type: Many-to-one (`Rating.user`)
- Foreign Key: `Rating.userId` → `User.id`
- Cascade: Yes (ratings deleted when user deleted)
- Purpose: Author of review

**Rating → Product**
- Type: Many-to-one (`Rating.product`)
- Foreign Key: `Rating.productId` → `Product.id`
- Cascade: Yes (ratings deleted when product deleted)
- Purpose: Product being reviewed

---

## Query Examples

### User Queries

**Get user with all relations:**
```javascript
const user = await prisma.user.findUnique({
  where: { id: "user_1" },
  include: {
    ratings: { include: { product: true } },
    Address: true,
    buyerOrders: {
      include: { orderItems: { include: { product: true } } }
    }
  }
});
```

**Get user by mobile (for OTP login):**
```javascript
const user = await prisma.user.findUnique({
  where: { mobile: "+919876543210" }
});
```

**Create user with cart:**
```javascript
const user = await prisma.user.create({
  data: {
    id: "user_123",
    name: "John Doe",
    image: "https://example.com/avatar.jpg",
    cart: JSON.stringify({ items: [], total: 0 }),
    mobile: "+919876543210"
  }
});
```

### Product Queries

**Get product with all details:**
```javascript
const product = await prisma.product.findUnique({
  where: { id: "prod_1" },
  include: {
    rating: {
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: "desc" }
    },
    orderItems: { include: { order: true } }
  }
});
```

**Get all products with average rating:**
```javascript
const products = await prisma.product.findMany({
  include: {
    rating: { select: { rating: true } }
  }
});

// Calculate averages in app
products = products.map(p => ({
  ...p,
  avgRating: p.rating.length > 0
    ? p.rating.reduce((sum, r) => sum + r.rating, 0) / p.rating.length
    : 0
}));
```

**Get in-stock products by category:**
```javascript
const products = await prisma.product.findMany({
  where: {
    inStock: true,
    category: "Grains"
  },
  include: { rating: { select: { rating: true } } }
});
```

**Prevent product deletion if it has orders:**
```javascript
const hasOrders = await prisma.orderItem.findFirst({
  where: { productId: "prod_1" }
});

if (hasOrders) {
  throw new Error("Cannot delete product with existing orders");
}

await prisma.product.delete({
  where: { id: "prod_1" }
});
```

### Order Queries

**Get order with all details:**
```javascript
const order = await prisma.order.findUnique({
  where: { id: "order_1" },
  include: {
    user: true,
    address: true,
    orderItems: {
      include: { product: true }
    }
  }
});
```

**Get user's orders:**
```javascript
const userOrders = await prisma.order.findMany({
  where: { userId: "user_1" },
  include: {
    orderItems: { include: { product: true } },
    address: true
  },
  orderBy: { createdAt: "desc" }
});
```

**Filter orders by status:**
```javascript
const shippedOrders = await prisma.order.findMany({
  where: {
    status: "SHIPPED"
  },
  include: { user: true, address: true }
});
```

**Create order with nested items:**
```javascript
const order = await prisma.order.create({
  data: {
    total: 1200,
    userId: "user_1",
    addressId: "addr_1",
    paymentMethod: "COD",
    isPaid: false,
    isCouponUsed: false,
    coupon: JSON.stringify({}),
    orderItems: {
      create: [
        { productId: "prod_1", quantity: 2, price: 400 },
        { productId: "prod_2", quantity: 1, price: 400 }
      ]
    }
  },
  include: { orderItems: { include: { product: true } } }
});
```

**Update order status:**
```javascript
const updated = await prisma.order.update({
  where: { id: "order_1" },
  data: { status: "PROCESSING" }
});
```

### Address Queries

**Get user's addresses:**
```javascript
const addresses = await prisma.address.findMany({
  where: { userId: "user_1" },
  orderBy: { createdAt: "desc" }
});
```

**Create address:**
```javascript
const address = await prisma.address.create({
  data: {
    userId: "user_1",
    name: "John Doe",
    mobile: "9876543210",
    pincode: "110001",
    addressLine1: "123 Main St",
    city: "Delhi",
    state: "Delhi"
  }
});
```

### Rating Queries

**Get product ratings:**
```javascript
const ratings = await prisma.rating.findMany({
  where: { productId: "prod_1" },
  include: {
    user: { select: { id: true, name: true, image: true } }
  },
  orderBy: { createdAt: "desc" }
});
```

**Calculate average rating:**
```javascript
const stats = await prisma.rating.aggregate({
  where: { productId: "prod_1" },
  _avg: { rating: true },
  _count: true
});

console.log(`${stats._count} reviews, avg rating: ${stats._avg.rating.toFixed(1)}`);
```

**Check if user can rate (user made purchase):**
```javascript
const hasUserBoughtProduct = await prisma.orderItem.findFirst({
  where: {
    productId: "prod_1",
    order: { userId: "user_1" }
  }
});

const canRate = hasUserBoughtProduct !== null;
```

**Create rating (proof of purchase via orderId):**
```javascript
const rating = await prisma.rating.create({
  data: {
    rating: 5,
    review: "Excellent product!",
    userId: "user_1",
    productId: "prod_1",
    orderId: "order_1"
  }
});
```

### Coupon Queries

**Find active coupons:**
```javascript
const activeCoupons = await prisma.coupon.findMany({
  where: {
    isPublic: true,
    expiresAt: { gt: new Date() }
  }
});
```

**Validate coupon before applying:**
```javascript
const coupon = await prisma.coupon.findUnique({
  where: { code: "SUMMER20" }
});

if (!coupon || coupon.expiresAt <= new Date()) {
  throw new Error("Invalid or expired coupon");
}
```

### OTP Queries

**Create and send OTP:**
```javascript
const otp = await prisma.otpCode.create({
  data: {
    mobile: "+919876543210",
    code: "1234",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  }
});

// Send via whapi.cloud...
```

**Verify OTP:**
```javascript
const otpRecord = await prisma.otpCode.findFirst({
  where: {
    mobile: "+919876543210",
    code: "1234",
    used: false,
    expiresAt: { gt: new Date() }
  }
});

if (otpRecord) {
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { used: true }
  });
  // Login successful
} else {
  throw new Error("Invalid or expired OTP");
}
```

---

## Cascade Deletes

Understanding cascade delete behavior is critical for data integrity.

### Cascade Delete Rules

**User Deletion:**
- Deletes all `Address` records where `userId` matches (CASCADE)
- Deletes all `Rating` records where `userId` matches (CASCADE)
- **Does NOT delete** `Order` records (ORPHANED) - orders remain but user is gone
- **Note:** Consider adding server-side cascade logic for orders, or migrate to SET NULL

**Product Deletion:**
- Deletes all `Rating` records where `productId` matches (CASCADE)
- **Does NOT delete** `OrderItem` records (ORPHANED) - purchase history preserved
- Route handler prevents deletion if `OrderItem` exists (best practice)

**Order Deletion:**
- Deletes all `OrderItem` records where `orderId` matches (CASCADE)
- **Does NOT delete** related `User` or `Address`

**Address Deletion:**
- **Does NOT delete** `Order` records that reference it
- Orders keep address ID; consider archiving address data instead

### Example: Handling Cascade Deletes

**Safe user deletion with order handling:**
```javascript
async function deleteUser(userId) {
  // Find all user's orders
  const userOrders = await prisma.order.findMany({
    where: { userId }
  });

  if (userOrders.length > 0) {
    // Option 1: Prevent deletion
    throw new Error("Cannot delete user with existing orders");
    
    // Option 2: Archive orders (update userId to null)
    // await prisma.order.updateMany({
    //   where: { userId },
    //   data: { userId: null }
    // });
  }

  // Now safe to delete user
  // This cascades: addresses and ratings deleted automatically
  await prisma.user.delete({
    where: { id: userId }
  });
}
```

**Safe product deletion with order history:**
```javascript
async function deleteProduct(productId) {
  // Check if product has any orders
  const hasOrders = await prisma.orderItem.findFirst({
    where: { productId }
  });

  if (hasOrders) {
    throw new Error("Cannot delete product with purchase history");
  }

  // Safe to delete
  // This cascades: ratings deleted automatically
  await prisma.product.delete({
    where: { id: productId }
  });
}
```

---

## Migrations

Run migrations to set up the database:

```bash
# Create and apply migrations
npm run prisma:migrate:dev --name init

# Apply migrations in production
npm run prisma:migrate:deploy

# Generate Prisma client after schema changes
npm run prisma:generate

# Format schema
npm run prisma:format

# Push schema changes without migration
npm run prisma:db:push

# Introspect existing database
npm run prisma:db:pull
```

---

## Key Constraints & Validation

### Uniqueness Constraints

| Model | Field(s) | Scope | Enforcement |
|-------|---------|-------|-------------|
| `User` | `mobile` | Global | Database unique constraint |
| `OrderItem` | `[orderId, productId]` | Global | Composite primary key |
| `Rating` | `[userId, productId, orderId]` | Global | Unique constraint |
| `OtpTemplate` | `key` | Global | Database unique constraint |

### Foreign Key Constraints

All foreign keys have referential integrity enforced at the database level:
- `Order.userId` → `User.id`
- `Order.addressId` → `Address.id`
- `OrderItem.orderId` → `Order.id`
- `OrderItem.productId` → `Product.id`
- `Rating.userId` → `User.id`
- `Rating.productId` → `Product.id`
- `Address.userId` → `User.id`
- `OtpCode.mobile` (indexed, not foreign key)

### Default Values

| Model.Field | Default | Type |
|-------------|---------|------|
| `User.role` | `CUSTOMER` | UserRole |
| `User.cart` | `{}` | JSON |
| `User.inactive` | false | Boolean |
| `User.verifiedEmail` | false | Boolean |
| `Product.inStock` | true | Boolean |
| `Order.status` | `ORDER_PLACED` | OrderStatus |
| `Order.isPaid` | false | Boolean |
| `Order.isCouponUsed` | false | Boolean |
| `Order.coupon` | `{}` | JSON |
| `OtpCode.used` | false | Boolean |
| `Coupon.forMember` | false | Boolean |

### Timestamp Behavior

| Model | createdAt | updatedAt |
|-------|-----------|-----------|
| `User` | @default(now()) | @updatedAt |
| `Product` | @default(now()) | @updatedAt |
| `Order` | @default(now()) | @updatedAt |
| `Rating` | @default(now()) | @updatedAt |
| `Address` | @default(now()) | — (no update) |
| `Coupon` | @default(now()) | — (no update) |
| `OtpTemplate` | @default(now()) | @updatedAt |
| `OtpCode` | @default(now()) | — (no update) |

---

## Common Patterns & Best Practices

### 1. Prevent Orphaned Data
Always check for dependent records before deletion:
```javascript
const hasOrders = await prisma.orderItem.findFirst({
  where: { productId }
});
if (hasOrders) throw new Error("Product has order history");
```

### 2. Atomicity with Nested Creates
Use nested creates for transactional consistency:
```javascript
// All OrderItems created atomically with Order
const order = await prisma.order.create({
  data: {
    total: 100,
    userId: "user_1",
    addressId: "addr_1",
    paymentMethod: "COD",
    orderItems: { create: [...] }
  },
  include: { orderItems: true }
});
```

### 3. JSON Field Handling
Always use JSON.stringify/JSON.parse for JSON fields:
```javascript
// Save
data: { cart: JSON.stringify({ items: [...] }) }

// Retrieve
const cart = JSON.parse(user.cart);
```

### 4. Index Usage
Leverage indexes for performance:
```javascript
// OtpCode has @@index([mobile])
const otp = await prisma.otpCode.findFirst({
  where: { mobile: "+919876543210" }  // Fast: uses index
});
```

### 5. Composite Key Queries
For OrderItem with composite primary key:
```javascript
const item = await prisma.orderItem.findUnique({
  where: {
    orderId_productId: {
      orderId: "order_1",
      productId: "prod_1"
    }
  }
});
```

---

## Database Configuration

**Database:** PostgreSQL  
**ORM:** Prisma  
**Adapter:** `@prisma/adapter-pg` with `pg.Pool` for connection pooling  
**Connection Pooling:** Enabled via driver adapter (production-ready)  
**Memoization:** Prisma client memoized on `global.prisma` in dev mode for `--watch` compatibility  

**Connection String:** Via `DATABASE_URL` environment variable  
**Pool Configuration:** Via `pg.Pool` in `src/lib/prisma.js`

---

**Last Updated:** 2026-08-08  
**Schema Version:** Current  
**Prisma Version:** 7.6.0+  
**PostgreSQL Version:** 12+
