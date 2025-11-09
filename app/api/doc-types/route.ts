import { NextResponse } from 'next/server';
import { db, DocumentType } from '@/lib/storage';
import { requireUser } from '@/lib/session';
import { nanoid } from 'nanoid';
import { logAudit } from '@/lib/audit';

export const GET = async () => {
  const rows = db.docTypes.getAll();
  return NextResponse.json(rows);
};

export const POST = async (req: Request) => {
  const me = await requireUser();
  const body = await req.json();
  const { type, description } = body;
  const rows = db.docTypes.getAll();
  const row: DocumentType = { id: nanoid(), type, description };
  db.docTypes.saveAll([...rows, row]);
  logAudit({ action: 'doctype_created', entity: 'doctype', userId: me.id, entityId: row.id, details: { type } });
  return NextResponse.json(row);
};
