# Mangal Superfoods — Backend

Standalone Express + Prisma (Postgres) API for the Mangal Superfoods storefront. This was split out of
`mangal-superfoods-frontend` (a Next.js app), which now calls this service over HTTP instead of using
Next.js API routes.

## Commands

```bash
npm install                    # install dependencies (postinstall runs prisma generate)
npm run dev                    # start the API with --watch, http://localhost:4000
npm run start                  # run the API without --watch

npm run prisma:generate        # regenerate the Prisma client
npm run prisma:migrate:dev     # create/apply a dev migration
npm run prisma:migrate:deploy  # apply migrations in production
npm run prisma:studio          # open Prisma Studio
npm run prisma:db:push         # push schema changes without a migration
npm run prisma:db:pull         # introspect the DB into the schema
npm run prisma:format          # format schema.prisma
npm run db:seed                # run prisma/seed.mjs
```

Required env vars — see `.env.example`: `PORT`, `FRONTEND_ORIGIN` (CORS allowlist for the frontend's
origin(s)), `DATABASE_URL` (Postgres), `WHAPI_BASE_URL`/`WHAPI_TOKEN` (WhatsApp OTP delivery via
whapi.cloud), and S3-compatible object storage config for product images (`BUCKET_NAME`, `S3_ENDPOINT`,
`AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_ACCESS_KEY`).

`docker-compose.yml` spins up local Postgres + a LocalStack S3 emulator for development; `init-s3.sh`
creates the bucket and syncs `sampleimages/` into it.

## Architecture

- `server.js` — entry point, loads `.env`, starts the Express app.
- `src/app.js` — Express app setup: CORS (allowlist from `FRONTEND_ORIGIN`), JSON body parsing, route
  mounting.
- `src/routes/*.js` — one router per resource, mounted under `/api/<resource>` in `src/app.js`:
  - `products.js` (GET/POST `/`, GET/PUT/DELETE `/:id`) — product images go through `src/lib/s3.js`
    (multipart uploads handled with `multer`, memory storage)
  - `orders.js` (GET/POST `/`, PUT `/:id`)
  - `addresses.js` (GET/POST `/`)
  - `ratings.js` (GET/POST `/`)
  - `coupons.js` (GET/POST `/`)
  - `users.js` (GET/POST/PUT `/`)
  - `auth.js` (POST `/login` — mobile+password login, passwords hashed with Node's `crypto.scryptSync`)
  - `sms.js` (POST `/send`, POST `/verify` — OTP send/verify over WhatsApp via whapi.cloud)
- `src/lib/prisma.js` — Prisma client using the `driverAdapters` preview feature over a `pg.Pool`,
  memoized on `global.prisma` outside production.
- `src/lib/s3.js` — `S3Client` configured for path-style / LocalStack-compatible S3 (e.g. Backblaze B2).
- `prisma/schema.prisma` — models: `User`, `Product`, `Order`/`OrderItem`, `Rating`, `Address`, `Coupon`,
  `OtpTemplate`, `OtpCode`. No `Store` model — this is a single-vendor store.

There is no test suite/framework configured — don't assume Jest/Vitest exists. There is also no
authentication/session middleware yet: routes are unprotected at the HTTP layer, matching the previous
Next.js API routes' behavior (the frontend's client-side role checks are UI-only, not enforced here).
