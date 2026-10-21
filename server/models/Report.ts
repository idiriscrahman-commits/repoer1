import mongoose, { Schema, Document } from 'mongoose';
import type { IReport } from './types.ts';

export interface ReportDocument extends Omit<IReport, '_id'>, Document {}

const ReportSchema = new Schema<ReportDocument>(
  {
    reportNumber: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    reportDate: { type: String, required: true, index: true },
    description: { type: String, required: true },
    findings: { type: String, default: '' },
    recommendations: { type: String, default: '' },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'In Progress', 'Completed', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    tags: [{ type: String, trim: true }],
    reference: { type: String, default: '' },
    customer: { type: String, default: '', index: true, trim: true },
    archived: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound text/search indexing
ReportSchema.index({ title: 'text', description: 'text', findings: 'text', category: 'text' });

export const ReportModel = mongoose.models.Report || mongoose.model<ReportDocument>('Report', ReportSchema);
