import fs from 'fs';
import path from 'path';

import { createLogger, format, transports } from 'winston';

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const logger = createLogger({
  level: 'info', // info, warn, error
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    // Nếu là lỗi thì bao gồm cả stack trace
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
        : `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),

    new transports.File({
      filename: path.join(logDir, 'app.log'),
      level: 'info',
    }),
  ],
  exitOnError: false, // Không tự động thoát khi có lỗi chưa được xử lý
});
