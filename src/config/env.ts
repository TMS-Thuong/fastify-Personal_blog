import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
export const HOST = process.env.HOST || '';
export const BASE_URL = process.env.BASE_URL || '';
export const JWT_SECRET = process.env.JWT_SECRET || '';
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const SMTP_SERVER = process.env.SMTP_SERVER || 'smtp.gmail.com';
export const SMTP_USERNAME = process.env.GMAIL_USERNAME || '';
export const SMTP_PASSWORD = process.env.GMAIL_PASSWORD || '';
