import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  ttl: Number(process.env.JWT_TTL_SECONDS || 3600),
  issuer: 'pks-api',
  audience: 'pks-web',
}));
