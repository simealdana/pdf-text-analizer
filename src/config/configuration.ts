export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  api: {
    keys: process.env.API_KEYS?.split(',') || ['default-key'],
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  },
  rateLimit: {
    perMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE, 10) || 10,
    perHour: parseInt(process.env.RATE_LIMIT_PER_HOUR, 10) || 100,
  },
  pdf: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 50,
  },
});
