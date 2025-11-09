import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'author' | 'reviewer' | 'approver' | 'viewer';
}

const COOKIE_NAME = 'dm_session';
const SECRET = process.env.SESSION_SECRET || 'dev_secret_dev_secret_dev_secret_12345';

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function sign(data: string): string {
  return base64url(crypto.createHmac('sha256', SECRET).update(data).digest());
}

export function signToken(payload: object): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const signature = sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

export function verifyToken<T>(token: string): T | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = sign(`${header}.${body}`);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken<SessionUser & { exp?: number }>(token);
  if (!payload) return null;
  if (payload.exp && Date.now() / 1000 > payload.exp) return null;
  return { id: payload.id, email: payload.email, name: payload.name, role: payload.role };
}

export function setSessionCookie(res: NextResponse, user: SessionUser) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 8; // 8 hours
  const token = signToken({ ...user, exp });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  return user;
}

export function requireRole(user: SessionUser, roles: SessionUser['role'][]): void {
  if (!roles.includes(user.role)) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
}
