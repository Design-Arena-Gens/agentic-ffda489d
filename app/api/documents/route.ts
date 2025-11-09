import { NextResponse } from 'next/server';
import { db, DocumentRecord } from '@/lib/storage';
import { requireUser } from '@/lib/session';
import { nanoid } from 'nanoid';
import { logAudit } from '@/lib/audit';

export const GET = async () => {
  const rows = db.documents.getAll();
  return NextResponse.json(rows);
};

export const POST = async (req: Request) => {
  const me = await requireUser();
  const body = await req.json();
  const now = new Date().toISOString();
  const row: DocumentRecord = {
    id: nanoid(),
    title: body.title,
    documentNumber: body.documentNumber,
    version: body.version ?? '1.0',
    dateCreated: now,
    createdBy: me.id,
    dateOfIssue: body.dateOfIssue,
    issuedBy: body.issuedBy,
    issuerRole: body.issuerRole,
    effectiveFromDate: body.effectiveFromDate,
    dateOfNextIssue: body.dateOfNextIssue,
    documentTypeId: body.documentTypeId,
    documentCategoryId: body.documentCategoryId,
    documentSecurity: body.documentSecurity,
    status: 'draft',
    changeSummary: body.changeSummary,
  };
  const rows = db.documents.getAll();
  db.documents.saveAll([row, ...rows]);
  logAudit({ action: 'document_created', entity: 'document', userId: me.id, entityId: row.id, details: { title: row.title } });
  return NextResponse.json(row);
};
