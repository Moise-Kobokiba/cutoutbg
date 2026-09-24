# Storage design

PostgreSQL stores durable metadata and object keys; S3-compatible object storage stores private binary data; Redis stores transient BullMQ state only.

## Object layout
Use opaque, tenant-scoped keys such as `users/{userId}/images/{imageId}/original` and `users/{userId}/images/{imageId}/result/{resultId}`. Never use the original filename as an authorization boundary. Keep originals and results in private buckets/prefixes.

## Access flow
The API validates an upload, writes metadata, and issues a constrained upload URL or streams to storage. The worker reads through service credentials scoped to the required prefix and writes a result. The API creates short-lived download URLs only after checking ownership.

## Lifecycle
Temporary upload parts and failed-job artifacts expire automatically. Successful assets follow an explicit retention policy. Deletion is asynchronous but observable and retryable. Storage events are not the source of truth for job completion; the worker transaction updates PostgreSQL after the object write is verified.

## Local development
Docker Compose should provide PostgreSQL, Redis, and an S3-compatible service such as MinIO. Local credentials and buckets are disposable and must be documented through `.env.example`, never committed secrets.

## References
- S3 API: https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html
- S3 presigned URLs: https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html
- MinIO: https://min.io/docs/minio/linux/index.html
