import mongoose from 'mongoose';
import { ENV } from './env.ts';

let isMongoConnected = false;

export const connectDB = async (): Promise<boolean> => {
  if (!ENV.MONGO_URI || ENV.MONGO_URI.trim() === '') {
    console.log('[Database] No MONGO_URI specified. Operating with persistent internal storage engine.');
    return false;
  }

  try {
    console.log('[Database] Connecting to MongoDB Atlas...');
    await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('[Database] Connected successfully to MongoDB Atlas.');
    return true;
  } catch (error) {
    console.warn('[Database] MongoDB Atlas connection failed. Falling back to persistent internal storage engine:', (error as Error).message);
    isMongoConnected = false;
    return false;
  }
};

export const getIsMongoConnected = (): boolean => isMongoConnected;
