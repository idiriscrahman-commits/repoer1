import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.ts';
import reportRoutes from './routes/reportRoutes.ts';
import analyticsRoutes from './routes/analyticsRoutes.ts';
import exportRoutes from './routes/exportRoutes.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { getIsMongoConnected } from './config/db.ts';

export const createApp = () => {
  const app = express();

  // Basic security and parsing
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health and system status check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      database: getIsMongoConnected() ? 'MongoDB Atlas' : 'Persistent Storage Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/export', exportRoutes);

  // Direct ZIP download of complete source code
  app.get('/api/download/project-zip', (_req, res) => {
    const zipPath = path.resolve(process.cwd(), 'report-management-system.zip');
    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.download(zipPath, 'report-management-system.zip');
    } else {
      res.status(404).json({ success: false, message: 'Project ZIP archive not found.' });
    }
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
