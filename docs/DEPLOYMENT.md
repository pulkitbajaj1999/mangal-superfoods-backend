# Deployment Guide

Complete guide for setting up, configuring, and deploying the Mangal Superfoods Express + Prisma backend API.

---

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Required Environment Variables](#required-environment-variables)
3. [Local Development with Docker](#local-development-with-docker)
4. [Database Setup and Migrations](#database-setup-and-migrations)
5. [S3 Bucket Initialization](#s3-bucket-initialization)
6. [Production Deployment](#production-deployment)
7. [Verification and Testing](#verification-and-testing)
8. [Troubleshooting](#troubleshooting)

---

## Environment Setup

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or **bun** as the alternative package manager)
- **Docker** and **Docker Compose** (for local development)
- **PostgreSQL** client tools (for remote database connections, optional)

### Installation Steps

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd mangal-superfoods-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # This automatically runs `prisma generate` via postinstall
   ```

3. **Create environment configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your values (see next section)
   ```

---

## Required Environment Variables

All required environment variables must be set before running the application. A template is provided in `.env.example`.

### Core Application Variables

| Variable | Type | Description | Example |
|---|---|---|---|
| `PORT` | integer | Port the Express server listens on | `4000` |
| `FRONTEND_ORIGIN` | string | Comma-separated list of allowed CORS origins | `http://localhost:3000,https://example.com` |

### Database Configuration

| Variable | Type | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | string | PostgreSQL connection string (libpq format) | `postgresql://user:password@localhost:6432/store?schema=public` |

Connection string format:
```
postgresql://[user[:password]@][host[:port]][/dbname][?param=value...]
```

**Docker Compose defaults** (see [Local Development](#local-development-with-docker)):
- Host: `localhost`
- Port: `6432` (maps to container's `5432`)
- User: `ravi`
- Password: `ravi@2026`
- Database: `mangal_superfoods_store`

**Production**: Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, Heroku Postgres, etc.). Ensure SSL is enabled and the connection string includes `sslmode=require`:
```
postgresql://user:password@host:5432/dbname?sslmode=require
```

### WhatsApp OTP Configuration

| Variable | Type | Description | Example |
|---|---|---|---|
| `WHAPI_BASE_URL` | string | WhatsApp API gateway base URL | `https://gate.whapi.cloud` |
| `WHAPI_TOKEN` | string | Bearer token for whapi.cloud API authentication | `eyJ0eXAiOiJKV1QiLC...` |

To obtain credentials:
1. Sign up at [whapi.cloud](https://whapi.cloud)
2. Create an API key from the dashboard
3. Generate a Bearer token for your business phone number

### S3-Compatible Object Storage

| Variable | Type | Description | Example |
|---|---|---|---|
| `BUCKET_NAME` | string | S3 bucket name | `mangal-superfoods` |
| `S3_ENDPOINT` | string | S3 endpoint URL (omit `/` at the end) | `https://s3.us-west-004.backblazeb2.com` |
| `AWS_REGION` | string | AWS region code | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | string | S3 access key ID | `ABC123XYZ` |
| `AWS_ACCESS_KEY` | string | S3 secret access key | `wJalrXUtnFEMI/K7MDENG...` |

**S3 Configuration Notes**:
- The app uses `forcePathStyle: true` for compatibility with LocalStack and Backblaze B2
- Images are uploaded to S3 first, and the resulting URLs are stored in the `Product.images` array
- For production, use AWS S3, Backblaze B2, or another S3-compatible provider

### Example `.env` File

```bash
# Core
PORT=4000
FRONTEND_ORIGIN="http://localhost:3000"

# Database
DATABASE_URL="postgresql://ravi:ravi@2026@localhost:6432/mangal_superfoods_store?schema=public"

# WhatsApp OTP
WHAPI_BASE_URL="https://gate.whapi.cloud"
WHAPI_TOKEN="your-token-here"

# S3 Storage
BUCKET_NAME="mangal-superfoods"
S3_ENDPOINT="https://s3.us-west-004.backblazeb2.com"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_ACCESS_KEY="your-secret-key"
```

---

## Local Development with Docker

### Quick Start

The `docker-compose.yml` file provides PostgreSQL and LocalStack (S3 emulator) for local development.

1. **Start services**:
   ```bash
   docker-compose up -d
   ```

   This starts:
   - **PostgreSQL 16** on `localhost:6432`
   - **LocalStack** on `localhost:4566`

2. **Verify services are running**:
   ```bash
   docker-compose ps
   # Expected: localstack and postgres containers in "running" state
   ```

3. **Check container logs** (if needed):
   ```bash
   docker-compose logs postgres
   docker-compose logs localstack
   ```

### Database Connection (Docker)

The compose file creates:
- **User**: `ravi`
- **Password**: `ravi@2026`
- **Database**: `mangal_superfoods_store`
- **Port**: `6432` (host) → `5432` (container)

Use this connection string in your `.env`:
```
DATABASE_URL="postgresql://ravi:ravi@2026@localhost:6432/mangal_superfoods_store?schema=public"
```

### S3 Configuration (Docker)

LocalStack simulates S3 at `http://localhost:4566`.

Update your `.env` for local development:
```bash
BUCKET_NAME="mangal-superfoods-bucket"
S3_ENDPOINT="http://localhost:4566"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="test"
AWS_ACCESS_KEY="test"
```

### Stopping Services

```bash
docker-compose down
```

To also remove data volumes (reset databases):
```bash
docker-compose down -v
```

---

## Database Setup and Migrations

### Initial Setup

After starting Docker services and updating `.env`:

1. **Generate Prisma client**:
   ```bash
   npm run prisma:generate
   ```

2. **Create and apply migrations**:
   ```bash
   npm run prisma:migrate:dev
   ```

   This will:
   - Create a new migration (if needed)
   - Apply all pending migrations to the database
   - Generate the Prisma client

3. **Verify schema was created**:
   ```bash
   npm run prisma:studio
   ```

   This opens an interactive UI at `http://localhost:5555` to inspect your database.

### Migration Workflow

#### Creating a New Migration (Development)

When you modify `prisma/schema.prisma`:

```bash
npm run prisma:migrate:dev --name add_new_field
```

This will:
1. Format the schema file
2. Create a migration file in `prisma/migrations/`
3. Apply the migration to your local database
4. Regenerate the Prisma client

#### Applying Migrations Without Creating (Development)

To apply existing migrations (e.g., after pulling changes):

```bash
npm run prisma:migrate:dev
```

#### Applying Migrations in Production

```bash
npm run prisma:migrate:deploy
```

**Important**: Always test migrations in a staging environment first.

### Schema Introspection

If you modify the database directly (not recommended), synchronize your schema:

```bash
npm run prisma:db:pull
```

This introspects the database and updates `prisma/schema.prisma`.

### Seeding the Database

To populate the database with sample data:

```bash
npm run prisma:db:seed
```

This runs `prisma/seed.mjs`, which:
- Uses sample data inlined directly in the script (no external fixture file)
- Generates LocalStack S3 URLs for product images
- Creates sample users, products, orders, and ratings

To change what gets seeded, edit `prisma/seed.mjs` itself.

---

## S3 Bucket Initialization

### For Local Development (LocalStack)

1. **Ensure LocalStack container is running**:
   ```bash
   docker-compose ps | grep localstack
   ```

2. **Run the S3 initialization script**:
   ```bash
   npm run init:s3
   ```

   Or manually:
   ```bash
   ./init-s3.sh
   ```

   This script:
   - Creates the S3 bucket (`mangal-superfoods-bucket` by default)
   - Syncs sample images from `sampleimages/` into the bucket
   - Verifies the bucket contents

3. **Verify bucket was created**:
   ```bash
   docker exec ms_localstack awslocal s3 ls s3://mangal-superfoods-bucket --recursive
   ```

### For Production (AWS S3, Backblaze B2, etc.)

1. **Create the bucket** in your S3 provider's console or CLI:
   ```bash
   aws s3 mb s3://mangal-superfoods --region us-east-1
   ```

2. **Configure bucket settings**:
   - **CORS** (if frontend is on a different domain):
     ```json
     {
       "CORSRules": [
         {
           "AllowedHeaders": ["*"],
           "AllowedMethods": ["GET", "PUT", "POST"],
           "AllowedOrigins": ["https://your-frontend-domain.com"],
           "MaxAgeSeconds": 3000
         }
       ]
     }
     ```

   - **Public Read Access** (if images should be publicly accessible):
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Sid": "PublicRead",
           "Effect": "Allow",
           "Principal": "*",
           "Action": "s3:GetObject",
           "Resource": "arn:aws:s3:::mangal-superfoods/*"
         }
       ]
     }
     ```

3. **Set environment variables** with your S3 credentials in your production environment.

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables are configured (see [Required Environment Variables](#required-environment-variables))
- [ ] Database migrations have been tested in staging
- [ ] S3 bucket is created and configured
- [ ] CORS origins in `FRONTEND_ORIGIN` include your production frontend domain
- [ ] WHAPI token is valid and has sufficient quota
- [ ] Node.js >= 18.x is available on the deployment platform
- [ ] Secrets (database URL, API keys, credentials) are stored securely (not in git)

### Deployment Options

#### Option 1: Traditional Server / VPS

1. **SSH into your server**:
   ```bash
   ssh user@your-server.com
   cd /var/www/mangal-superfoods-backend
   ```

2. **Pull the latest code**:
   ```bash
   git fetch origin
   git checkout main
   ```

3. **Install dependencies**:
   ```bash
   npm install --omit=dev
   ```

4. **Update environment variables**:
   ```bash
   nano .env  # or your preferred editor
   ```

5. **Apply database migrations**:
   ```bash
   npm run prisma:migrate:deploy
   ```

6. **Start the server** (using a process manager like PM2 or systemd):
   ```bash
   pm2 start server.js --name "mangal-api"
   pm2 save
   pm2 startup
   ```

   Or with systemd:
   ```bash
   sudo systemctl start mangal-superfoods-backend
   ```

#### Option 2: Docker Container

1. **Build the Docker image**:
   ```bash
   docker build -t mangal-superfoods-backend:latest .
   ```

   Example `Dockerfile`:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --omit=dev
   COPY . .
   RUN npm run prisma:generate
   EXPOSE 4000
   CMD ["npm", "start"]
   ```

2. **Push to a container registry** (Docker Hub, ECR, etc.):
   ```bash
   docker tag mangal-superfoods-backend:latest your-registry/mangal-superfoods-backend:latest
   docker push your-registry/mangal-superfoods-backend:latest
   ```

3. **Deploy using Docker Compose or Kubernetes** with your environment variables and mounted volumes for database and S3 configs.

#### Option 3: Heroku / Platform-as-a-Service

1. **Create a Procfile**:
   ```
   web: npm start
   release: npm run prisma:migrate:deploy
   ```

2. **Deploy**:
   ```bash
   git push heroku main
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set PORT=4000 FRONTEND_ORIGIN="https://your-frontend.herokuapp.com" DATABASE_URL="..." ...
   ```

### Production Database Setup

1. **Provision a PostgreSQL database** (AWS RDS, Google Cloud SQL, Heroku Postgres, etc.)
2. **Update `DATABASE_URL`** with your production connection string (ensure SSL is enabled):
   ```
   postgresql://user:password@prod-db-host.com:5432/mangal_superfoods?sslmode=require
   ```
3. **Apply migrations**:
   ```bash
   npm run prisma:migrate:deploy
   ```

### Production S3 Setup

1. **Create an S3 bucket** in your chosen provider
2. **Set environment variables**:
   ```bash
   BUCKET_NAME="mangal-superfoods"
   S3_ENDPOINT="https://s3.us-west-004.backblazeb2.com"  # or your provider's endpoint
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your-production-key-id"
   AWS_ACCESS_KEY="your-production-secret-key"
   ```

### Monitoring and Logging

- **Application logs**: Check stdout/stderr or your logging service (CloudWatch, Datadog, etc.)
- **Database logs**: Monitor slow queries and connection issues via your database provider
- **S3 access logs**: Enable S3 access logging to track image uploads
- **Health check endpoint** (optional): Add a `/health` endpoint to monitor API availability

---

## Verification and Testing

### Local Development

1. **Start the development server**:
   ```bash
   npm run dev
   ```

   Expected output:
   ```
   Listening on http://localhost:4000
   ```

2. **Test a basic endpoint**:
   ```bash
   curl http://localhost:4000/api/products
   ```

3. **Check database connection**:
   ```bash
   npm run prisma:studio
   # Opens at http://localhost:5555
   ```

### Testing Key Features

#### Users API
```bash
# Create a user
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"id":"user123","mobile":"9876543210","password":"test123","role":"CUSTOMER"}'

# Get user
curl http://localhost:4000/api/users/user123
```

#### Products API
```bash
# Get all products
curl http://localhost:4000/api/products

# Create a product (with image upload)
curl -X POST http://localhost:4000/api/products \
  -F "name=Test Product" \
  -F "price=100" \
  -F "description=A test product" \
  -F "images=@path/to/image.jpg"
```

#### Orders API
```bash
# Create an order
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"user123",
    "items":[{"productId":"prod1","quantity":2}],
    "shippingAddress":{"..."}: "..."}
  }'

# Get orders for a user
curl "http://localhost:4000/api/orders?userId=user123"
```

#### SMS/OTP API
```bash
# Send OTP
curl -X POST http://localhost:4000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}'

# Verify OTP
curl -X POST http://localhost:4000/api/sms/verify \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","code":"1234"}'
```

### Production Verification

1. **Test endpoints from your frontend domain** (to verify CORS)
2. **Monitor error rates** in your logging service
3. **Check S3 connectivity** by uploading a product image
4. **Verify database backups** are being created
5. **Load test** with realistic user volume

---

## Troubleshooting

### Common Issues

#### Database Connection Error

**Error**: `error: connect ECONNREFUSED 127.0.0.1:6432`

**Solution**:
1. Verify Docker containers are running: `docker-compose ps`
2. Check `DATABASE_URL` in `.env` matches the compose config
3. Restart Docker services: `docker-compose restart postgres`
4. Verify Docker volume wasn't corrupted: `docker-compose down -v && docker-compose up -d`

#### Prisma Migration Failure

**Error**: `X migration steps execution failed`

**Solution**:
1. Check that no other process is using the database
2. Verify database user has sufficient permissions
3. Try rolling back: `npx prisma migrate resolve --rolled-back <migration-name>`
4. Check Prisma logs: `npx prisma migrate status`

#### S3 Upload Failures

**Error**: `NoSuchBucket` or `AccessDenied` from S3

**Solution**:
1. Verify S3 credentials in `.env`
2. Check bucket exists: `aws s3 ls --profile your-profile` (or `docker exec ms_localstack awslocal s3 ls` for LocalStack)
3. Verify bucket name matches `BUCKET_NAME` env var
4. Check S3 IAM permissions (for AWS)
5. Verify CORS is configured (for production)

#### LocalStack Not Running

**Error**: `connect ECONNREFUSED 127.0.0.1:4566`

**Solution**:
1. Start LocalStack: `docker-compose up -d localstack`
2. Wait 10 seconds for it to fully initialize
3. Check logs: `docker-compose logs localstack`
4. Reset: `docker-compose down -v && docker-compose up -d`

#### CORS Errors in Frontend

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Check `FRONTEND_ORIGIN` in `.env` includes your frontend URL
2. Ensure no trailing slash: `http://localhost:3000`, not `http://localhost:3000/`
3. For multiple origins, use comma-separated list: `http://localhost:3000,https://example.com`
4. Restart the backend server for changes to take effect

#### Port Already in Use

**Error**: `listen EADDRINUSE :::4000`

**Solution**:
1. Find process using port: `lsof -i :4000` (macOS/Linux) or `netstat -ano | findstr :4000` (Windows)
2. Kill the process: `kill -9 <PID>`
3. Or change `PORT` in `.env` to an available port

#### WhatsApp OTP Not Sending

**Error**: `API request to whapi.cloud failed`

**Solution**:
1. Verify `WHAPI_TOKEN` is correct
2. Check that your business number is verified in whapi.cloud
3. Verify monthly quota hasn't been exceeded
4. Check whapi.cloud status page

### Database Inspection

#### Using Prisma Studio
```bash
npm run prisma:studio
# Opens UI at http://localhost:5555
```

#### Using psql (PostgreSQL CLI)
```bash
psql postgresql://ravi:ravi@2026@localhost:6432/mangal_superfoods_store
# Connect to the database and run SQL queries
```

### Viewing Logs

#### Development
```bash
npm run dev
# Logs appear in the terminal
```

#### Docker Containers
```bash
docker-compose logs -f postgres
docker-compose logs -f localstack
```

#### PM2 (if using process manager)
```bash
pm2 logs mangal-api
pm2 logs mangal-api --err
```

---

## Next Steps

- **Frontend Integration**: Ensure the frontend calls the correct API endpoints (see `docs/API_REFERENCE.md`)
- **Monitoring**: Set up error tracking (Sentry, DataDog, etc.) and performance monitoring
- **Backup Strategy**: Configure automated database backups
- **CI/CD**: Set up GitHub Actions or similar for automated testing and deployment
- **Security**: Enable database SSL, API authentication/authorization if needed

For detailed API documentation, see [API_REFERENCE.md](API_REFERENCE.md).

---

**Last Updated:** 2026-08-08
