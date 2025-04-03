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
