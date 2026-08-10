#!/bin/bash

CONTAINER_NAME="ms_localstack"
CONTAINER_DATA_PATH="/tmp/sampleimages"

# Read BUCKET_NAME from .env so the bucket created here always matches the one
# the API uploads to. Falls back to the default if .env is absent.
if [ -f "$(dirname "$0")/.env" ]; then
  ENV_BUCKET_NAME=$(grep -E '^BUCKET_NAME=' "$(dirname "$0")/.env" | tail -1 | cut -d= -f2- | tr -d '"'"'"' \r')
fi
BUCKET_NAME="${ENV_BUCKET_NAME:-mangal-superfoods-bucket}"
echo "Using bucket: $BUCKET_NAME"

echo "🛠️ Manually triggering S3 setup inside $CONTAINER_NAME..."

# 1. Create Bucket
docker exec $CONTAINER_NAME awslocal s3 mb s3://$BUCKET_NAME

# 2. Sync Files
echo "Uploading files from $CONTAINER_DATA_PATH to S3..."
docker exec $CONTAINER_NAME awslocal s3 sync $CONTAINER_DATA_PATH s3://$BUCKET_NAME

# 3. Verify
echo "✅ Current S3 Content:"
docker exec $CONTAINER_NAME awslocal s3 ls s3://$BUCKET_NAME --recursive