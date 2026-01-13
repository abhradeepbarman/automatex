import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .nonempty('Name is required')
      .max(255, 'Name must be less than 255 characters'),

    email: z.string().nonempty('Email is required').email('Invalid email'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Password must contain uppercase, lowercase, number, and special character',
      ),

    confirmPassword: z.string().nonempty('Confirm Password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().nonempty('Email is required').email('Invalid email'),
  password: z.string().nonempty('Password is required'),
});
