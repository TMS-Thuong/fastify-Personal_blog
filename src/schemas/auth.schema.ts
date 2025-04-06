import { Type } from '@sinclair/typebox';

export const registerUserSchema = {
  body: {
    type: 'object',
    required: ['email', 'password', 'firstName', 'lastName', 'birthDate', 'gender'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      birthDate: { type: 'string', format: 'date' },
      gender: {
        type: 'integer',
        enum: [0, 1, 2],
        description: '0 = MALE, 1 = FEMALE, 2 = OTHER',
      },
    },
  },
};

export const VerifyEmailSchema = {
  querystring: Type.Object({
    token: Type.String(),
  }),
};

export const LoginSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8, maxLength: 16 }),
  }),
};

export const RefreshTokenSchema = {
  body: Type.Object({
    refreshToken: Type.String(),
  }),
};

export const ForgotPasswordSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
  }),
};

export const resetPasswordSchema = {
  body: Type.Object({
    token: Type.String(),
    newPassword: Type.String({
      minLength: 8,
      maxLength: 16,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[A-Za-z0-9_]).{8,16}$',
    }),
  }),
};
