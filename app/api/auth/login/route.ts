import { setSessionCookie } from "@/lib/session";
import { db } from "@/lib/storage";
import bcrypt from 'bcryptjs';
import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { seed } from "@/lib/seed";

seed();

export const POST = async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body;
  const user = db.users.getAll().find(u => u.email === email);
  if (!user) {
    logAudit({ action: 'login_failed', entity: 'auth', details: { email }, ip: undefined });
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    logAudit({ action: 'login_failed', entity: 'auth', userId: user.id, details: { email }, ip: undefined });
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, { id: user.id, email: user.email, name: user.name, role: user.role });
  logAudit({ action: 'login_success', entity: 'auth', userId: user.id, details: { email }, ip: undefined });
  return res;
};
