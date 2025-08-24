#### Authentication

- `POST /api/v1/login` - Admin login with email and password
- `POST /api/v1/signup` - Admin registration

#### Bucket Management

- `GET /api/v1/buckets` - List all buckets
- `GET /api/v1/buckets/{bucketId}` - Get specific bucket details
- `GET /api/v1/buckets/{bucketId}/files` - List files in bucket
- `GET /api/v1/buckets/{bucketId}/files/{fileId}` - Get specific file details
- `POST /api/v1/buckets/create` - Create new bucket (generates key pair)
- `POST /api/v1/buckets/{bucketId}/upload` - Upload file to bucket

#### Dashboard

- `GET /api/v1/app/dashboard` - Analytics dashboard with stats (returns number of buckets user has, number of files in all buckets, total api calls (upload count on buckets))
- `GET /status` - Service health check (already done)

### Public API Endpoints (`/api`)

#### File Operations

- `POST /api/v1/public/file/upload-uri` - Get upload URL for Cloudflare R2 (requires public key)
- `GET /api/v1/public/file/download` - Get download URL from Cloudflare R2 (requires public key)
- `POST /api/v1/public/file/upload` - Upload file to Cloudflare R2 (requires public key)
