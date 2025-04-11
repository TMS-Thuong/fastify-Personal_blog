import { FastifySchema } from 'fastify';
import { z } from 'zod';

import { UserErrorMessages } from './user.error';

export const getProfileZodSchema = z.object({});

export const getUserByIdZodSchema = z.object({
  id: z.string().min(1, UserErrorMessages.ID_REQUIRED),
});

export const updateAvatarZodSchema = z.object({});

export const updateUserZodSchema = z
  .object({
    firstName: z.string().min(1, UserErrorMessages.FIRST_NAME_REQUIRED),
    lastName: z.string().min(1, UserErrorMessages.LAST_NAME_REQUIRED),
    birthDate: z
      .string()
      .min(1, UserErrorMessages.BIRTH_DATE_REQUIRED)
      .refine(
        (date) => {
          const regex = /^\d{4}\/\d{2}\/\d{2}$/;
          return regex.test(date);
        },
        {
          message: 'Ngày sinh phải có định dạng YYYY/MM/DD',
        }
      ),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
      errorMap: () => ({ message: UserErrorMessages.GENDER_INVALID }),
    }),
    address: z.string().optional(),
  })
  .partial();

export const updatePasswordZodSchema = z.object({
  currentPassword: z.string().min(1, UserErrorMessages.CURRENT_PASSWORD_REQUIRED),
  newPassword: z
    .string()
    .min(8, UserErrorMessages.PASSWORD_MIN_LENGTH)
    .max(16, UserErrorMessages.PASSWORD_MAX_LENGTH)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,16}$/, UserErrorMessages.PASSWORD_PATTERN),
});

export type GetProfileInput = z.infer<typeof getProfileZodSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdZodSchema>;
export type UpdateAvatarInput = z.infer<typeof updateAvatarZodSchema>;
export type UpdateUserInput = z.infer<typeof updateUserZodSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordZodSchema>;

const errorResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
};

const userObjectSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    birthDate: { type: 'string' },
    gender: { type: 'string' },
    address: { type: 'string' },
    avatarUrl: { type: 'string' },
  },
};

export const getProfileSchema: FastifySchema = {
  summary: 'Xem thông tin cá nhân',
  tags: ['User'],
  response: {
    200: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        data: userObjectSchema,
      },
    },
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const getUserByIdSchema: FastifySchema = {
  summary: 'Xem thông tin user theo id',
  tags: ['User'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: userObjectSchema,
      },
    },
    400: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const updateAvatarSchema: FastifySchema = {
  summary: 'Cập nhật avatar người dùng',
  tags: ['User'],
  consumes: ['multipart/form-data'],
  body: {
    type: 'object',
    required: ['avatar'],
    properties: {
      avatar: { type: 'string', format: 'binary' },
    },
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
            avatar: { type: 'string' },
          },
        },
      },
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const updateUserSchema: FastifySchema = {
  summary: 'Cập nhật thông tin cá nhân của người dùng',
  tags: ['User'],
  body: {
    type: 'object',
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      birthDate: { type: 'string', format: 'date' },
      gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
      address: { type: 'string' },
    },
    required: [],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        data: userObjectSchema,
      },
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const updatePasswordSchema: FastifySchema = {
  summary: 'Đổi mật khẩu',
  tags: ['User'],
  body: {
    type: 'object',
    properties: {
      currentPassword: { type: 'string' },
      newPassword: { type: 'string', minLength: 8, maxLength: 16 },
    },
    required: ['currentPassword', 'newPassword'],
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
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};
