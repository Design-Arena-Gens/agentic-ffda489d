import { NextResponse } from 'next/server';
import { db, DocumentCategory } from '@/lib/storage';
import { requireUser } from '@/lib/session';
import { nanoid } from 'nanoid';
import { logAudit } from '@/lib/audit';

export const GET = async () => {
  const rows = db.categories.getAll();
  return NextResponse.json(rows);
};

export const POST = async (req: Request) => {
  const me = await requireUser();
  const body = await req.json();
  const { name, description } = body;
  const rows = db.categories.getAll();
  const row: DocumentCategory = { id: nanoid(), name, description };
  db.categories.saveAll([...rows, row]);
  logAudit({ action: 'category_created', entity: 'category', userId: me.id, entityId: row.id, details: { name } });
  return NextResponse.json(row);
};
