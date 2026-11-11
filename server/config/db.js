import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isMongooseConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_locator';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongooseConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.log('[Database] MongoDB local instance not detected. Falling back to persistent local JSON datastore.');
    console.log('[Database] Ready! All queries, auth, appointments, and seeding will persist to /server/data/store.json.');
    isMongooseConnected = false;
    return false;
  }
};

export const getIsMongoConnected = () => isMongooseConnected;
