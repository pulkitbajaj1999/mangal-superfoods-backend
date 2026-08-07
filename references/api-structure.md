# Frontend API Structure Documentation

This document provides a comprehensive reference for all APIs consumed by the Mangal Superfoods frontend. Each API is documented with request/response structures, invocation points, and mock data examples.

**Note:** All API endpoints are relative to `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:4000` in dev mode). For zero-backend development, set `NEXT_PUBLIC_USE_MOCK_API=true` to use in-memory mock fixtures.

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Product APIs](#product-apis)
3. [Order APIs](#order-apis)
4. [Address APIs](#address-apis)
5. [Coupon APIs](#coupon-apis)
6. [Rating APIs](#rating-apis)

---

## Authentication APIs

### Overview
Handles user authentication via mobile number + OTP or password-based login, user account creation, and profile updates.

**Module:** `src/features/auth/api/authApi.js`
**Mock Data:** `src/features/auth/api/authMockData.js`

---

### 1.1 Get User by Mobile

**Endpoint:** `GET /api/users?mobile={mobile}`

**Purpose:** Look up a user by mobile number during login/signup flow.

**Request Parameters:**
```
Query Parameters:
- mobile (string, required): Mobile number (e.g., "9999999999")
```

**Response (Success - 200):**
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

**Response (Error - 404):**
```json
{
  "error": "User not found"
}
```

**Invocation Points:**
- `src/app/(auth)/login/page.jsx` — Check if mobile is registered before login
- `src/app/(auth)/signup/page.jsx` — Check if mobile is already registered during signup

**Mock Data Reference:**
```javascript
// From authMockData.js
export const mockUsers = [
  {
    id: 'user_customer_1',
    name: 'Aditi Sharma',
    email: 'aditi.sharma@example.com',
    mobile: '9999999999',
    password: 'password123',  // Only in mock; never exposed by real backend
    role: 'CUSTOMER',
    createdAt: '2026-05-01T10:00:00.000Z',
  },
  {
    id: 'user_admin_1',
    name: 'Admin User',
    email: 'admin@mangalsuperfoods.example.com',
    mobile: '9777777777',
    password: 'password123',
    role: 'ADMIN',
    createdAt: '2026-04-01T10:00:00.000Z',
  },
]
```

**Mock Login Credentials:**
| Mobile | Password | Role |
|--------|----------|------|
| 9999999999 | password123 | CUSTOMER |
| 9777777777 | password123 | ADMIN |

---

### 1.2 Create User (Sign Up)

**Endpoint:** `POST /api/users`

**Purpose:** Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9988776655",
  "password": "password123"
}
```

**Response (Success - 201):**
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

**Response (Error - 409):**
```json
{
  "error": "Mobile number already registered"
}
```

**Invocation Points:**
- `src/app/(auth)/signup/page.jsx` — Final signup submission after OTP verification

**Notes:**
- Backend hashes password using Node.js `crypto.scryptSync`
- New users always get `role: 'CUSTOMER'` by default
- Mobile number must be unique

---

### 1.3 Update User Profile

**Endpoint:** `PUT /api/users`

**Purpose:** Update user profile information (name, email).

**Request Body:**
```json
{
  "id": "user_customer_1",
  "name": "Aditi Updated",
  "email": "aditi.new@example.com"
}
```

**Response (Success - 200):**
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

**Response (Error - 404):**
```json
{
  "error": "User not found"
}
```

**Invocation Points:**
- `src/app/profile/page.jsx` — Update profile name and email

---

### 1.4 Login with Password

**Endpoint:** `POST /api/auth/login`

**Purpose:** Authenticate user with mobile number and password.

**Request Body:**
```json
{
  "mobile": "9999999999",
  "password": "password123"
}
```

**Response (Success - 200):**
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

**Response (Error - 401):**
```json
{
  "success": false,
  "error": "Invalid credentials."
}
```

**Invocation Points:**
- `src/app/(auth)/login/page.jsx` — Password-based login flow

---

### 1.5 Send OTP

**Endpoint:** `POST /api/sms/send`

**Purpose:** Trigger OTP generation and send via WhatsApp/SMS to user's mobile number.

**Request Body:**
```json
{
  "mobile": "9999999999"
}
```

**Response (Success - 200):**
```json
{
  "message": "OTP sent to your mobile"
}
```

**Invocation Points:**
- `src/app/(auth)/login/page.jsx` — Send OTP during mobile-based login
- `src/app/(auth)/signup/page.jsx` — Send OTP during mobile-based signup

**Notes:**
- Backend uses whapi.cloud for WhatsApp delivery
- OTP template is pulled from `OtpTemplate` model
- OTP code is created in `OtpCode` table
- In mock mode, use `MOCK_OTP = '1234'` to verify

---

### 1.6 Verify OTP

**Endpoint:** `POST /api/sms/verify`

**Purpose:** Verify the OTP code sent to user's mobile number.

**Request Body:**
```json
{
  "mobile": "9999999999",
  "otp": "1234"
}
```

**Response (Success - 200):**
```json
{
  "success": true
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Invalid OTP."
}
```

**Invocation Points:**
- `src/app/(auth)/login/page.jsx` — Verify OTP during login
- `src/app/(auth)/signup/page.jsx` — Verify OTP during signup

**Notes:**
- Mock OTP code is `'1234'` (see `authMockData.js`)
- Real OTP is time-limited and single-use

---

## Product APIs

### Overview
Manages product catalog — listing, retrieval, creation, updates, and deletion. Used by both customer storefront and admin dashboard.

**Module:** `src/features/products/api/productApi.js`
**Mock Data:** `src/features/products/api/productMockData.js`

---

### 2.1 Get All Products

**Endpoint:** `GET /api/products`

**Purpose:** Fetch all products in the catalog.

**Request Parameters:** None

**Response (Success - 200):**
```json
[
  {
    "id": "prod_almond",
    "name": "Premium California Almonds",
    "description": "Hand-picked, naturally air-dried California almonds...",
    "mrp": 649,
    "price": 549,
    "images": ["https://example.com/almond.jpg"],
    "category": "Food & Drink",
    "inStock": true,
    "rating": [
      {
        "id": "rating_prod_almond_1",
        "rating": 5,
        "review": "Fresh and crunchy, exactly as described.",
        "user": {
          "name": "Kavita Rao",
          "image": "https://example.com/profile1.jpg"
        },
        "productId": "prod_almond",
        "createdAt": "2026-06-15T09:30:00.000Z",
        "updatedAt": "2026-06-15T09:30:00.000Z"
      }
    ],
    "createdAt": "2026-07-29T09:15:25.000Z",
    "updatedAt": "2026-07-29T09:15:25.000Z"
  }
]
```

**Invocation Points:**
- `src/app/(public)/shop/page.jsx` — Display all products in shop
- `src/features/products/components/AllProducts.jsx` — Render product list
- `src/features/products/components/BestSelling.jsx` — Show best sellers

---

### 2.2 Get Product by ID

**Endpoint:** `GET /api/products/{productId}`

**Purpose:** Fetch detailed information about a specific product.

**Request Parameters:**
```
Path Parameters:
- productId (string, required): Product ID (e.g., "prod_almond")
```

**Response (Success - 200):**
```json
{
  "id": "prod_almond",
  "name": "Premium California Almonds",
  "description": "Hand-picked, naturally air-dried California almonds...",
  "mrp": 649,
  "price": 549,
  "images": ["https://example.com/almond.jpg"],
  "category": "Food & Drink",
  "inStock": true,
  "rating": [
    {
      "id": "rating_prod_almond_1",
      "rating": 5,
      "review": "Fresh and crunchy, exactly as described.",
      "user": {
        "name": "Kavita Rao",
        "image": "https://example.com/profile1.jpg"
      },
      "productId": "prod_almond",
      "createdAt": "2026-06-15T09:30:00.000Z"
    }
  ],
  "createdAt": "2026-07-29T09:15:25.000Z",
  "updatedAt": "2026-07-29T09:15:25.000Z"
}
```

**Response (Error - 404):**
```json
{
  "error": "Product not found"
}
```

**Invocation Points:**
- `src/app/(public)/product/[productId]/page.jsx` — Show product detail page

---

### 2.3 Create Product

**Endpoint:** `POST /api/products`

**Purpose:** Create a new product (admin only).

**Request Body (FormData):**
```
- name (string): Product name
- description (string): Product description
- mrp (number): Maximum Retail Price
- price (number): Selling price
- category (string): Product category (e.g., "Food & Drink")
- images[] (File[]): Product images (multipart file upload)
```

**Response (Success - 201):**
```json
{
  "id": "prod_new_1",
  "name": "New Product",
  "description": "Description here...",
  "mrp": 500,
  "price": 450,
  "images": ["https://s3.amazonaws.com/..."],
  "category": "Food & Drink",
  "inStock": true,
  "rating": [],
  "createdAt": "2026-08-08T10:30:00.000Z",
  "updatedAt": "2026-08-08T10:30:00.000Z"
}
```

**Invocation Points:**
- `src/app/admin/add-product/page.jsx` — Form to create new product

**Notes:**
- Images are uploaded to S3 backend (handled by backend)
- In mock mode, images are converted to blob URLs via `URL.createObjectURL()`
- Only admin users can access this endpoint

---

### 2.4 Update Product

**Endpoint:** `PUT /api/products/{productId}`

**Purpose:** Update product details or toggle stock status.

**Request Body (Option 1 - Full Edit, FormData):**
```
- name (string): Product name
- description (string): Product description
- mrp (number): Maximum Retail Price
- price (number): Selling price
- category (string): Category
- inStock (boolean): Stock status
- images[] (File[]): New images to add (optional)
- existingImages (JSON string): IDs/URLs of images to keep
```

**Request Body (Option 2 - Stock Toggle, JSON):**
```json
{
  "inStock": false
}
```

**Response (Success - 200):**
```json
{
  "id": "prod_almond",
  "name": "Premium California Almonds",
  "description": "Updated description...",
  "mrp": 649,
  "price": 549,
  "images": ["https://example.com/almond.jpg"],
  "category": "Food & Drink",
  "inStock": false,
  "rating": [],
  "updatedAt": "2026-08-08T11:00:00.000Z"
}
```

**Response (Error - 404):**
```json
{
  "error": "Product not found"
}
```

**Invocation Points:**
- `src/app/admin/manage-product/page.jsx` — Edit product details
- `src/app/admin/manage-product/page.jsx` — Toggle in-stock status

---

### 2.5 Delete Product

**Endpoint:** `DELETE /api/products/{productId}`

**Purpose:** Delete a product from the catalog (admin only).

**Request Parameters:**
```
Path Parameters:
- productId (string, required): Product ID to delete
```

**Response (Success - 200):**
```json
{
  "success": true
}
```

**Response (Error - 404):**
```json
{
  "error": "Product not found"
}
```

**Invocation Points:**
- `src/app/admin/manage-product/page.jsx` — Delete product action

---

## Order APIs

### Overview
Manages customer orders — fetching orders and creating new ones. Supports filtering by user ID.

**Module:** `src/features/orders/api/orderApi.js`
**Mock Data:** `src/features/orders/api/orderMockData.js`

---

### 3.1 Get Orders

**Endpoint:** `GET /api/orders` or `GET /api/orders?userId={userId}`

**Purpose:** Fetch orders (optionally filtered by user).

**Request Parameters:**
```
Query Parameters:
- userId (string, optional): Filter orders by customer ID
```

**Response (Success - 200):**
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
      "addressLine1": "Flat 302, Sunrise Apartments",
      "addressLine2": "Near Marine Lines Station",
      "landmark": "Opposite City Hospital",
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
    "createdAt": "2026-07-15T09:15:03.000Z",
    "updatedAt": "2026-07-17T14:20:00.000Z"
  }
]
```

**Invocation Points:**
- `src/app/(public)/orders/page.jsx` — Show customer's own orders (filtered by `userId`)
- `src/app/admin/orders/page.jsx` — Show all orders for admin dashboard

**Status Values:**
- `ORDER_PLACED` — Order just created
- `PROCESSING` — Order being prepared
- `SHIPPED` — Order in transit
- `DELIVERED` — Order delivered to customer

---

### 3.2 Create Order

**Endpoint:** `POST /api/orders`

**Purpose:** Create a new order from cart items.

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

**Response (Success - 201):**
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
  "orderItems": [
    {
      "orderId": "order_new_1",
      "productId": "prod_almond",
      "quantity": 1,
      "price": 549,
      "product": { ... }
    }
  ],
  "address": { ... },
  "user": { ... },
  "createdAt": "2026-08-08T12:00:00.000Z",
  "updatedAt": "2026-08-08T12:00:00.000Z"
}
```

**Invocation Points:**
- `src/features/cart/components/OrderSummary.jsx` — Final order placement from checkout

**Notes:**
- Coupon is optional; omit if no coupon applied
- `paymentMethod` values: `COD`, `STRIPE`, etc.
- `isPaid` defaults to `false` for COD orders

---

### 3.3 Update Order Status

**Endpoint:** `PUT /api/orders/{orderId}`

**Purpose:** Update order status (admin only).

**Request Body:**
```json
{
  "status": "SHIPPED"
}
```

**Response (Success - 200):**
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

**Response (Error - 404):**
```json
{
  "error": "Order not found"
}
```

**Invocation Points:**
- `src/app/admin/orders/page.jsx` — Update order status via dropdown

**Valid Statuses:**
- `ORDER_PLACED`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`

---

## Address APIs

### Overview
Manages customer delivery addresses — fetching and creating new addresses.

**Module:** `src/features/cart/api/addressApi.js`
**Mock Data:** `src/features/cart/api/addressMockData.js`

---

### 4.1 Get Addresses

**Endpoint:** `GET /api/addresses`

**Purpose:** Fetch all saved addresses for the logged-in user.

**Request Parameters:** None

**Response (Success - 200):**
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

**Invocation Points:**
- `src/features/cart/components/OrderSummary.jsx` — Load addresses during checkout

---

### 4.2 Create Address

**Endpoint:** `POST /api/addresses`

**Purpose:** Save a new delivery address.

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

**Response (Success - 201):**
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

**Invocation Points:**
- `src/features/cart/components/AddressModal.jsx` — Submit new address form during checkout

---

## Coupon APIs

### Overview
Manages promotion codes/coupons — fetching valid coupons for checkout.

**Module:** `src/features/coupons/api/couponApi.js`
**Mock Data:** `src/features/coupons/api/couponMockData.js`

---

### 5.1 Get Coupons

**Endpoint:** `GET /api/coupons`

**Purpose:** Fetch all available coupons (public and applicable to current user).

**Request Parameters:** None

**Response (Success - 200):**
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

**Invocation Points:**
- `src/features/cart/components/OrderSummary.jsx` — Load coupons for validation during checkout

**Mock Coupons Available:**
| Code | Discount | Eligibility | Expiry |
|------|----------|-------------|--------|
| NEW20 | 20% | New Users | 2026-12-31 |
| NEW10 | 10% | New Users | 2026-12-31 |
| OFF20 | 20% | All Users | 2026-12-31 |
| OFF10 | 10% | All Users | 2026-12-31 |
| PLUS10 | 10% | Members | 2027-03-06 |

---

## Rating APIs

### Overview
Manages product reviews and ratings — fetching reviews by product and creating new ones.

**Module:** `src/features/reviews/api/ratingApi.js`
**Mock Data:** `src/features/reviews/api/ratingMockData.js`

---

### 6.1 Get Ratings

**Endpoint:** `GET /api/ratings` or `GET /api/ratings?productId={productId}`

**Purpose:** Fetch ratings/reviews (optionally filtered by product).

**Request Parameters:**
```
Query Parameters:
- productId (string, optional): Filter ratings by product ID
```

**Response (Success - 200):**
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
    "createdAt": "2026-06-15T09:30:00.000Z",
    "updatedAt": "2026-06-15T09:30:00.000Z"
  }
]
```

**Invocation Points:**
- Product detail page (embedded in product response)
- Rating modal for viewing reviews

---

### 6.2 Create Rating

**Endpoint:** `POST /api/ratings`

**Purpose:** Submit a new review/rating for a product.

**Request Body:**
```json
{
  "productId": "prod_almond",
  "userId": "user_customer_1",
  "rating": 4.5,
  "review": "Excellent quality almonds, very fresh!"
}
```

**Response (Success - 201):**
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
  "createdAt": "2026-08-08T12:45:00.000Z",
  "updatedAt": "2026-08-08T12:45:00.000Z"
}
```

**Invocation Points:**
- `src/features/reviews/components/RatingModal.jsx` — Submit review form on product detail page

**Notes:**
- Rating should be a number from 1–5 (or decimal like 4.5)
- Review is optional text

---

## API Client Configuration

### Location
`src/services/apiClient.js`

### Key Function
```javascript
export async function apiFetch(path, options = {}) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}${path}`
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      // Optional: add auth token here if needed
    },
  })
}
```

### Usage Pattern
All feature API modules use `apiFetch()` to make HTTP calls:
```javascript
import { apiFetch } from '@/services/apiClient'

export async function getProducts() {
  return apiFetch('/api/products')
}
```

---

## Mock API Toggle

### Configuration
`src/config/api.js`

```javascript
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
```

### Environment Variable
Set in `.env.local` or `.env`:
```
NEXT_PUBLIC_USE_MOCK_API=true   # Use mock data
NEXT_PUBLIC_USE_MOCK_API=false  # Use real backend
```

### How It Works
Each feature API module checks `USE_MOCK_API`:
```javascript
export async function getProducts() {
  if (USE_MOCK_API) {
    return mockResponse(mockProducts)  // Return mock data
  }
  return apiFetch('/api/products')      // Call real backend
}
```

Call sites never branch on this toggle — they always import from the feature API module and let it handle the routing.

---

## Error Handling

### Response Shape
All API responses follow this shape (whether mock or real):

**Success:**
```javascript
const response = await apiFunction()
if (response.ok) {
  const data = await response.json()
  // Handle success
}
```

**Error:**
```javascript
if (!response.ok) {
  const error = await response.json()
  console.error(error.error || error.message)
  // Handle error
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK — Request succeeded |
| 201 | Created — Resource created successfully |
| 400 | Bad Request — Invalid input |
| 401 | Unauthorized — Authentication failed |
| 404 | Not Found — Resource doesn't exist |
| 409 | Conflict — Resource already exists (e.g., duplicate mobile) |
| 500 | Internal Server Error — Backend error |

---

## Implementing New Endpoints

### Step 1: Create API Module
Create `src/features/<name>/api/<name>Api.js`:
```javascript
import { apiFetch } from '@/services/apiClient'
import { mockResponse } from '@/services/mockUtils'
import { USE_MOCK_API } from '@/config/api'
import { mockData } from './<name>MockData'

export async function getResource() {
  if (USE_MOCK_API) {
    return mockResponse(mockData)
  }
  return apiFetch('/api/<name>')
}
```

### Step 2: Create Mock Data
Create `src/features/<name>/api/<name>MockData.js`:
```javascript
export const mockData = [
  { id: '1', name: 'Example' },
]
```

### Step 3: Use in Components
Import from the feature API module:
```javascript
import { getResource } from '@/features/<name>/api/<name>Api'

export default function MyComponent() {
  useEffect(() => {
    getResource().then(res => {
      if (res.ok) {
        const data = await res.json()
        // Use data
      }
    })
  }, [])
}
```

---

## Backend API Reference

The backend (separate `mangal-superfoods-backend` repo) implements all these endpoints. See the backend's `CLAUDE.md` and `README.md` for:
- Implementation details
- Database schema (`Prisma`)
- Environment configuration
- S3 image upload handling
- WhatsApp/SMS integration

---

## Testing APIs Locally

### With Mock API (Zero Backend Dependency)
```bash
# In .env.local
NEXT_PUBLIC_USE_MOCK_API=true

# Run frontend only
npm run dev  # http://localhost:3000
```

### With Real Backend
```bash
# Terminal 1 - Backend service
cd ../mangal-superfoods-backend
npm install
npm run dev  # http://localhost:4000

# Terminal 2 - Frontend
NEXT_PUBLIC_USE_MOCK_API=false npm run dev  # http://localhost:3000
```

---

## Related Documentation

- [Architecture Guide](./architecture.md) — Overall codebase structure
- [CLAUDE.md](../CLAUDE.md) — Project conventions and patterns
- Backend [CLAUDE.md](../../mangal-superfoods-backend/CLAUDE.md) — Backend implementation details
