import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'report_system_super_secret_jwt_key_2026_xyz',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  ADMIN_NAME: process.env.ADMIN_NAME || 'System Administrator',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@reportmanagement.internal',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminPassword2026!',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '*',
};
