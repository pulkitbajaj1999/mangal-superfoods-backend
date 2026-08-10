# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Standalone Express + Prisma (Postgres) API for the Mangal Superfoods storefront. It was split out of
`mangal-superfoods-frontend` (a Next.js app), which now calls this service over HTTP instead of using
Next.js API routes. There is no separate "controllers" layer — route handlers in `src/routes/*.js`
contain the request handling, validation, and Prisma calls directly.

## Commands

```bash
npm install                    # install dependencies (postinstall runs prisma generate)
npm run dev                    # start the API with --watch, http://localhost:4000
npm run start                  # run the API without --watch

npm run prisma:generate        # regenerate the Prisma client
npm run prisma:migrate:dev     # create/apply a dev migration
npm run prisma:migrate:deploy  # apply migrations in production
npm run prisma:migrate:reset   # DESTRUCTIVE: drop + re-migrate the dev DB, then reseed it
npm run prisma:studio          # open Prisma Studio
npm run prisma:db:push         # push schema changes without a migration
npm run prisma:db:pull         # introspect the DB into the schema
npm run prisma:format          # format schema.prisma
npm run prisma:db:seed         # run the configured seed (prisma db seed -> bun prisma/seed.mjs)
npm run init:s3                # create the local S3 bucket and sync sampleimages/ into it
```

There is no test suite/framework configured — don't assume Jest/Vitest exists, and don't add test
scripts to `package.json` without checking with the user first.

Required env vars — see `.env.example`: `PORT`, `FRONTEND_ORIGIN` (comma-separated CORS allowlist),
`DATABASE_URL` (Postgres), `WHAPI_BASE_URL`/`WHAPI_TOKEN` (WhatsApp OTP delivery via whapi.cloud), and
S3-compatible object storage config for product images (`BUCKET_NAME`, `S3_ENDPOINT`, `AWS_REGION`,
`AWS_ACCESS_KEY_ID`, `AWS_ACCESS_KEY`).

`docker-compose.yml` spins up local Postgres + a LocalStack S3 emulator for development; `init-s3.sh`
creates the bucket and syncs `sampleimages/` into it — run this before hitting product image upload
endpoints locally.

## Architecture

- `server.js` — the whole entry point, app setup and listener in one file: loads `.env` via
  `dotenv/config`, CORS (allowlist parsed from `FRONTEND_ORIGIN`), `express.json()` body parsing, route
  mounting under `/api/<resource>`, a catch-all error handler at the bottom, then `app.listen`. Route
  handlers are expected to catch their own errors and respond with a JSON `{ error }` body + status
  code; the app-level handler only catches genuinely unexpected failures, e.g. malformed JSON bodies.
  There is no separate `src/app.js` — don't reintroduce one; add new middleware and route mounts here.
- `src/routes/*.js` — one Express router per resource, each mounted in `server.js`. Handlers follow a
  consistent shape: destructure/validate `request.body` or `request.params`/`request.query`, call
  `prisma.<model>.*`, wrap in try/catch, respond with the created/updated resource or a
  `{ error: '...' }` message. Match this shape for new endpoints rather than introducing a different
  error-handling or response convention.
  - `products.js` — GET/POST `/`, GET/PUT/DELETE `/:id`. Image upload uses `multer` (memory storage) +
    `src/lib/s3.js` — files are uploaded to S3 first and the resulting URLs are stored in the `images`
    array on the `Product` row. PUT merges `existingImages` (URLs to keep, sent as a JSON string in the
    body) with newly uploaded files. DELETE refuses to delete a product that has existing `orderItems`.
  - `orders.js` — GET `/` (optionally filtered by `?userId=`), POST `/` (creates an `Order` with nested
    `OrderItem` creates in one `prisma.order.create`), PUT `/:id` (status transitions only, validated
    against the `OrderStatus` enum).
  - `addresses.js`, `ratings.js`, `coupons.js`, `users.js` — GET/POST (and users also has PUT), same
    validate → Prisma call → JSON response pattern.
  - `auth.js` — POST `/login`: mobile + password login. Passwords are hashed with Node's
    `crypto.scryptSync` as `salt:key` and compared in `verifyPassword`; the response strips `password`
    off the returned user.
  - `sms.js` — POST `/send` / POST `/verify`: OTP login flow over WhatsApp via whapi.cloud. `/send`
    generates a 4-digit OTP, persists it to `OtpCode` with a 5-minute expiry, and posts the templated
    message (`OtpTemplate`, auto-created on first use) to the whapi.cloud API. `/verify` checks for a
    matching, unused, unexpired `OtpCode` and marks it used.
- `src/lib/prisma.js` — the shared Prisma client. Uses the `driverAdapters` preview feature
  (`@prisma/adapter-pg` over a `pg.Pool`) rather than Prisma's built-in connection handling, and is
  memoized on `global.prisma` outside of `NODE_ENV=production` to survive `--watch` reloads. Always
  import this singleton rather than instantiating a new `PrismaClient`.
- `src/lib/s3.js` — `S3Client` configured with `forcePathStyle: true` for LocalStack/Backblaze
  B2-compatible endpoints; exports `s3Client` and `BUCKET_NAME`.
- `prisma/schema.prisma` — models: `User` (roles: `CUSTOMER`/`ADMIN`/`SELLER`, cart stored as `Json`),
  `Product`, `Order`/`OrderItem`, `Rating`, `Address`, `Coupon`, `OtpTemplate`, `OtpCode`. No `Store`
  model — this is a single-vendor store. Each model has a `// Required for creating a <Model>: ...`
  comment listing the fields a create call must supply — keep these comments in sync when changing
  required fields.
- `prisma/seed.mjs` — standalone seed script (own `PrismaClient`/adapter setup, not `src/lib/prisma.js`).
  All seed data is inlined in this file as plain literals — there is **no** external fixture file to
  import, so seed content is changed here and nowhere else. (It was originally transcribed by hand from
  `mockdata/dummy_data.js`, a copy of the frontend's `assets/assets.js`; that file has been deleted and
  some comments in `seed.mjs` still name its exports.) The script rewrites bare image keys to full
  LocalStack S3 URLs (`toS3Url`) before writing `Product` rows, so `npm run init:s3` must have populated
  the bucket first or the stored URLs point at nothing.

## Notable conventions / gaps to be aware of

- There is no authentication/session middleware — routes are unprotected at the HTTP layer, matching the
  previous Next.js API routes' behavior. Role checks (e.g. admin-only actions) are enforced client-side
  in the frontend only, not here. Don't assume a `request.user` or similar exists.
- IDs are `cuid()`-generated strings (except `User.id`, which is supplied by the caller, and
  `Coupon.code`, which is its own primary key) — don't assume integer/auto-increment IDs anywhere.

## Documentation

Comprehensive implementation guides and API reference:

- **[IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)** — Complete roadmap for implementing all backend APIs and functionalities, organized by phase with detailed checklists and cURL examples.
- **[API_REFERENCE.md](docs/API_REFERENCE.md)** — Detailed endpoint documentation with request/response schemas, error codes, and testing examples for all 7 API categories.
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** — Prisma data models, relationships, field constraints, and query examples.

Frontend API expectations and design notes:

- **[references/api-structure.md](references/api-structure.md)** — Frontend's comprehensive API specification with invocation points and mock data.
- **[references/frontend-architecture.md](references/frontend-architecture.md)** — Frontend architecture and frontend/backend split details.
