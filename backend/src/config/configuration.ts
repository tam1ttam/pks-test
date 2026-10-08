export default () => ({
  port: Number(process.env.PORT || 3030),
  frontendUrls: (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174')
    .split(',').map(origin => origin.trim()).filter(Boolean),
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  mail: {
    host: process.env.SMTP_HOST || '', port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true', user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '', from: process.env.SMTP_FROM || '',
  },
});

export function validateEnvironment(env: Record<string, unknown>) {
  for (const key of ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE', 'JWT_SECRET']) {
    if (typeof env[key] !== 'string' || !(env[key] as string).trim()) throw new Error(`${key} is required in .env`);
  }
  if (String(env.JWT_SECRET).length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  for (const key of ['PORT', 'DB_PORT', 'JWT_TTL_SECONDS']) {
    if (env[key] !== undefined && (!Number.isInteger(Number(env[key])) || Number(env[key]) <= 0)) {
      throw new Error(`${key} must be a positive integer`);
    }
  }
  return env;
}
