#### Authentication

- `POST /app/admin/login` - Admin login with email and password
- `POST /app/admin/signup` - Admin registration

#### Bucket Management

- `GET /app/buckets` - List all buckets
- `GET /app/buckets/{bucketId}` - Get specific bucket details
- `GET /app/buckets/{bucketId}/files` - List files in bucket
- `GET /app/buckets/{bucketId}/files/{fileId}` - Get specific file details
- `POST /app/buckets/create` - Create new bucket (generates key pair)
- `POST /app/buckets/{bucketId}/upload` - Upload file to bucket

#### Dashboard

- `GET /app/dashboard` - Analytics dashboard with stats
- `GET /status` - Service health check

### Public API Endpoints (`/api`)

#### File Operations

- `POST /api/file/upload` - Get upload URL for Cloudflare R2 (requires public key)
- `GET /api/file/download` - Get download URL from Cloudflare R2 (requires public key)
- `GET /api/files` - List files for bucket (requires private key)
