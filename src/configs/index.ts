import { config as dotEnvConfig } from 'dotenv';

dotEnvConfig();
export const r2Config = {
  accountId: process.env.R2_ACCOUNT_ID || '',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  bucketName: process.env.R2_BUCKET_NAME || 'daytrack-media',
  publicUrl: process.env.R2_PUBLIC_URL || '',
  region: 'auto', // R2 uses 'auto' region
};

export const configs = {
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'STOREX',
  },
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/file-service',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expire: process.env.JWT_EXPIRE || '1h',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },
  r2: r2Config,
};
