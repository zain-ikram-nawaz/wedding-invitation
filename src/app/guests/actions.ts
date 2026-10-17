'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminPassword, safeEqual, sessionToken, SESSION_COOKIE } from '@/lib/admin-auth';

export async function login(formData: FormData) {
  const password = adminPassword();
  const attempt = formData.get('password');
  if (!password || typeof attempt !== 'string' || !safeEqual(attempt, password)) {
    await new Promise((done) => setTimeout(done, 1000)); // slows password guessing
    redirect('/guests?error=1');
  }
  (await cookies()).set(SESSION_COOKIE, sessionToken(password), {
    httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/guests', maxAge: 60 * 60 * 24 * 400, // browsers cap cookies at 400 days
  });
  redirect('/guests');
}
export async function logout() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: '/guests' });
  redirect('/guests');
}
