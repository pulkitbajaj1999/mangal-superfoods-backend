#!/bin/bash

CONTAINER_NAME="ms_localstack"
BUCKET_NAME="mangal-superfoods-bucket"
CONTAINER_DATA_PATH="/tmp/sampleimages"

echo "🛠️ Manually triggering S3 setup inside $CONTAINER_NAME..."

# 1. Create Bucket
docker exec -it $CONTAINER_NAME awslocal s3 mb s3://$BUCKET_NAME

# 2. Sync Files
echo "Uploading files from $CONTAINER_DATA_PATH to S3..."
docker exec -it $CONTAINER_NAME awslocal s3 sync $CONTAINER_DATA_PATH s3://$BUCKET_NAME

# 3. Verify
echo "✅ Current S3 Content:"
docker exec -it $CONTAINER_NAME awslocal s3 ls s3://$BUCKET_NAME --recursive