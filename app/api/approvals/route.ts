import { NextResponse } from 'next/server';
import { db, ApprovalRecord, SignatureRecord } from '@/lib/storage';
import { requireUser } from '@/lib/session';
import { nanoid } from 'nanoid';
import { logAudit } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export const GET = async () => {
  await requireUser();
  const approvals = db.approvals.getAll().filter(a => a.status === 'pending');
  return NextResponse.json(approvals);
};

export const POST = async (req: Request) => {
  const me = await requireUser();
  const body = await req.json();
  const approval: ApprovalRecord = {
    id: nanoid(),
    documentId: body.documentId,
    stepId: body.stepId,
    requiredRole: body.requiredRole,
    status: 'pending'
  };
  db.approvals.saveAll([approval, ...db.approvals.getAll()]);
  logAudit({ action: 'approval_created', entity: 'approval', userId: me.id, entityId: approval.id, details: { documentId: approval.documentId } });
  return NextResponse.json(approval);
};

export const PUT = async (req: Request) => {
  const me = await requireUser();
  const body = await req.json();
  const { id, approve, comment, password } = body;
  const approvals = db.approvals.getAll();
  const idx = approvals.findIndex(a => a.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const users = db.users.getAll();
  const user = users.find(u => u.id === me.id)!;
  if (!bcrypt.compareSync(password, user.passwordHash)) {
    logAudit({ action: 'signature_failed', entity: 'signature', userId: me.id, details: { reason: 'bad_password' } });
    return NextResponse.json({ error: 'Electronic signature failed' }, { status: 401 });
  }

  const signature: SignatureRecord = {
    id: nanoid(),
    userId: me.id,
    documentId: approvals[idx].documentId,
    purpose: 'approval',
    signedAt: new Date().toISOString(),
    signatureHash: bcrypt.hashSync(`${me.id}:${Date.now()}`, 10),
  };

  approvals[idx] = {
    ...approvals[idx],
    reviewerId: me.id,
    status: approve ? 'approved' : 'rejected',
    signedAt: signature.signedAt,
    signatureId: signature.id,
    comment,
  };
  db.approvals.saveAll(approvals);
  logAudit({ action: approve ? 'approval_approved' : 'approval_rejected', entity: 'approval', userId: me.id, entityId: approvals[idx].id, details: { comment } });
  // store signature in audit stream as well
  logAudit({ action: 'signature_recorded', entity: 'signature', userId: me.id, entityId: signature.id, details: { documentId: signature.documentId } });
  return NextResponse.json(approvals[idx]);
};
