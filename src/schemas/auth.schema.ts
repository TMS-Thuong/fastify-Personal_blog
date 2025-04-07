import { FastifySchema } from 'fastify';

export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export const registerUserSchema: FastifySchema = {
  summary: 'Đăng ký người dùng',
  tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      birthDate: { type: 'string', format: 'date' },
      gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
    },
    required: ['email', 'password'],
  },
};

export const verifyEmailSchema: FastifySchema = {
  summary: 'Xác minh email',
  tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      token: { type: 'string' },
    },
    required: ['token'],
  },
};

export const loginSchema: FastifySchema = {
  summary: 'Đăng nhập',
  tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8, maxLength: 16 },
    },
    required: ['email', 'password'],
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
};

export const resetPasswordSchema: FastifySchema = {
  summary: 'Đặt lại mật khẩu',
  tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      token: { type: 'string' },
      newPassword: {
        type: 'string',
        minLength: 8,
        maxLength: 16,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[A-Za-z0-9_]).{8,16}$',
      },
    },
    required: ['token', 'newPassword'],
  },
};
