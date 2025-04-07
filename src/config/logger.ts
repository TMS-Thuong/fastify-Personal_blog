import * as path from 'path';
import { createLogger, format, transports } from 'winston';
import { format as dateFnsFormat } from 'date-fns-tz';

const logFilePath = path.join(__dirname, '..', 'logs', 'app.log');

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: () => {
        const vietnamTimeZone = 'Asia/Ho_Chi_Minh';
        return dateFnsFormat(new Date(), 'dd-MM-yyyy HH:mm:ss', { timeZone: vietnamTimeZone });
      },
    }),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({
      filename: logFilePath,
      level: 'info',
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true, // Cho phép quay vòng tệp log khi đầy
    }),
  ],
});
