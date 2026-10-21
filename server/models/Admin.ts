import mongoose, { Schema, Document } from 'mongoose';
import type { IAdmin } from './types.ts';

export interface AdminDocument extends Omit<IAdmin, '_id'>, Document {}

const AdminSchema = new Schema<AdminDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'admin', enum: ['admin'] },
  },
  {
    timestamps: true,
  }
);

export const AdminModel = mongoose.models.Admin || mongoose.model<AdminDocument>('Admin', AdminSchema);
