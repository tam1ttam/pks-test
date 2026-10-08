import type { CookieOptions, Request } from 'express';

export type AuthPortal = 'CLIENT' | 'ADMIN';
export const CLIENT_COOKIE = 'pks_client_session';
export const ADMIN_COOKIE = 'pks_admin_session';

export function cookieName(portal: AuthPortal) { return portal === 'ADMIN' ? ADMIN_COOKIE : CLIENT_COOKIE; }
export function cookieOptions(maxAge?: number): CookieOptions {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', ...(maxAge === undefined ? {} : { maxAge }) };
}
export function tokenFromRequest(request: Request) {
  const cookies = Object.fromEntries((request.headers.cookie || '').split(';').map(item => item.trim().split('=').map(decodeURIComponent)).filter(parts => parts.length === 2));
  const portal = request.headers['x-pks-portal'] === 'admin' ? 'ADMIN' : 'CLIENT';
  return cookies[cookieName(portal)];
}
