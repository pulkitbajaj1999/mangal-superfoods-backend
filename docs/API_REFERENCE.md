# API Reference

Complete endpoint documentation for the Mangal Superfoods backend API. All endpoints are prefixed with `/api`.

**Base URL:** `http://localhost:4000/api`  
**Content-Type:** `application/json` (except file uploads, which use `multipart/form-data`)

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Products](#products)
4. [Orders](#orders)
5. [Addresses](#addresses)
6. [Ratings](#ratings)
7. [Coupons](#coupons)
8. [SMS / OTP](#sms--otp)
9. [Health Check](#health-check)
10. [Common Patterns](#common-patterns)

---

## Authentication

### POST `/api/auth/login`

Mobile and password-based login for users.

**Request Body:**
```json
{
  "mobile": "9876543210",
  "password": "your_password"
}
```

**Validation Rules:**
- `mobile`: Required. Must be exactly 10 digits (numeric string)
- `password`: Required. Non-empty string

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_id_123",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://example.com/image.jpg",
    "cart": {},
    "role": "CUSTOMER",
    "mobile": "9876543210",
    "firstName": "John",
    "lastName": "Doe",
    "inactive": false,
    "verifiedEmail": false,
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400` - Invalid mobile format or missing password: `{ "error": "Invalid mobile or password" }`
- `404` - User not found: `{ "error": "User not found" }`
- `401` - Invalid credentials: `{ "error": "Invalid credentials" }`
- `500` - Internal server error: `{ "error": "Internal server error" }`

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210", "password": "secure_password"}'
```

---

## Users

### GET `/api/users`

Fetch all users or search by mobile number.

**Query Parameters:**
- `mobile` (optional): Search by mobile number (10 digits)

**Success Response (200):**
```json
[
  {
    "id": "user_id_1",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://example.com/image.jpg",
    "cart": {"item1": {"quantity": 2, "price": 100}},
    "role": "CUSTOMER",
    "mobile": "9876543210",
    "firstName": "John",
    "lastName": "Doe",
    "inactive": false,
    "verifiedEmail": false,
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:30:00Z"
  }
]
```

**Error Responses:**
- `404` - User not found (when searching by mobile): `{ "error": "User not found" }`
- `500` - Failed to fetch users: `{ "error": "Failed to fetch users" }`

**cURL Examples:**
```bash
# Fetch all users
curl http://localhost:4000/api/users

# Search by mobile
curl "http://localhost:4000/api/users?mobile=9876543210"
```

---

### POST `/api/users`

Create a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "image": "https://example.com/image.jpg",
  "mobile": "9876543210",
  "password": "secure_password",
  "cart": {},
  "role": "CUSTOMER"
}
```

**Validation Rules:**
- `id`: Optional. Unique uuid v4 string; generated automatically when omitted
- `name`: Required. Non-empty string
- `email`: Optional. Valid email format
- `image`: Optional. URL string
- `mobile`: Optional. Must be exactly 10 digits (unique if provided)
- `password`: Optional. Will be hashed with scrypt
- `cart`: Optional. Valid JSON object (defaults to `{}`)
- `role`: Optional. One of: `CUSTOMER`, `ADMIN`, `SELLER` (defaults to `CUSTOMER`)

**Success Response (201):**
```json
{
  "id": "b0d9f2ce-0e1c-4a2b-9d3f-6a5f2c1e7d80",
  "name": "John Doe",
  "email": "john@example.com",
  "image": "https://example.com/image.jpg",
  "cart": {},
  "role": "CUSTOMER",
  "mobile": "9876543210",
  "firstName": null,
  "lastName": null,
  "inactive": false,
  "verifiedEmail": false,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400` - Missing required fields: `{ "error": "Missing required fields" }`
- `409` - Mobile already registered: `{ "error": "Mobile number already registered" }`
- `500` - Failed to create user: `{ "error": "Failed to create user" }`

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@yopmail.com",
    "mobile": "9876543210",
    "password": "secure_password"
  }'
```

---

### PUT `/api/users`

Update user information (name and/or email).

**Request Body:**
```json
{
  "id": "user_id_123",
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Validation Rules:**
- `id`: Required. Must be ID of existing user
- `name`: Optional. Non-empty string
- `email`: Optional. Valid email format

**Success Response (200):**
```json
{
  "id": "user_id_123",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "image": "https://example.com/image.jpg",
  "cart": {},
  "role": "CUSTOMER",
  "mobile": "9876543210",
  "firstName": "Jane",
  "lastName": "Doe",
  "inactive": false,
  "verifiedEmail": false,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-16T14:45:00Z"
}
```

**Error Responses:**
- `400` - User ID required: `{ "error": "User ID is required" }`
- `404` - User not found: `{ "error": "User not found" }`
- `500` - Failed to update user: `{ "error": "Failed to update user" }`

**cURL Example:**
```bash
curl -X PUT http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"id": "user_id_123", "name": "Jane Doe", "email": "jane@example.com"}'
```

---

## Products

### GET `/api/products`

Fetch all products with ratings and order items.

**Query Parameters:** None

**Success Response (200):**
```json
[
  {
    "id": "product_id_1",
    "name": "Organic Quinoa",
    "description": "Premium organic quinoa seeds",
    "mrp": 500,
    "price": 399,
    "images": [
      "http://localhost:4566/bucket-name/image1.jpg",
      "http://localhost:4566/bucket-name/image2.jpg"
    ],
    "category": "Grains",
    "inStock": true,
    "createdAt": "2026-01-10T08:00:00Z",
    "updatedAt": "2026-01-15T10:30:00Z",
    "rating": [],
    "orderItems": []
  }
]
```

**Error Responses:**
- `500` - Failed to fetch: `{ "error": "Failed to fetch products" }`

**cURL Example:**
```bash
curl http://localhost:4000/api/products
```

---

### GET `/api/products/:id`

Fetch a specific product by ID.

**URL Parameters:**
- `id`: Required. Product ID (CUID format)

**Success Response (200):** Same structure as above

**Error Responses:**
- `404` - Product not found: `{ "error": "Product not found" }`
- `500` - Failed to fetch: `{ "error": "Failed to fetch product" }`

**cURL Example:**
```bash
curl http://localhost:4000/api/products/product_id_1
```

---

### POST `/api/products`

Create a new product with images. Uploads images to S3-compatible storage.

**Request Body (Multipart Form Data):**
- `name` (text): Required. Product name
- `description` (text): Required. Product description
- `mrp` (text): Required. Maximum retail price (numeric string)
- `price` (text): Required. Selling price (numeric string)
- `category` (text): Required. Product category
- `inStock` (text): Optional. `"true"` or `"false"` (defaults to `true`)
- `images` (files): Required. At least one image file

**Validation Rules:**
- `name`, `description`, `category`: Required, non-empty strings
- `mrp`, `price`: Required, valid numeric values
- At least 1 image file required

**Success Response (201):**
```json
{
  "id": "uuid_v4_generated_id",
  "name": "Organic Quinoa",
  "description": "Premium organic quinoa seeds",
  "mrp": 500,
  "price": 399,
  "images": ["http://localhost:4566/bucket-name/1705321200000-quinoa.jpg"],
  "category": "Grains",
  "inStock": true,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z",
  "rating": []
}
```

**Error Responses:**
- `400` - Missing fields: `{ "error": "Missing required fields: name, description, mrp, price, category" }`
- `400` - No images: `{ "error": "At least one image is required" }`
- `500` - S3 upload failed: `{ "error": "Failed to upload image to storage" }`
- `500` - Failed to create: `{ "error": "Failed to create product" }`

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/products \
  -F "name=Organic Quinoa" \
  -F "description=Premium organic quinoa seeds" \
  -F "mrp=500" \
  -F "price=399" \
  -F "category=Grains" \
  -F "inStock=true" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

---

### PUT `/api/products/:id`

Update product details and/or images. Merges existing images with newly uploaded ones.

**URL Parameters:**
- `id`: Required. Product ID

**Request Body (Multipart Form Data):**
- `name` (text): Optional. Product name
- `description` (text): Optional. Product description
- `mrp` (text): Optional. Maximum retail price
- `price` (text): Optional. Selling price
- `category` (text): Optional. Product category
- `inStock` (text): Optional. `"true"` or `"false"`
- `existingImages` (text): Optional. JSON array string of URLs to keep
- `images` (files): Optional. New image files

**Success Response (200):**
```json
{
  "id": "product_id_1",
  "name": "Organic Quinoa - Updated",
  "mrp": 550,
  "price": 429,
  "images": [
    "http://localhost:4566/bucket-name/existing-image.jpg",
    "http://localhost:4566/bucket-name/1705321200000-new-image.jpg"
  ],
  "category": "Grains",
  "inStock": true,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-16T14:45:00Z"
}
```

**Error Responses:**
- `500` - Failed to update: `{ "error": "Failed to update product" }`

**cURL Example:**
```bash
curl -X PUT http://localhost:4000/api/products/product_id_1 \
  -F "name=Organic Quinoa - Updated" \
  -F "price=429" \
  -F 'existingImages=["http://localhost:4566/bucket-name/existing-image.jpg"]' \
  -F "images=@/path/to/new-image.jpg"
```

---

### DELETE `/api/products/:id`

Delete a product. Only products with no orders can be deleted.

**URL Parameters:**
- `id`: Required. Product ID

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `404` - Product not found: `{ "error": "Product not found" }`
- `409` - Has existing orders: `{ "error": "Cannot delete product with existing orders" }`
- `500` - Failed to delete: `{ "error": "Failed to delete product" }`

**cURL Example:**
```bash
curl -X DELETE http://localhost:4000/api/products/product_id_1
```

---

## Orders

### GET `/api/orders`

Fetch all orders or filter by user ID.

**Query Parameters:**
- `userId` (optional): Filter orders by user ID

**Success Response (200):**
```json
[
  {
    "id": "order_id_1",
    "total": 798,
    "status": "ORDER_PLACED",
    "userId": "user_1",
    "addressId": "address_1",
    "isPaid": false,
    "paymentMethod": "COD",
    "isCouponUsed": false,
    "coupon": {},
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:30:00Z",
    "user": {},
    "address": {},
    "orderItems": [
      {
        "orderId": "order_id_1",
        "productId": "product_id_1",
        "quantity": 2,
        "price": 399,
        "product": {}
      }
    ]
  }
]
```

**Error Responses:**
- `500` - Failed to fetch: `{ "error": "Failed to fetch orders" }`

**cURL Examples:**
```bash
# Fetch all orders
curl http://localhost:4000/api/orders

# Filter by user ID
curl "http://localhost:4000/api/orders?userId=user_1"
```

---

### POST `/api/orders`

Create a new order with order items.

**Request Body:**
```json
{
  "total": 798,
  "userId": "user_1",
  "addressId": "address_1",
  "paymentMethod": "COD",
  "orderItems": [
    {
      "productId": "product_id_1",
      "quantity": 2,
      "price": 399
    }
  ],
  "isCouponUsed": false,
  "coupon": {}
}
```

**Validation Rules:**
- `total`: Required. Valid numeric value
- `userId`: Required. ID of existing user
- `addressId`: Required. ID of existing address
- `paymentMethod`: Required. `COD` or `STRIPE`
- `orderItems`: Required. Array with at least 1 item
  - `productId`: Required. Existing product ID
  - `quantity`: Required. Positive integer
  - `price`: Required. Valid numeric value
- `isCouponUsed`: Optional. Boolean (defaults to `false`)
- `coupon`: Optional. JSON object (defaults to `{}`)

**Success Response (201):**
```json
{
  "id": "order_id_generated",
  "total": 798,
  "status": "ORDER_PLACED",
  "userId": "user_1",
  "addressId": "address_1",
  "isPaid": false,
  "paymentMethod": "COD",
  "isCouponUsed": false,
  "coupon": {},
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z",
  "orderItems": []
}
```

**Error Responses:**
- `400` - Missing required fields: `{ "error": "Missing required fields" }`
- `500` - Failed to create: `{ "error": "Failed to create order" }`

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "total": 798,
    "userId": "user_1",
    "addressId": "address_1",
    "paymentMethod": "COD",
    "orderItems": [{"productId": "product_id_1", "quantity": 2, "price": 399}]
  }'
```

---

### PUT `/api/orders/:id`

Update order status.

**URL Parameters:**
- `id`: Required. Order ID

**Request Body:**
```json
{
  "status": "PROCESSING"
}
```

**Validation Rules:**
- `status`: Required. One of: `ORDER_PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`

**Success Response (200):**
```json
{
  "id": "order_id_1",
  "total": 798,
  "status": "PROCESSING",
  "userId": "user_1",
  "addressId": "address_1",
  "isPaid": false,
  "paymentMethod": "COD",
  "isCouponUsed": false,
  "coupon": {},
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-16T14:45:00Z",
  "user": {},
  "address": {},
  "orderItems": []
}
```

**Error Responses:**
- `400` - Status required: `{ "error": "Status is required" }`
- `400` - Invalid status: `{ "error": "Invalid status" }`
- `500` - Failed to update: `{ "error": "Failed to update order" }`

**cURL Example:**
```bash
curl -X PUT http://localhost:4000/api/orders/order_id_1 \
  -H "Content-Type: application/json" \
  -d '{"status": "PROCESSING"}'
```

---

## Addresses

### GET `/api/addresses`

Fetch all addresses or filter by user ID.

**Query Parameters:**
- `userId` (optional): Filter addresses by user ID

**Success Response (200):**
```json
[
  {
    "id": "address_id_1",
    "userId": "user_1",
    "name": "John Doe",
    "mobile": "9876543210",
    "pincode": "110001",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "landmark": "Near Metro Station",
    "city": "Delhi",
    "state": "Delhi",
    "createdAt": "2026-01-15T10:30:00Z",
    "user": {}
  }
]
```

**Error Responses:**
- `500` - Failed to fetch: `{ "error": "Failed to fetch addresses" }`

**cURL Examples:**
```bash
curl http://localhost:4000/api/addresses
curl "http://localhost:4000/api/addresses?userId=user_1"
```

---

### POST `/api/addresses`

Create a new address for a user.

**Request Body:**
```json
{
  "userId": "user_1",
  "name": "John Doe",
  "mobile": "9876543210",
  "pincode": "110001",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "landmark": "Near Metro Station",
  "city": "Delhi",
  "state": "Delhi"
}
```

**Validation Rules:**
- `userId`: Required. Existing user ID
- `name`: Required. Non-empty string
- `mobile`: Required. Exactly 10 digits
- `pincode`: Required. Exactly 6 digits
- `addressLine1`: Required. Non-empty string
- `addressLine2`, `landmark`: Optional. Strings
- `city`, `state`: Required. Non-empty strings

**Success Response (201):**
```json
{
  "id": "address_id_generated",
  "userId": "user_1",
  "name": "John Doe",
  "mobile": "9876543210",
  "pincode": "110001",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "landmark": "Near Metro Station",
  "city": "Delhi",
  "state": "Delhi",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400` - Missing required fields: `{ "error": "Missing required fields" }`
- `400` - Invalid mobile: `{ "error": "Invalid mobile format (must be 10 digits)" }`
- `400` - Invalid pincode: `{ "error": "Invalid pincode format (must be 6 digits)" }`
- `404` - User not found: `{ "error": "User not found" }`
- `500` - Failed to create: `{ "error": "Failed to create address" }`

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/addresses \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_1",
    "name": "John Doe",
    "mobile": "9876543210",
    "pincode": "110001",
    "addressLine1": "123 Main Street",
    "city": "Delhi",
    "state": "Delhi"
  }'
```

---

## Ratings

### GET `/api/ratings`

Fetch all ratings or filter by product ID.

**Query Parameters:**
- `productId` (optional): Filter ratings by product ID

**Success Response (200):**
```json
[
  {
    "id": "rating_id_1",
    "rating": 5,
    "review": "Excellent product!",
    "userId": "user_1",
    "productId": "product_id_1",
    "orderId": "order_id_1",
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:30:00Z",
    "user": {
      "id": "user_1",
      "name": "John Doe",
      "image": "https://example.com/image.jpg"
    },
    "product": {}
  }
]
```

**Error Responses:**
- `500` - Failed to fetch: `{ "error": "Failed to fetch ratings" }`

**cURL Examples:**
```bash
curl http://localhost:4000/api/ratings
curl "http://localhost:4000/api/ratings?productId=product_id_1"
```

---

### POST `/api/ratings`

Create a new rating/review for a product.

**Request Body:**
```json
{
  "rating": 5,
  "review": "Excellent product!",
  "userId": "user_1",
  "productId": "product_id_1",
  "orderId": "order_id_1"
}
```

**Validation Rules:**
- `rating`: Required. Integer between 1-5
- `review`: Optional. String (defaults to empty)
- `userId`: Required. Existing user ID
- `productId`: Required. Existing product ID
- `orderId`: Required. Existing order ID
- Unique constraint: userId + productId + orderId must be unique (no duplicate reviews per order)

**Success Response (201):**
```json
{
  "id": "rating_id_generated",
  "rating": 5,
  "review": "Excellent product!",
  "userId": "user_1",
  "productId": "product_id_1",
  "orderId": "order_id_1",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z",
  "user": {
    "id": "user_1",
    "name": "John Doe",
    "image": "https://example.com/image.jpg"
  },
  "product": {}
}
```

**Error Responses:**
- `400` - Missing required fields: `{ "error": "Missing required fields" }`
- `400` - Invalid rating: `{ "error": "Rating must be between 1 and 5" }`
- `404` - Product not found: `{ "error": "Product not found" }`
- `404` - User not found: `{ "error": "User not found" }`
- `409` - Duplicate rating: `{ "error": "You have already rated this product in this order" }`
- `500` - Failed to create: `{ "error": "Failed to create rating" }`

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/ratings \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "review": "Excellent product!",
    "userId": "user_1",
    "productId": "product_id_1",
    "orderId": "order_id_1"
  }'
```

---

## Coupons

### GET `/api/coupons`

Fetch all available coupons.

**Query Parameters:** None

**Success Response (200):**
```json
[
  {
    "code": "WELCOME20",
    "description": "Welcome discount for new users",
    "discount": 20,
    "forNewUser": true,
    "forMember": false,
    "isPublic": true,
    "expiresAt": "2026-12-31T23:59:59Z",
    "createdAt": "2026-01-01T00:00:00Z"
  }
]
```

**Error Responses:**
- `500` - Failed to fetch: `{ "error": "Failed to fetch coupons" }`

**cURL Example:**
```bash
curl http://localhost:4000/api/coupons
```

---

### POST `/api/coupons`

Create a new coupon.

**Request Body:**
```json
{
  "code": "WELCOME20",
  "description": "Welcome discount for new users",
  "discount": 20,
  "forNewUser": true,
  "forMember": false,
  "isPublic": true,
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

**Validation Rules:**
- `code`: Required. Unique string (primary key)
- `description`: Required. Non-empty string
- `discount`: Required. Number 0-100 (percentage)
- `forNewUser`: Optional. Boolean (defaults to `false`)
- `forMember`: Optional. Boolean (defaults to `false`)
- `isPublic`: Optional. Boolean (defaults to `false`)
- `expiresAt`: Required. Valid ISO 8601 datetime string

**Success Response (201):**
```json
{
  "code": "WELCOME20",
  "description": "Welcome discount for new users",
  "discount": 20,
  "forNewUser": true,
  "forMember": false,
  "isPublic": true,
  "expiresAt": "2026-12-31T23:59:59Z",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400` - Missing required fields: `{ "error": "Missing required fields" }`
- `400` - Invalid discount: `{ "error": "Discount must be between 0 and 100" }`
- `409` - Code already exists: `{ "error": "Coupon code already exists" }`
- `500` - Failed to create: `{ "error": "Failed to create coupon" }`

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME20",
    "description": "Welcome discount for new users",
    "discount": 20,
    "forNewUser": true,
    "isPublic": true,
    "expiresAt": "2026-12-31T23:59:59Z"
  }'
```

---

## SMS / OTP

### POST `/api/sms/send`

Send an OTP via WhatsApp SMS to a user's mobile number.

**Request Body:**
```json
{
  "mobile": "9876543210"
}
```

**Validation Rules:**
- `mobile`: Required. Exactly 10 digits (numeric string)

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Error Responses:**
- `400` - Invalid mobile: `{ "error": "Invalid mobile number" }`
- `500` - Provider not configured: `{ "error": "SMS provider token not configured" }`
- `502` - Provider error: `{ "error": "Failed to send OTP via SMS provider" }`
- `500` - Internal error: `{ "error": "Internal server error" }`

**Notes:**
- OTP valid for 5 minutes
- 4-digit code generated
- Mobile sent as `91{mobile}` to WhatsApp (India country code)

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}'
```

---

### POST `/api/sms/verify`

Verify an OTP code sent via SMS.

**Request Body:**
```json
{
  "mobile": "9876543210",
  "otp": "1234"
}
```

**Validation Rules:**
- `mobile`: Required. Exactly 10 digits (numeric string)
- `otp`: Required. Exactly 4 digits (numeric string)

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified"
}
```

**Error Responses:**
- `400` - Missing fields: `{ "success": false, "error": "Mobile and OTP are required" }`
- `400` - Invalid mobile: `{ "success": false, "error": "Invalid mobile format (must be 10 digits)" }`
- `400` - Invalid OTP: `{ "success": false, "error": "Invalid OTP format (must be 4 digits)" }`
- `400` - OTP invalid/expired: `{ "success": false, "error": "OTP invalid or expired" }`
- `500` - Internal error: `{ "success": false, "error": "Internal server error" }`

**Notes:**
- OTP must not be expired (5-minute window)
- OTP marked as used after first successful verification
- Multiple OTP requests supported; verification uses most recent valid OTP

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/sms/verify \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210", "otp": "1234"}'
```

---

## Health Check

### GET `/health`

Check if the API is running and healthy.

**Success Response (200):**
```json
{
  "status": "ok"
}
```

**cURL Example:**
```bash
curl http://localhost:4000/health
```

---

## Common Patterns

### Error Response Format

All errors follow a consistent JSON format:

```json
{
  "error": "Description of what went wrong"
}
```

For SMS endpoints, some errors use an extended format:

```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200` | OK | Successful GET, PUT, or verification operations |
| `201` | Created | Successful POST operations creating new resources |
| `400` | Bad Request | Invalid fields, format, or missing data |
| `401` | Unauthorized | Invalid credentials (auth endpoints) |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource already exists or business rule violation |
| `500` | Internal Server Error | Database issues or unexpected server error |
| `502` | Bad Gateway | External service failure (e.g., SMS provider) |

### Authentication

**No HTTP-layer authentication** is currently enforced. All routes are unprotected. Role-based access control (CUSTOMER, ADMIN, SELLER) is enforced client-side only.

### Required Environment Variables

```
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/mangal_db
WHAPI_BASE_URL=https://api.whapi.cloud
WHAPI_TOKEN=your_whapi_token
BUCKET_NAME=mangal-images
S3_ENDPOINT=http://localhost:4566
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_ACCESS_KEY=test
```

### Frontend Integration Notes

1. **Image Uploads:** Use `multipart/form-data` for product image uploads (POST/PUT `/api/products`)
2. **Mobile Format:** All mobile numbers must be exactly 10 digits (no country codes in requests)
3. **Cart Management:** User cart stored as JSON on User model; frontend manages cart state
4. **Order Items:** Always include at least one item when creating orders
5. **Order Status Flow:** `ORDER_PLACED` → `PROCESSING` → `SHIPPED` → `DELIVERED`
6. **Unique Constraints:** User mobile, Coupon codes, and Rating (userId+productId+orderId) are all unique
7. **Soft Deletes:** Products cannot be deleted if they have existing orders
8. **Password Security:** Passwords hashed with scrypt before storage; never send plaintext in requests

**Last Updated:** 2026-08-08
