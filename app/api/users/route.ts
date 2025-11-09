import { NextResponse } from 'next/server';
import { db, User } from '@/lib/storage';
import { requireUser, requireRole } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { logAudit } from '@/lib/audit';

export const GET = async () => {
  await requireUser();
  const users = db.users.getAll().map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role }));
  return NextResponse.json(users);
};

export const POST = async (req: Request) => {
  const me = await requireUser();
  requireRole(me, ['admin']);
  const body = await req.json();
  const { email, name, role, password } = body;
  const users = db.users.getAll();
  if (users.some(u => u.email === email)) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }
  const user: User = { id: nanoid(), email, name, role, passwordHash: bcrypt.hashSync(password, 10) };
  db.users.saveAll([...users, user]);
  logAudit({ action: 'user_created', entity: 'user', userId: me.id, entityId: user.id, details: { email, role } });
  return NextResponse.json({ id: user.id });
};
