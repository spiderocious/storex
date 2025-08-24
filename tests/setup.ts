import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Global setup before all tests
});

afterAll(async () => {
  // Global cleanup after all tests
});

// Extend Jest matchers if needed
// declare global {
//   namespace jest {
//     interface Matchers<R> {
//       // Custom matchers can be defined here
//     }
//   }
// }
