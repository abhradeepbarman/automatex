import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, {
        message: 'Name is required',
      })
      .max(255, {
        message: 'Name must be less than 255 characters',
      }),
    email: z
      .string()
      .min(1, {
        message: 'Email is required',
      })
      .refine(
        (email) =>
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
            email,
          ),
        {
          message: 'Invalid email',
        },
      ),
    password: z
      .string()
      .min(1, {
        message: 'Password is required',
      })
      .min(8, {
        message: 'Password must be at least 8 characters long',
      })
      .max(128, {
        message: 'Password must be less than 128 characters',
      })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
          message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
      ),
    confirmPassword: z.string().min(1, {
      message: 'Confirm Password is required',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
