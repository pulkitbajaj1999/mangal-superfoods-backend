# Mangal Superfoods Backend - API Reference

**Base URL:** `http://localhost:4000/api`

**Content-Type:** All requests and responses use `application/json` unless otherwise specified.

---

## Table of Contents

1. [Health Check](#health-check)
2. [Users API](#users-api)
3. [Authentication API](#authentication-api)
4. [Products API](#products-api)
5. [Orders API](#orders-api)
6. [Addresses API](#addresses-api)
7. [Coupons API](#coupons-api)
8. [Ratings API](#ratings-api)
9. [SMS/OTP API](#smsotp-api)

---

## Health Check

### GET /health

Check if the API is running.

**Request:**
```
GET http://localhost:4000/health
```

**Response (200):**
```json
{
  "status": "ok"
}
```

---

## Users API

All user endpoints are located at `/api/users`.

### GET /api/users

Get all users or query a specific user by mobile.

**Request (Get all users):**
```
GET /api/users
```

**Response (200):**
```json
[
  {
    "id": "user_1",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9988776655",
    "image": "https://example.com/profile.jpg",
    "role": "CUSTOMER",
    "cart": {},
    "createdAt": "2026-08-08T10:00:00.000Z",
    "updatedAt": "2026-08-08T10:00:00.000Z"
  }
]
```

**Request (Get by mobile):**
```
GET /api/users?mobile=9988776655
```

**Response (200):** Same as above, single user

**Response (404):**
```json
{
  "error": "User not found"
}
```

---

### POST /api/users

Create a new user account.

**Request:**
```json
{
  "id": "user_new_1",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "mobile": "9876543210",
  "password": "password123"
}
```

**Response (201):** User object created (no password)

**Response (400):** Missing required fields

**Response (409):** Mobile number already registered

---

### PUT /api/users

Update user profile.

**Request:**
```json
{
  "id": "user_1",
  "name": "John Updated",
  "email": "john.new@example.com"
}
```

**Response (200):** Updated user object

**Response (404):** User not found

---

## Authentication API

### POST /api/auth/login

Authenticate with mobile and password.

**Request:**
```json
{
  "mobile": "9988776655",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { "id": "...", "name": "...", "mobile": "..." }
}
```

**Response (401):** Invalid credentials

**Response (404):** User not found

---

## Products API

### GET /api/products

Get all products.

**Response (200):** Array of product objects with ratings

---

### GET /api/products/:id

Get single product.

**Response (200):** Product object

**Response (404):** Product not found

---

### POST /api/products

Create product with image upload.

**Request:** `multipart/form-data`
- name, description, mrp, price, category, images[]

**Response (201):** Created product

**Response (400):** Missing required fields or no images

---

### PUT /api/products/:id

Update product or images.

**Request:** `multipart/form-data` or `application/json`

**Response (200):** Updated product

**Response (404):** Product not found

---

### DELETE /api/products/:id

Delete product.

**Response (200):** `{ "success": true }`

**Response (404):** Product not found

**Response (409):** Cannot delete product with existing orders

---

## Orders API

### GET /api/orders

Get orders (optionally filtered by userId).

**Request:**
```
GET /api/orders?userId=user_1
```

**Response (200):** Array of order objects with nested items, address, user

---

### POST /api/orders

Create new order.

**Request:**
```json
{
  "userId": "user_1",
  "addressId": "addr_1",
  "total": 1078.4,
  "paymentMethod": "COD",
  "orderItems": [
    { "productId": "prod_1", "quantity": 1, "price": 449 }
  ]
}
```

**Response (201):** Created order

**Response (400):** Missing required fields

---

### PUT /api/orders/:id

Update order status.

**Request:**
```json
{
  "status": "SHIPPED"
}
```

Valid statuses: ORDER_PLACED, PROCESSING, SHIPPED, DELIVERED

**Response (200):** Updated order

**Response (404):** Order not found

---

## Addresses API

### GET /api/addresses

Get addresses for user.

**Request:**
```
GET /api/addresses?userId=user_1
```

**Response (200):** Array of address objects

---

### POST /api/addresses

Create address.

**Request:**
```json
{
  "userId": "user_1",
  "name": "John Doe",
  "mobile": "9988776655",
  "pincode": "400001",
  "addressLine1": "Flat 302",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

**Response (201):** Created address

**Response (400):** Validation error

**Response (404):** User not found

---

## Coupons API

### GET /api/coupons

Get all coupons.

**Response (200):** Array of coupon objects

---

### POST /api/coupons

Create coupon.

**Request:**
```json
{
  "code": "OFF10",
  "description": "10% Off",
  "discount": 10,
  "expiresAt": "2026-12-31T00:00:00Z"
}
```

**Response (201):** Created coupon

**Response (400):** Invalid discount (0-100)

**Response (409):** Coupon code already exists

---

## Ratings API

### GET /api/ratings

Get ratings (optionally by productId).

**Request:**
```
GET /api/ratings?productId=prod_1
```

**Response (200):** Array of rating objects

---

### POST /api/ratings

Create rating/review.

**Request:**
```json
{
  "productId": "prod_1",
  "userId": "user_1",
  "orderId": "order_1",
  "rating": 5,
  "review": "Excellent!"
}
```

**Response (201):** Created rating

**Response (400):** Rating must be 1-5

**Response (404):** Product or user not found

**Response (409):** Already rated this product

---

## SMS/OTP API

### POST /api/sms/send

Send OTP via WhatsApp.

**Request:**
```json
{
  "mobile": "9988776655"
}
```

**Response (200):** `{ "success": true, "message": "OTP sent successfully" }`

**Response (400):** Invalid mobile format

**Response (500/502):** SMS provider error

---

### POST /api/sms/verify

Verify OTP.

**Request:**
```json
{
  "mobile": "9988776655",
  "otp": "1234"
}
```

**Response (200):** `{ "success": true, "message": "OTP verified" }`

**Response (400):** OTP invalid or expired

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |
| 502 | Bad Gateway |

---

**Last Updated:** 2026-08-08
