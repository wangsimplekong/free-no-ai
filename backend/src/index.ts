import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { logger } from './utils/logger';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { detectionRoutes } from './routes/detection.routes';
import { reductionRoutes } from './routes/reduction.routes';
import { aigcRoutes } from './routes/aigc.routes';
import { memberRoutes } from './routes/member.routes';
import { orderRoutes } from './routes/order.routes';
import { paymentRoutes } from './routes/payment.routes';
import { benefitsRoutes } from './routes/benefits.routes';
import { testConnection } from './config/database';
import { requestLoggerMiddleware } from './middlewares/request-logger.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { SchedulerService } from './services/scheduler';

const app = express();
const schedulerService = new SchedulerService();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(requestLoggerMiddleware());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/v1/detection', detectionRoutes);
app.use('/api/v1/reduction', reductionRoutes);
app.use('/api/v1/aigc', aigcRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/benefits', benefitsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: Date.now()
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port || 3000;

async function startServer() {
  try {
    logger.info({
      msg: 'Starting server initialization',
      env: process.env.NODE_ENV,
      port: PORT
    });

    // Test database connection before starting the server
    await testConnection();
    
    // Initialize scheduler service
    schedulerService.initialize();

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Starting graceful shutdown...');
      schedulerService.shutdown();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Starting graceful shutdown...');
      schedulerService.shutdown();
      process.exit(0);
    });
    
    app.listen(PORT, () => {
      logger.info({
        msg: 'Server started successfully',
        port: PORT,
        env: process.env.NODE_ENV
      });
    });
  } catch (error) {
    logger.error({
      msg: 'Failed to start server',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

startServer();