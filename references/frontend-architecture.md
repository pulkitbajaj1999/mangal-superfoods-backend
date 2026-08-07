# Architecture

This document describes how the `mangal-superfoods-frontend` repo is put together: the app areas, state
management, and the split between this repo and `mangal-superfoods-backend`. For day-to-day commands and
conventions, see the root [CLAUDE.md](../CLAUDE.md) — this doc goes deeper on structure and data flow.

## Overview

Mangal Superfoods is a **single-vendor e-commerce storefront**. The stack is:

- **Next.js (App Router)** — v16, with Turbopack in dev
- **React 19**
- **Tailwind CSS v4**
- **Redux Toolkit** for client state
- **Recharts** for the store dashboard's orders chart

The project was forked from the open-source multi-vendor "GoCart" template (the root `README.md` still
carries the original GoCart branding — that hasn't been updated) and has since been narrowed to one store.
The `Store` model has been removed from the data model entirely, and all multi-vendor UI screens have been removed.
All vendor/admin write actions have been replaced with real, API-backed implementations.

**This repo is frontend-only.** There is no database, no Prisma schema, and no API route handlers here.
Every data operation is an HTTP call to a separate sibling repo, `mangal-superfoods-backend` (a standalone
Express + Prisma + Postgres app). See [Frontend/backend split](#frontendbackend-split) for details.

## Repository layout

```
src/
  app/                    Next.js App Router pages (two independent chrome trees, see below)
  components/             Shared React components, plus admin/ subfolder for admin area chrome
  store/
    index.js              Redux store factory (makeStore)
  features/<name>/
    <name>Slice.js        Redux slice
    api/
      <name>Api.js        API call wrappers (use apiFetch or mockResponse based on USE_MOCK_API)
      <name>MockData.js   In-memory fixture data for each feature
  config/
    api.js                USE_MOCK_API toggle (reads NEXT_PUBLIC_USE_MOCK_API env var)
  services/
    apiClient.js          apiFetch() — HTTP wrapper, prefixes NEXT_PUBLIC_API_BASE_URL
    mockUtils.js          mockResponse() helper, delay() for simulating network latency
  assets/
    assets.js             Static image imports, category list, UI fixture data (icons, spec copy)
  StoreProvider.js        Client component that lazily creates the per-request Redux store (root client wrapper)
next.config.mjs           images.unoptimized = true
jsconfig.json             @/* path alias → repo root
.env.example              NEXT_PUBLIC_CURRENCY_SYMBOL, NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_USE_MOCK_API
```

## The two main app areas

The App Router is split into two independently-laid-out sections, each with its own `layout.jsx` and
nav/sidebar chrome. There is no shared top-level layout beyond the root `app/layout.jsx` (fonts, Redux
`StoreProvider`, `react-hot-toast`'s `Toaster`).

### 1. Customer storefront — `src/app/(public)/`

Routes: `page.jsx` (home), `shop/`, `product/[productId]/`, `cart/`, `orders/`, `pricing/`, `loading/`.

Layout (`src/app/(public)/layout.jsx`) wraps pages with `Banner` → `Navbar` → page content → `Footer`
(all in `src/components/`). Home page composes `Hero`, `CategoriesMarquee`, `LatestProducts`, `BestSelling`,
`OurSpec`, `Newsletter`.

### 2. Admin dashboard — `src/app/admin/`

Routes: `page.jsx` (dashboard), `add-product/`, `manage-product/`, `orders/`, `coupons/`.

Layout uses `src/features/admin/AdminLayout.jsx` (+ `AdminNavbar`, `AdminSidebar`). Gates client-side on
`user.role === 'ADMIN'` — see [Auth caveats](#auth-is-real-but-theres-no-server-side-session-layer).
Includes product management, order management, and coupon management functions.

### Outside the two trees — `src/app/login/`, `src/app/signup/`, `src/app/profile/`

Real, working auth pages added after the original GoCart layout was set up. They don't use
`Banner`/`Navbar`/`Footer` and have no shared chrome of their own.

## State management: Redux Toolkit, per-request store

`src/app/layout.jsx` (root) wraps the app in `StoreProvider` (`src/StoreProvider.js`), a client component that
lazily creates the store via `makeStore()` (`src/store/index.js`). This is the standard Next.js App Router
pattern for keeping the Redux store request-scoped rather than a module-level singleton (avoids leaking
state across requests/users on the server).

Slices live under `src/features/<name>/<name>Slice.js` and are combined in `src/store/index.js`:

| Slice      | Initial state                          | Notes |
|------------|-----------------------------------------|-------|
| `cart`     | `{ total: 0, cartItems: {} }`           | `cartItems` keyed by `productId` → quantity |
| `product`  | `{ list: [] }`                          | populated by `useEffect` fetch from `productApi.js`, not seeded |
| `address`  | `{ list: [] }`                          | populated by `useEffect` fetch from `addressApi.js`, not seeded |
| `rating`   | `{ list: [] }`                          | populated by `useEffect` fetch from `ratingApi.js`, not seeded |
| `user`     | `{ current: null }`                     | set by login/signup (via `authApi.js`); actions: `setUser`, `login`, `logout`, `updateProfile` |

None of the slices seed from fixture data anymore — `product`/`address`/`rating` all start empty (`list: []`) 
and are populated by API calls via the corresponding feature's `*Api.js` modules (which support both real and
mock backends). Follow the existing plain-`createSlice` shape (e.g. `cartSlice.js`) when extending state.

## Frontend/backend split

This repo used to have its own `app/api/` route handlers backed by Prisma/Postgres in-process. That has
been fully split out:

- **`mangal-superfoods-backend`** (sibling repo, Express + Prisma + Postgres) owns the schema,
  migrations, seed script, and every API route under `/api/*`.
- This repo has **no `app/api/`, no `prisma/`, no `lib/prisma.js`, no `lib/s3.js`**, and none of
  `@prisma/client` / `pg` / `@aws-sdk/client-s3` as dependencies. Don't reintroduce direct DB/S3 access
  here — all data operations go over HTTP.

### `src/services/apiClient.js`

```js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export function apiFetch(path, options) {
  return fetch(`${API_BASE_URL}${path}`, options);
}
```

A thin `fetch()` wrapper that prefixes `NEXT_PUBLIC_API_BASE_URL`. Components/pages should **not import
`apiFetch` directly** — instead, import from the feature's API module (e.g. `import { getProducts } from '@/features/products/api/productApi'`).
The API modules handle the mock/real toggle transparently, so call sites never need to branch on `USE_MOCK_API`.

For low-level use cases outside the feature API modules (which is rare), `apiFetch` works just like raw `fetch()` — same path, 
same options (JSON bodies, `FormData` for image uploads, etc.), just routed to the external backend.

Because the backend is a separate origin, it enables CORS for the frontend's origin
(`FRONTEND_ORIGIN` env var, set on the *backend*). Adding a new frontend deployment origin requires
updating that env var on the backend side too, or requests get blocked by the browser.

### Backend API surface (implemented in the sibling repo)

- `/api/products` (GET/POST), `/api/products/:id` (GET/PUT/DELETE, S3 image upload)
- `/api/orders` (GET/POST), `/api/orders/:id` (PUT — status updates)
- `/api/addresses` (GET/POST)
- `/api/ratings` (GET/POST)
- `/api/coupons` (GET/POST)
- `/api/users` (GET/POST/PUT)
- `/api/auth/login` (POST)
- `/api/sms/send`, `/api/sms/verify` (POST) — OTP over WhatsApp via whapi.cloud

### Data model (owned by the backend)

`User`, `Product`, `Order` / `OrderItem`, `Rating`, `Address`, `Coupon`, `OtpTemplate`, `OtpCode`.
**No `Store` model**, and `Product` has no `storeId` (removed in the multi-vendor → single-vendor
pivot). `User.role` is a `UserRole` enum: `CUSTOMER` / `ADMIN` / `SELLER`.

## Mock API layer — zero-backend development

Every feature that talks to the backend has an `api/` folder alongside its Redux slice
(`src/features/<name>/api/`), containing:

- `<name>Api.js` — API call wrappers (e.g. `getProducts()`, `createProduct(data)`)
- `<name>MockData.js` — in-memory fixture data

Each `*Api.js` function checks the `USE_MOCK_API` toggle (`src/config/api.js`) and either:
- Returns a mock Response-like object built with `mockResponse()` (`src/services/mockUtils.js`)
- Calls `apiFetch()` to hit the real backend

**All call sites are identical** — they don't branch on `USE_MOCK_API`. They just import from
`src/features/<name>/api/<name>Api.js` and call the function, which returns a Response-like shape
(`.ok`, `.json()`) whether mock or real. This keeps components/pages agnostic of the toggle.

```javascript
// Example usage in a component or page:
import { getProducts } from '@/features/products/api/productApi'

const response = await getProducts()
if (response.ok) {
  const products = await response.json()
  // use products...
}
```

**To run the frontend with zero backend dependency**, set `NEXT_PUBLIC_USE_MOCK_API=true` in `.env`:

```bash
# .env
NEXT_PUBLIC_USE_MOCK_API=true
npm run dev  # Frontend now uses mock fixtures, no backend/DB needed
```

Mock data is stored in memory per session — creates/updates/deletes mutate the mock fixtures for the
lifetime of the page, but are reset on reload. This is useful for rapid development/demo cycles.

**Mock auth fixtures** (in `src/features/auth/api/authMockData.js`) document ready-to-use test accounts:
- Mobile `+919876543210`, password `password123` (CUSTOMER role)
- Mobile `+919876543211`, password `password123` (SELLER role)
- Mobile `+919876543212`, password `password123` (ADMIN role)
- Fixed OTP code `123456` for testing SMS flows

## Write-action implementation status

All form submit handlers have been implemented against the backend via the feature API modules:

| Location | Handler | API module | Status |
|---|---|---|---|
| `src/app/admin/add-product/page.jsx` | `onSubmitHandler` | `productApi.js` → `createProduct()` | ✅ implemented — `POST /api/products` with `FormData`, uploads images |
| `src/app/admin/manage-product/page.jsx` | `toggleStock` and others | `productApi.js` → `updateProduct()` | ✅ implemented — `PUT`/`DELETE` on `/api/products/[id]` |
| `src/app/admin/orders/page.jsx` | `updateOrderStatus` | `orderApi.js` → `updateOrder()` | ✅ implemented — `PUT /api/orders/[id]` |
| `src/components/OrderSummary.jsx` | `handleCouponCode` / `handlePlaceOrder` | `couponApi.js`, `orderApi.js` | ✅ implemented — `/api/coupons`, `/api/orders` |
| `src/components/AddressModal.jsx` | `handleSubmit` | `addressApi.js` → `createAddress()` | ✅ implemented — `/api/addresses` |
| `src/components/RatingModal.jsx` | `handleSubmit` | `ratingApi.js` → `createRating()` | ✅ implemented — `/api/ratings` |

Follow the pattern of existing API modules (e.g. `productApi.js`) for consistency when implementing new features. Keep the existing `toast.promise(fn(), { loading: '...' })` pattern at the call site — `fn()` is expected to resolve/reject to drive the toast, so implementations should return a promise rather than swallowing errors internally.

## Auth is real, but there's no server-side session layer

`src/app/login/page.jsx` and `src/app/signup/page.jsx` implement a working auth flow via the `authApi.js` module:

1. Mobile number lookup — `GET /api/users?mobile=...`
2. OTP send/verify over WhatsApp — `POST /api/sms/send`, `POST /api/sms/verify` (backed by
   `OtpCode`/`OtpTemplate` models, delivered through whapi.cloud)
3. Password auth — `POST /api/auth/login` (passwords hashed with Node's `crypto.scryptSync`, stored as
   `salt:key`)

All of these are routed through `src/features/auth/api/authApi.js`, which supports both real and mock backends
(see [Mock API layer](#mock-api-layer--zero-backend-development)). On success the app dispatches into the
`user` Redux slice (`state.user.current`); `Navbar.jsx` reads this to render `Hi, {user.name}` instead of a
"Login" link.

`User.role` is checked **client-side only**, in `src/features/admin/AdminLayout.jsx` (requires `role === 'ADMIN'`). **There is no `middleware.js`
and no server-side session/route protection** — `state.user.current` is just client-side UI state
populated by the login flow, not a verified session. Don't assume `src/app/admin` is
actually access-controlled server-side; a user who directly navigates there without going through the
client-side check (or with client JS disabled) is not blocked by anything on the server.

## Conventions

- **Path alias**: `@/*` → `src/` directory (`jsconfig.json`), e.g. `@/components/Navbar`, `@/features/products/api/productApi`.
- **Feature API calls**: Don't import `apiFetch` directly in components. Instead, import from
  `@/features/<name>/api/<name>Api.js` (e.g. `import { getProducts } from '@/features/products/api/productApi'`).
  This ensures the mock/real API toggle works transparently at the call site.
- **Adding a new feature**: Create `src/features/<name>/` with:
  - `<name>Slice.js` (Redux slice)
  - `api/<name>Api.js` (API wrappers, uses `USE_MOCK_API` toggle)
  - `api/<name>MockData.js` (fixture data for development)
- **Currency**: read from `process.env.NEXT_PUBLIC_CURRENCY_SYMBOL` with a `'$'` fallback, repeated
  per-component (`const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'`) rather than a shared
  helper — match this in new components. Some older components hardcode a literal `$`/`₹` instead — the pattern isn't applied everywhere.
- **Images**: `next.config.mjs` sets `images.unoptimized = true` — `next/image` is used, but images are
  served unoptimized (no Next.js image optimization pipeline, since there's no server-side image infra
  configured for this deployment).
- **Font**: `Outfit` via `next/font/google`, set up once in the root `src/app/layout.jsx`.
- **Category lists are duplicated, not shared**: `src/assets/assets.js` exports a short `categories` list
  for the storefront, while `src/app/admin/add-product/page.jsx` hardcodes its own longer, different category
  array inline. There's no single source of truth — update both if a category list needs to change.

## Environment variables

Set in `.env` (see `.env.example`):

| Variable | Purpose | Example |
|---|---|---|
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | Currency symbol used across price displays | `'₹'` |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the `mangal-superfoods-backend` service | `http://localhost:4000` |
| `NEXT_PUBLIC_USE_MOCK_API` | Toggle mock API layer (see [Mock API layer](#mock-api-layer--zero-backend-development)) — set to `'true'` to run without backend | `'false'` (default) |

There is no `DATABASE_URL`, WHAPI, or S3 config in this repo — those live in the backend repo's own
`.env`.

## Running locally

### With the backend (recommended for integration testing)

This frontend must be run **alongside** `mangal-superfoods-backend` for any data-backed page to work:

```bash
# in mangal-superfoods-backend
npm install
npm run dev          # default port 4000

# in this repo
npm install
npm run dev           # Next.js + Turbopack, http://localhost:3000
```

### With mock API (zero backend dependency)

For rapid development/demo without running the backend service, set `NEXT_PUBLIC_USE_MOCK_API=true` in `.env`:

```bash
# in this repo
echo "NEXT_PUBLIC_USE_MOCK_API=true" >> .env
npm install
npm run dev           # Frontend runs against in-memory mock fixtures
```

All data operations use the local mock layer (see [Mock API layer](#mock-api-layer--zero-backend-development)).
Creates/updates/deletes persist for the session but reset on page reload.

### Other commands

```bash
npm run build          # production build
npm run start           # run the production build
npm run lint             # next lint
```

There is no test suite/framework configured in this repo (no Jest/Vitest).

## Key dependencies

| Package | Role |
|---|---|
| `next` | App Router framework (v16, Turbopack in dev) |
| `react` / `react-dom` | v19 |
| `@reduxjs/toolkit` / `react-redux` | Client state management |
| `tailwindcss` / `@tailwindcss/postcss` | Styling (v4) |
| `react-hot-toast` | Toast notifications, incl. `toast.promise` for async form handlers |
| `recharts` | Orders chart in the store dashboard (`src/components/OrdersAreaChart.jsx`) |
| `date-fns` | Date formatting |
| `lucide-react` | Icon set |

Notably absent (moved to the backend repo): `@prisma/client`, `pg`, `@aws-sdk/client-s3`.

The mock API layer (see [Mock API layer](#mock-api-layer--zero-backend-development)) uses only built-in
JavaScript — no additional dependencies are needed to run the frontend against mock fixtures.
