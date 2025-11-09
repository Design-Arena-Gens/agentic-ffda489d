import { NextResponse } from 'next/server';
import { db } from '@/lib/storage';
import { requireUser } from '@/lib/session';
import { logAudit } from '@/lib/audit';

export const GET = async (_req: Request) => {
  const url = new URL(_req.url);
  const id = url.pathname.split('/').pop()!;
  const row = db.documents.getAll().find(d => d.id === id);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
};

export const PUT = async (req: Request) => {
  const me = await requireUser();
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop()!;
  const body = await req.json();
  const docs = db.documents.getAll();
  const idx = docs.findIndex(d => d.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const current = docs[idx];
  const updated = { ...current, ...body };
  docs[idx] = updated;
  db.documents.saveAll(docs);
  logAudit({ action: 'document_updated', entity: 'document', userId: me.id, entityId: id, details: body });
  return NextResponse.json(updated);
};
