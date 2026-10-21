import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { LoginSchema } from '../validators/authValidator.ts';
import { DataStore } from '../services/dataStore.ts';
import { generateToken } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.issues.map((e: { message: string }) => e.message),
      });
      return;
    }

    const { email, password } = parseResult.data;
    const admin = await DataStore.findAdminByEmail(email);

    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
      return;
    }

    const token = generateToken(admin);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[AuthController] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  res.json({
    success: true,
    admin: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
};
