import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config as dotEnvConfig } from 'dotenv';
import mongoose from 'mongoose';
import { configs } from '@/configs';
import { logger } from '@/utils';

dotEnvConfig();

const app = express();
const PORT = configs.app.port;

app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: configs.rateLimit.windowMs,
  max: configs.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/status', (_req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = configs.db.uri;
    await mongoose.connect(mongoUri);
    logger.log('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.log(`Server is running on port ${PORT}`);
      logger.log(`Environment: ${configs.app.env}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
