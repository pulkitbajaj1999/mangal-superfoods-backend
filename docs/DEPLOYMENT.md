# Mangal Superfoods Backend - Deployment Guide

Complete guide for setting up, deploying, and running the Mangal Superfoods backend API.

---

## Table of Contents

1. [Development Setup](#development-setup)
2. [Docker Environment](#docker-environment)
3. [Database Setup](#database-setup)
4. [S3 Storage Setup](#s3-storage-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Server](#running-the-server)
7. [Production Deployment](#production-deployment)
8. [Monitoring & Logging](#monitoring--logging)

---

## Development Setup

### Prerequisites

- **Node.js:** v16+ (check with `node --version`)
- **npm:** v7+ (check with `npm --version`)
- **Docker:** v20+ for local database (optional, can use local PostgreSQL)
- **Git:** For version control

### Quick Start (5 minutes)

```bash
# 1. Clone the repository
cd /path/to/mangal-superfoods-backend

# 2. Install dependencies
npm install

# 3. Start Docker containers (Postgres + LocalStack S3)
docker-compose up -d

# 4. Create and apply database migrations
npm run prisma:migrate:dev --name init

# 5. Seed database with sample data
npm run db:seed

# 6. Initialize S3 bucket and upload sample images
npm run init:s3

# 7. Start development server (with auto-reload)
npm run dev
```

Server will be running at `http://localhost:4000`

---

## Docker Environment

### docker-compose.yml

The project includes `docker-compose.yml` to spin up:
- **PostgreSQL** on port 5432
- **LocalStack** (AWS S3 emulator) on port 4566

### Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

### Troubleshooting Docker

```bash
# Check if containers are running
docker-compose ps

# Rebuild containers
docker-compose build

# View PostgreSQL logs
docker-compose logs postgres

# View LocalStack logs
docker-compose logs localstack
```

---

## Database Setup

### PostgreSQL Connection

**Development:**
```
postgresql://postgres:postgres@localhost:5432/mangal_superfoods
```

**Connection String Environment Variable:**
```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Migrations

Prisma migrations are version-controlled and repeatable.

```bash
# Create a new migration after schema changes
npm run prisma:migrate:dev --name descriptive_name

# Apply migrations (development)
npm run prisma:migrate:dev

# Apply migrations (production)
npm run prisma:migrate:deploy

# Reset database (DESTROYS DATA)
npm run prisma:migrate:reset

# View migration history
npm run prisma:studio  # Opens GUI
```

### Seed Database

Sample data is loaded from `mockdata/dummy_data.js`:

```bash
# Seed with dummy data
npm run db:seed

# Run seed manually
node prisma/seed.mjs
```

**Seed includes:**
- 5 sample users (with test mobile numbers)
- 20 sample products (electronics + superfoods)
- 5 sample coupons
- 2 sample orders with items
- 6 sample ratings

---

## S3 Storage Setup

### LocalStack S3 (Development)

LocalStack emulates AWS S3 locally.

```bash
# Create bucket and upload sample images
npm run init:s3

# This script:
# 1. Creates bucket named "mangal-superfoods"
# 2. Uploads sample images from sampleimages/
# 3. Outputs image URLs for testing
```

### S3 Configuration

**Development (LocalStack):**
```
S3_ENDPOINT=http://localhost:4566
BUCKET_NAME=mangal-superfoods
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_ACCESS_KEY=test
```

**Production (AWS S3 or Backblaze B2):**
```
S3_ENDPOINT=https://s3.us-west-1.amazonaws.com  # AWS
# OR
S3_ENDPOINT=https://s3.us-west-004.backblazeb2.com  # Backblaze B2
BUCKET_NAME=your-production-bucket
AWS_REGION=us-west-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_ACCESS_KEY=your_secret_access_key
```

### Manual S3 Testing

```bash
# List buckets
aws s3 ls --endpoint-url http://localhost:4566

# List objects in bucket
aws s3 ls s3://mangal-superfoods --endpoint-url http://localhost:4566

# Upload file manually
aws s3 cp image.jpg s3://mangal-superfoods/ --endpoint-url http://localhost:4566
```

---

## Environment Configuration

### .env File

Create `.env` in the project root:

```bash
# Server
PORT=4000
NODE_ENV=development

# Frontend CORS
FRONTEND_ORIGIN="http://localhost:3000,http://localhost:3001"

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mangal_superfoods"

# WhatsApp OTP (whapi.cloud)
WHAPI_BASE_URL="https://gate.whapi.cloud"
WHAPI_TOKEN="your_whapi_token_here"

# S3 Storage
BUCKET_NAME="mangal-superfoods"
S3_ENDPOINT="http://localhost:4566"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="test"
AWS_ACCESS_KEY="test"
```

### Environment Variables Reference

| Variable | Type | Required | Example | Note |
|----------|------|----------|---------|------|
| PORT | number | No | 4000 | Server port (default 4000) |
| NODE_ENV | string | No | development | dev/prod mode |
| FRONTEND_ORIGIN | string | Yes | http://localhost:3000 | Comma-separated CORS origins |
| DATABASE_URL | string | Yes | postgresql://... | Postgres connection string |
| WHAPI_BASE_URL | string | No | https://gate.whapi.cloud | WhatsApp API base URL |
| WHAPI_TOKEN | string | No | token_here | WhatsApp API token |
| BUCKET_NAME | string | Yes | mangal-superfoods | S3 bucket name |
| S3_ENDPOINT | string | Yes | http://localhost:4566 | S3 endpoint URL |
| AWS_REGION | string | Yes | us-east-1 | AWS region |
| AWS_ACCESS_KEY_ID | string | Yes | test | AWS access key |
| AWS_ACCESS_KEY | string | Yes | test | AWS secret key |

---

## Running the Server

### Development Mode (With Auto-Reload)

```bash
npm run dev
```

- Watches file changes
- Auto-restarts server
- Debug-friendly error messages
- Prisma client memoized for stability

### Production Mode

```bash
npm start
```

- No auto-reload
- Optimized for performance
- Should run with process manager (PM2, systemd)

### Health Check

```bash
curl http://localhost:4000/health
# Response: { "status": "ok" }
```

---

## Production Deployment

### Recommended Stack

- **App Server:** Node.js on AWS EC2, Heroku, or similar
- **Database:** AWS RDS PostgreSQL or managed provider
- **Storage:** AWS S3, Backblaze B2, or Wasabi
- **CDN:** CloudFront for images (optional)
- **Process Manager:** PM2, systemd, or Docker
- **Monitoring:** CloudWatch, DataDog, or New Relic

### Heroku Deployment

```bash
# Create Heroku app
heroku create mangal-superfoods-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set FRONTEND_ORIGIN="https://mangalsuperfoods.com"
heroku config:set WHAPI_TOKEN="your_token"
heroku config:set AWS_ACCESS_KEY_ID="..."
heroku config:set AWS_ACCESS_KEY="..."

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Docker Deployment

**Build Docker image:**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
```

**Build and run:**
```bash
# Build image
docker build -t mangal-superfoods-api .

# Run container
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  -e FRONTEND_ORIGIN="https://mangalsuperfoods.com" \
  -e AWS_ACCESS_KEY_ID="..." \
  -e AWS_ACCESS_KEY="..." \
  mangal-superfoods-api
```

### Environment-Specific .env Files

**Development (.env.development):**
```bash
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mangal_superfoods
S3_ENDPOINT=http://localhost:4566
```

**Staging (.env.staging):**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pwd@staging-db.aws.com:5432/mangal_superfoods
S3_ENDPOINT=https://s3.amazonaws.com
WHAPI_TOKEN=staging_token_here
```

**Production (.env.production):**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pwd@prod-db.aws.com:5432/mangal_superfoods
S3_ENDPOINT=https://s3.amazonaws.com
WHAPI_TOKEN=prod_token_here
FRONTEND_ORIGIN=https://mangalsuperfoods.com
```

---

## Monitoring & Logging

### PM2 Process Manager (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start app with PM2
pm2 start npm --name "mangal-api" -- start

# View logs
pm2 logs mangal-api

# Monitor
pm2 monit

# Enable auto-start on system reboot
pm2 startup
pm2 save
```

### Application Logging

Logs are output to console:

```bash
# Development (with debug info)
npm run dev

# Production (with PM2)
pm2 logs mangal-api

# Redirect to file
npm start > app.log 2>&1 &
```

### Health Monitoring

```bash
# Basic health check
curl http://localhost:4000/health

# Uptime monitoring with cron
*/5 * * * * curl -s http://localhost:4000/health || alert
```

### Database Monitoring

```bash
# Check Prisma Studio (development)
npm run prisma:studio

# Query count and performance
psql -h localhost -U postgres -d mangal_superfoods
SELECT * FROM pg_stat_statements;
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 4000
lsof -i :4000

# Kill process
kill -9 <PID>

# Or change port
PORT=5000 npm start
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose ps

# Test connection
psql postgresql://postgres:postgres@localhost:5432/mangal_superfoods

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

### S3 Upload Fails

```bash
# Check LocalStack is running
curl http://localhost:4566

# Check bucket exists
aws s3 ls --endpoint-url http://localhost:4566

# Re-initialize S3
npm run init:s3
```

### Prisma Client Out of Sync

```bash
# Regenerate Prisma client
npm run prisma:generate

# Or reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Backup & Recovery

### Database Backup

```bash
# Backup PostgreSQL
pg_dump postgresql://postgres:postgres@localhost/mangal_superfoods > backup.sql

# Restore from backup
psql postgresql://postgres:postgres@localhost/mangal_superfoods < backup.sql
```

### S3 Backup

```bash
# Sync S3 to local
aws s3 sync s3://mangal-superfoods ./s3-backup --endpoint-url http://localhost:4566

# Sync local to S3
aws s3 sync ./uploads s3://mangal-superfoods --endpoint-url http://localhost:4566
```

---

## Performance Optimization

### Database Query Optimization

```bash
# Enable query logging in Prisma
DATABASE_DEBUG=* npm run dev

# Analyze slow queries in Postgres
EXPLAIN ANALYZE SELECT * FROM "Product" WHERE category = 'Dry Fruits';
```

### Connection Pooling

Production connection string should use connection pooling:

```
postgresql://user:password@localhost:5432/mangal_superfoods?schema=public&pool_size=10&max_overflow=20
```

### API Rate Limiting

Consider adding rate limiting middleware:

```bash
npm install express-rate-limit
```

---

## Checklist for Production

- [ ] Update FRONTEND_ORIGIN to production domain
- [ ] Set NODE_ENV=production
- [ ] Use production database (AWS RDS, etc.)
- [ ] Use production S3 bucket
- [ ] Set WHAPI_TOKEN for SMS
- [ ] Enable HTTPS/SSL
- [ ] Set up error logging (Sentry, etc.)
- [ ] Configure automatic backups
- [ ] Set up monitoring alerts
- [ ] Run database migrations
- [ ] Test all endpoints
- [ ] Load test API
- [ ] Document deployment procedures

---

**Last Updated:** 2026-08-08
