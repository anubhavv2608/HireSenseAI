import app from './app';
import { config } from './shared/config';
import { logger } from './shared/config/logger';
import { connectDB, disconnectDB } from './shared/config/database';

const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port} in ${config.env} mode`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force close if it takes too long
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    logger.error(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
};

startServer();
