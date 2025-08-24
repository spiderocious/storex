File Service Infrastructure

The essence of this service is to server as the backend for file storage and management, providing a robust API for file operations such as upload, download, and metadata retrieval.
this would be a service that will be reused across different applications and services within the organization, promoting consistency and reducing duplication of effort.


Endpoints:

- /app/admin/login (email & password) (POST)
- /app/admin/signup (email & password) (POST)

- /app/buckets (GET)

- /app/buckets/{bucketId} (GET)
- /app/buckets/{bucketId}/files (GET)
- /app/buckets/{bucketId}/files/{fileId} (GET)

- /app/buckets/create (POST) (generates public & private key)

- /app/buckets/{bucketId}/upload (POST)

- /app/dashboard (GET)
  returns all buckets, all files counts, all hit counts, upload & download stats

- /status (GET) returns the status of the service


APIs

- /api/file/upload (POST, TAKES FILE metadata) returns upload uri on cloudfare r2 + file key (uses public key)
- /api/file/download (GET) returns file uri on cloudfare r2 (uses public key)

- /api/files (GET) returns list of files using that key (uses private key)


Tech Stack:

Node, Express, MongoDB, Cloudfare R2, Typescript, 

JWT for token authentication 
public & private key pair for each bucket 
public & private key validation should be kept in the cache.

Architecture:

Domain Driven design setup (repository, services, controller)

logic lives in the services and is orchestrated by the controllers.
repositories handle data access and persistence.