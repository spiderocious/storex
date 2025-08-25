# File Service Infrastructure

A production-ready file storage and management service built with TypeScript, Express, and MongoDB, featuring Cloudflare R2 integration for scalable object storage. This service implements domain-driven design principles with comprehensive security, caching, and optimization features.

## 🚀 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware composition
- **Database**: MongoDB with Mongoose ODM
- **Object Storage**: Cloudflare R2 (S3-compatible)
- **Authentication**: JWT + API Key authentication
- **Validation**: Express-validator with custom rules
- **Testing**: Jest with multi-tier testing strategy
- **Build System**: TypeScript compiler with tsc-alias for path resolution

## 📋 Features

### Core Functionality

- **File Operations**: Upload, download, streaming, metadata management
- **Bucket Management**: Multi-tenant bucket system with public/private keys
- **User Authentication**: JWT-based admin authentication + API key access
- **Presigned URLs**: Secure direct-to-R2 upload/download URLs with configurable expiration
- **File Streaming**: Direct file streaming for large files without memory buffering
- **Caching Layer**: Multi-level caching for performance optimization

### Enterprise Features

- **Rate Limiting**: Configurable per-IP rate limiting
- **Security Headers**: Helmet.js integration for security headers
- **Input Validation**: Comprehensive request validation with sanitization
- **Error Handling**: Intelligent error mapping with consistent responses
- **Monitoring**: Request logging and performance metrics
- **CORS**: Configurable cross-origin resource sharing

## 🏗️ Architecture Overview

### Domain-Driven Design Structure

The application follows a **repository-service pattern** with clear separation of concerns:

```
src/
├── controllers/     # Request handling and response formatting
├── services/        # Business logic and orchestration
│   ├── core/       # Service implementations
│   ├── impl/       # Service interfaces
│   └── util/       # Utility services (R2, cache, etc.)
├── repositories/    # Data access layer
│   ├── core/       # Repository implementations
│   ├── impl/       # Repository interfaces
├── middleware/      # Authentication and validation
├── models/         # MongoDB schemas and interfaces
├── utils/          # Shared utilities and abstractions
├── routes/         # Route definitions and mapping
├── validators/     # Input validation rules
└── types/          # TypeScript type definitions
```

### Logic Separation Example

Business logic is properly separated across layers:

```typescript
// Controller Layer - Request/Response handling
export class AppController {
  getBucket = controllerWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { bucketId } = req.params;
    const userId = req.user?.id;

    const bucket = await bucketService.getBucketById(bucketId);

    // Authorization check
    if (bucket?.ownerId !== userId) {
      throw new Error('Bucket not found or access denied');
    }

    SuccessResponse(res, 'Bucket retrieved successfully', { bucket });
  });
}

// Service Layer - Business logic
class BucketService implements BucketServiceImpl {
  async getBucketById(bucketId: string): Promise<IBucket | null> {
    // Validation
    if (!bucketId || bucketId.trim() === '') {
      throw new Error('Bucket ID is required');
    }

    // Delegate to repository
    return await bucketRepository.getBucketByID(bucketId);
  }
}

// Repository Layer - Data access
class BucketRepository implements BucketRepositoryImpl {
  async getBucketByID(bucketID: string): Promise<IBucket | null> {
    return Bucket.findOne({ id: bucketID });
  }
}
```

## 🛠️ Key Abstractions and Utilities

### Controller Wrapper Pattern

Eliminates boilerplate code with intelligent error mapping:

```typescript
// Automatic error handling based on message patterns
const DEFAULT_ERROR_MAPPINGS: ErrorMappingRule[] = [
  {
    condition: msg => msg.includes('already exists') || msg.includes('duplicate'),
    handler: (res, msg) => ConflictResponse(res, msg),
  },
  {
    condition: msg => msg.includes('not found'),
    handler: (res, msg) => NotFoundResponse(res, msg),
  },
  // ... more intelligent mappings
];
```

### Dynamic Route Mapping System

Type-safe route configuration with middleware composition:

```typescript
// Route definition
const baseRoutes: RouteHandlerType[] = [
  {
    method: 'get',
    path: '/buckets/:bucketId/files',
    handler: appController.getBucketFiles,
    middlewares: [bucketIdValidation],
  },
];

// Automatic middleware application
export const appRouter = baseRoutes.map(route => ({
  ...route,
  middlewares: [LoggedInMiddleware, ...(route.middlewares ?? [])],
}));
```

### Advanced Caching Strategy

Cache-through pattern with TTL management:

```typescript
export const getFromCache = async <T>(
  key: string,
  executor: () => Promise<T>,
  options?: CacheOptions
): Promise<T> => {
  const value = cache.get<T>(key);
  if (value !== undefined) {
    return value;
  }

  const result = await executor();
  if (options?.expiresIn) {
    cache.set(key, result, Math.ceil(options.expiresIn / 1000));
  }
  return result;
};
```

**Caching Applications:**

- **Download URLs**: 1-hour cache for presigned R2 URLs
- **User Data**: Cached in authentication middleware
- **Database Queries**: Service-level query result caching

## 🔧 Optimizations and Performance

### Database Optimizations

- **Strategic Indexing**: Compound indexes on frequently queried fields
- **Connection Pooling**: Mongoose connection optimization
- **Aggregate Queries**: Efficient stats calculation for dashboard

### R2 Integration Optimizations

- **Presigned URLs**: Direct client-to-R2 upload/download (bypasses server)
- **File Streaming**: Memory-efficient streaming for large files
- **Connection Management**: Singleton R2 client with connection reuse

### Application-Level Optimizations

- **Path Alias Resolution**: Clean imports with `@/` prefixes, compiled to relative paths
- **Middleware Composition**: Efficient request processing pipeline
- **Response Caching**: Intelligent caching of expensive operations
- **Rate Limiting**: Prevents abuse while maintaining performance

## 🧪 Testing Strategy

Multi-tier testing approach for comprehensive coverage:

```
tests/
├── unit/          # Service and utility unit tests
│   ├── file.service.test.ts
│   ├── bucket.service.test.ts
│   └── logger.test.ts
├── functional/    # End-to-end business flow tests
│   ├── auth.service.test.ts
│   └── user.service.test.ts
└── setup.ts       # Test environment configuration
```

**Testing Patterns:**

- **Dependency Mocking**: Comprehensive mocking of external dependencies
- **Edge Case Coverage**: Validation of boundary conditions and error paths
- **Business Logic Testing**: Core functionality verification
- **Integration Testing**: Database and external service integration

**Test Commands:**

```bash
npm run test              # Run all tests
npm run test:unit         # Unit tests only
npm run test:functional   # Functional tests only
npm run test:coverage     # Generate coverage report
npm run test:watch        # Watch mode for development
```

## 🔒 Security Architecture

### Multi-Layer Security Implementation

1. **Application Security**
   - Helmet.js for security headers
   - CORS configuration
   - Rate limiting (configurable per IP)
   - Request size limits

2. **Authentication & Authorization**
   - JWT tokens for admin users
   - Public/private key pairs for API access
   - Bucket-level access control
   - Token expiration management

3. **Input Validation**
   - Express-validator integration
   - MIME type validation
   - File size limits (100MB default)
   - SQL injection prevention

4. **Data Security**
   - Password hashing with bcrypt
   - Secure token generation
   - Environment-based configuration
   - No sensitive data in logs

## 🌐 API Endpoints

### Admin Routes (JWT Authentication)

```
POST /api/v1/auth/login          # User authentication
POST /api/v1/auth/signup         # User registration

GET  /api/v1/buckets            # List user buckets
POST /api/v1/buckets/create     # Create new bucket
GET  /api/v1/buckets/:id        # Get bucket details
GET  /api/v1/buckets/:id/files  # List bucket files

GET  /api/v1/app/dashboard      # Analytics dashboard
```

### Public API Routes (API Key Authentication)

```
POST /api/v1/public/file/upload-uri     # Get presigned upload URL
GET  /api/v1/public/file/download-uri/:fileId  # Get presigned download URL
POST /api/v1/public/file/upload         # Direct file upload (multipart)
GET  /api/v1/public/file/download/:fileId       # Direct file streaming
GET  /api/v1/public/file/info           # Get file metadata
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB instance
- Cloudflare R2 account (or S3-compatible storage)

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd file-service-infra
npm install
```

2. **Configure environment variables:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Build and start the service:**

```bash
npm run build    # Compile TypeScript and resolve path aliases
npm start        # Start production server
```

### Development Mode

```bash
npm run dev      # Start with hot reload and TypeScript compilation
```

### Quality Checks

```bash
npm run lint          # ESLint code analysis
npm run format        # Prettier code formatting
npm run type-check    # TypeScript type checking
```

## 📁 Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=8020

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/file-service

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your_public_url

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=360000000

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🏃‍♂️ Deployment

### Production Build

```bash
npm run build    # TypeScript compilation + path alias resolution
npm start        # Start production server
```

### Build Process

1. **TypeScript Compilation**: `tsc` compiles TypeScript to JavaScript
2. **Path Alias Resolution**: `tsc-alias` transforms `@/` imports to relative paths
3. **Output**: Compiled code in `dist/` directory with proper module resolution

### Health Check

```bash
curl http://localhost:8020/api/status
```

---

Built with ❤️ using modern TypeScript patterns and enterprise-grade architecture principles.
