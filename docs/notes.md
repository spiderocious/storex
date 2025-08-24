
- Packages
express-rate-limit for rate limit
zod for validation

"@aws-sdk/client-s3": "^3.485.0",
"@aws-sdk/s3-request-presigner": "^3.842.0",
write out response, logging, utils 
dotenv


There should be a background job service that will handle incrementing the download counter so that the main request is not blocked by a db call.

like:

backgroundJobService.execute(() => {
   CALLBACK
});

backgroundJobService.executeAfter(5000, () => {
   CALLBACK
});


backgroundJobService.executeBy("2023-01-01T00:00:00Z", () => {
  CALLBACK
});


JEST FOR tests
mongoose for mongodb
uuid for unique identifiers
tsconfig-paths for module path mapping
helmet for security
jsonwebtoken for authentication

typescript supported
cors for cross-origin resource sharing


- code quality tools
    - eslint for linting
    - prettier for code formatting
    - husky for git hooks
    - lint-staged for running linters on pre-committed files
    - typescript for type checking

folder structure & instructions
 src, docs, tests


 tests => unit, integration, functional, e2e

 src => {
    server.ts,
    routes,
    middleware,
    controllers,
    services,
    repositories,
    models,
    utils
 }
