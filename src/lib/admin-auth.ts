import { createHmac, timingSafeEqual } from 'node:crypto';
export const SESSION_COOKIE = 'guest_list_session';

export function adminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD || undefined;
}
/** Derived from the password, so changing ADMIN_PASSWORD signs everyone out. */
export function sessionToken(password: string): string {
  return createHmac('sha256', password).update('guest-list-session-v1').digest('hex');
}
export function safeEqual(a: string, b: string): boolean {
  const x = createHmac('sha256', 'compare').update(a).digest();
  const y = createHmac('sha256', 'compare').update(b).digest();
  return timingSafeEqual(x, y);
}
export function isValidSession(cookie: string | undefined): boolean {
  const password = adminPassword();
  return !!password && !!cookie && safeEqual(cookie, sessionToken(password));
}
