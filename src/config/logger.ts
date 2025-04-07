import * as path from 'path';

import { createLogger, format, transports } from 'winston';

const logFilePath = path.join(__dirname, '..', 'logs', 'app.log');

// logger instance
export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'DD-MM-YYYY HH:mm:ss',
    }),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    // Console transport để log ra console
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    // File transport để lưu log vào tệp
    new transports.File({
      filename: logFilePath,
      level: 'info',
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true, // Cho phép quay vòng tệp log khi đầy
    }),
  ],
});
