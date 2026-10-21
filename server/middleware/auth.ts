import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.ts';
import { DataStore } from '../services/dataStore.ts';
import type { IAdmin } from '../models/types.ts';

export interface AuthenticatedRequest extends Request {
  user?: IAdmin;
}

// In-memory rate limiter for login attempts (5 attempts per minute per IP)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export const loginRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxAttempts = 10;

  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (entry.count >= maxAttempts) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      success: false,
      message: `Too many login attempts. Please wait ${retryAfter} seconds before trying again.`,
    });
    return;
  }

  entry.count++;
  loginAttempts.set(ip, entry);
  next();
};

export const generateToken = (admin: IAdmin): string => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    },
    ENV.JWT_SECRET,
    {
      expiresIn: '24h',
    }
  );
};

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token missing or invalid format.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: string; email: string; role: string };
    const admin = await DataStore.getAdminById(decoded.id);

    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid session. Admin account does not exist or has been revoked.',
      });
      return;
    }

    req.user = admin;
    next();
  } catch (error) {
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or tampered token.',
    });
  }
};
