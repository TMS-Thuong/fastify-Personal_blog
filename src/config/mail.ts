import nodemailer from 'nodemailer';

import { SMTP_SERVER, SMTP_USERNAME, SMTP_PASSWORD } from './env';

const transporter = nodemailer.createTransport({
  host: SMTP_SERVER,
  port: 465,
  secure: true,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
});

export default transporter;
