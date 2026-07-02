import pino from 'pino';

export const logger = pino({
    name: 'claw-costco',
    level: process.env.LOG_LEVEL || 'info',
});
