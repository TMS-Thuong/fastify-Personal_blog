import { Gender } from '@prisma/client';
import { FastifySchema } from 'fastify';
import { z } from 'zod';

import { AuthErrorMessages } from './auth.error';

export const registerUserZodSchema = z.object({
  email: z.string().min(1, AuthErrorMessages.EMAIL_REQUIRED).email(AuthErrorMessages.EMAIL_INVALID),
  password: z
    .string()
    .min(8, AuthErrorMessages.PASSWORD_MIN_LENGTH)
    .max(16, AuthErrorMessages.PASSWORD_MAX_LENGTH)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,16}$/, AuthErrorMessages.PASSWORD_PATTERN),
  firstName: z.string().min(1, AuthErrorMessages.FIRST_NAME_REQUIRED),
  lastName: z.string().min(1, AuthErrorMessages.LAST_NAME_REQUIRED),
  birthDate: z.coerce.date({
    required_error: AuthErrorMessages.BIRTH_DATE_REQUIRED,
    invalid_type_error: AuthErrorMessages.BIRTH_DATE_INVALID,
  }),
  gender: z
    .number()
    .int()
    .min(0, AuthErrorMessages.GENDER_INVALID)
    .max(2, AuthErrorMessages.GENDER_INVALID)
    .transform((val) => {
      if (val === 0) return Gender.MALE;
      if (val === 1) return Gender.FEMALE;
      return Gender.OTHER;
    }),
});
export const verifyEmailZodSchema = z.object({
  token: z.string().min(1, AuthErrorMessages.TOKEN_REQUIRED),
});
export const loginZodSchema = z.object({
  email: z.string().min(1, AuthErrorMessages.EMAIL_REQUIRED).email(AuthErrorMessages.EMAIL_INVALID),
  password: z.string().min(1, AuthErrorMessages.PASSWORD_REQUIRED),
});
export const refreshTokenZodSchema = z.object({
  refreshToken: z.string().min(1, AuthErrorMessages.REFRESH_TOKEN_REQUIRED),
});
export const forgotPasswordZodSchema = z.object({
  email: z.string().min(1, AuthErrorMessages.EMAIL_REQUIRED).email(AuthErrorMessages.EMAIL_INVALID),
});
export const resetPasswordZodSchema = z.object({
  token: z.string().min(1, AuthErrorMessages.TOKEN_REQUIRED),
  newPassword: z
    .string()
    .min(8, AuthErrorMessages.PASSWORD_MIN_LENGTH)
    .max(16, AuthErrorMessages.PASSWORD_MAX_LENGTH)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,16}$/, AuthErrorMessages.PASSWORD_PATTERN),
});
export type RegisterUserInput = z.infer<typeof registerUserZodSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailZodSchema>;
export type LoginInput = z.infer<typeof loginZodSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenZodSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordZodSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordZodSchema>;

const errorResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
};
export const registerUserSchema: FastifySchema = {
  summary: 'Đăng ký người dùng',
  tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      email: { type: 'string' },
      password: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      birthDate: { type: 'string', format: 'date' },
      gender: { type: 'number' },
    },
    required: ['email', 'password'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
    400: errorResponseSchema,
    409: errorResponseSchema,
    500: errorResponseSchema,
  },
};
export const verifyEmailSchema: FastifySchema = {
  summary: 'Xác minh email',
  tags: ['Auth'],
  querystring: {
    type: 'object',
    properties: {
      token: { type: 'string' },
    },
    required: ['token'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    400: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};
export const loginSchema: FastifySchema = {
  summary: 'Đăng nhập',
  tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
    required: ['email', 'password'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: { type: 'object' },
          },
        },
      },
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};
export const refreshTokenSchema: FastifySchema = {
  summary: 'Làm mới token',
  tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      refreshToken: { type: 'string' },
    },
    required: ['refreshToken'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};
export const forgotPasswordSchema: FastifySchema = {
  summary: 'Quên mật khẩu',
  tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
    },
    required: ['email'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    400: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};
export const resetPasswordSchema: FastifySchema = {
  summary: 'Đặt lại mật khẩu',
  tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      token: { type: 'string' },
      newPassword: { type: 'string', minLength: 8, maxLength: 16 },
    },
    required: ['token', 'newPassword'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    400: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};
