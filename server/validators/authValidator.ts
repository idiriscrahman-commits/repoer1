import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
