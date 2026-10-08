import { randomBytes } from 'node:crypto';

export function createCode(prefix: 'USR' | 'CRS' | 'ENR') {
  return `${prefix}-${randomBytes(6).toString('hex').toUpperCase()}`;
}
