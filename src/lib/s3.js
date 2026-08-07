import { S3Client } from "@aws-sdk/client-s3";

// Destructure variables from process.env for cleaner code
const {
    BUCKET_NAME,
    S3_ENDPOINT,
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_ACCESS_KEY
} = process.env;

export const s3Client = new S3Client({
    region: AWS_REGION,
    endpoint: S3_ENDPOINT,
    forcePathStyle: true, // Essential for LocalStack/Local S3
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID || "test",
        secretAccessKey: AWS_ACCESS_KEY || "test",
    },
});

export { BUCKET_NAME };
