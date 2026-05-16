/**
 * Morgan HTTP request logger integrated with Winston.
 *
 * Streams HTTP request logs through Winston so they appear
 * in both the console (dev) and log files (combined.log).
 */

import morgan from 'morgan';
import { logger } from '../core';

const stream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

const morganMiddleware = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream },
);

export default morganMiddleware;
