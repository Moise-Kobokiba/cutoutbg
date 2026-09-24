# Security architecture

Uploaded images are untrusted data.

## Upload and parsing
- Accept an allowlist of formats (initially JPEG, PNG, and WebP); reject unknown extensions and MIME mismatches.
- Decode with a maintained image library, inspect the decoded format, dimensions, frame count, and pixel count, and reject decompression bombs and oversized files before full processing.
- Enforce byte, pixel, dimension, and processing-time limits at the API and worker.
- Strip metadata from derived output unless a product requirement says otherwise.
- Process files in isolated, non-root workers with read-only model mounts and no outbound network access.

## Access and abuse
Use authenticated users/API keys, per-user ownership checks on every object and job, short-lived signed URLs, request size limits, and rate limits by identity and IP. Store hashed API keys with prefix/last-used metadata; never store plaintext keys. Add idempotency keys to upload/job creation.

## Storage and lifecycle
Keep originals and results private. Use random object keys, server-side encryption, least-privilege service credentials, and automatic deletion of temporary files. Define a retention policy before implementation; deletion must remove database metadata and both object variants, with an auditable job.

## Secrets and observability
Secrets come from the deployment secret manager, never source control or logs. Redact URLs, tokens, image names, and user data. Log structured job IDs and failure classes, not image contents. Add dependency scanning, image-library patching, malware/format testing, and security review before public upload access.

## Threats to test
MIME spoofing, polyglot files, malformed chunks, EXIF abuse, decompression bombs, huge dimensions, animated inputs, SSRF through metadata, queue flooding, repeated downloads, API-key guessing, unauthorized job IDs, temporary-file leakage, and model-worker escape.
