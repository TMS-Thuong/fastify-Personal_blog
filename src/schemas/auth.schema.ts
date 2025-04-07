import { Type } from '@sinclair/typebox';

export enum GenderEnum {
  MALE = 0,
  FEMALE = 1,
  OTHER = 2,
}

export const RegisterUserSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  birthDate: Type.String({ format: 'date' }),
  gender: Type.Enum(GenderEnum, {
    description: '0 = MALE, 1 = FEMALE, 2 = OTHER',
  }),
});

export const VerifyEmailSchema = Type.Object({
  token: Type.String(),
});

export const LoginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8, maxLength: 16 }),
});

export const RefreshTokenSchema = Type.Object({
  refreshToken: Type.String(),
});

export const ForgotPasswordSchema = Type.Object({
  email: Type.String({ format: 'email' }),
});

export const ResetPasswordSchema = Type.Object({
  token: Type.String(),
  newPassword: Type.String({
    minLength: 8,
    maxLength: 16,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[A-Za-z0-9_]).{8,16}$',
  }),
});
