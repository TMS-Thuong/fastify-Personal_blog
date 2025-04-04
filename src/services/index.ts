// src/services/index.ts

import AuthService from './auth.service';
import EmailService from './email.service';

export const { checkEmail, createUser, saveEmailVerificationToken, verifyEmailToken, login, refreshAccessToken } =
  AuthService;

export const { sendEmail } = EmailService;
