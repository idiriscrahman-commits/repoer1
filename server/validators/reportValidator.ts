import { z } from 'zod';

export const ReportCreateSchema = z.object({
  title: z.string().trim().min(3, 'Report title must be at least 3 characters').max(200, 'Title is too long'),
  category: z.string().trim().min(2, 'Category must be specified').max(100),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Report date must be in YYYY-MM-DD format'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  findings: z.string().optional().default(''),
  recommendations: z.string().optional().default(''),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Rejected']).default('Pending'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  tags: z.union([z.array(z.string()), z.string()]).transform((val) => {
    if (Array.isArray(val)) return val.map((s) => s.trim()).filter(Boolean);
    if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  }).default([]),
  reference: z.string().optional().default(''),
  customer: z.string().optional().default(''),
  archived: z.boolean().optional().default(false),
});

export const ReportUpdateSchema = ReportCreateSchema.partial();

export type ReportCreateInput = z.infer<typeof ReportCreateSchema>;
export type ReportUpdateInput = z.infer<typeof ReportUpdateSchema>;
