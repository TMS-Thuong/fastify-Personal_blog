// src/services/index.ts

import AuthService from './auth.service';
import EmailService from './email.service';

export const { checkEmail, createUser, saveEmailVerificationToken, verifyEmailToken, login } = AuthService;

export const { sendEmail } = EmailService;
