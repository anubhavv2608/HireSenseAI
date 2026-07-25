import mongoose from 'mongoose';
import { config } from './index';
import { logger } from './logger';

const MAX_RETRIES = 5;
let currentRetry = 0;

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.database.uri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err instanceof Error ? err.message : String(err)}`);
    });

  } catch (error: unknown) {
    logger.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
    
    if (currentRetry < MAX_RETRIES) {
      currentRetry++;
      logger.info(`Retrying MongoDB connection... (${currentRetry}/${MAX_RETRIES})`);
      setTimeout(connectDB, 5000);
    } else {
      logger.error('Failed to connect to MongoDB after maximum retries. Exiting...');
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected through app termination');
  } catch (error: unknown) {
    logger.error(`Error disconnecting MongoDB: ${error instanceof Error ? error.message : String(error)}`);
  }
};
