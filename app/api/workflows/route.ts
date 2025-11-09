import { NextResponse } from 'next/server';
import { db, Workflow } from '@/lib/storage';
import { requireUser } from '@/lib/session';
import { nanoid } from 'nanoid';
import { logAudit } from '@/lib/audit';

export const GET = async () => {
  return NextResponse.json(db.workflows.getAll());
};

export const POST = async (req: Request) => {
  const me = await requireUser();
  const body = await req.json();
  const row: Workflow = { id: nanoid(), name: body.name, steps: body.steps, active: true };
  db.workflows.saveAll([row, ...db.workflows.getAll()]);
  logAudit({ action: 'workflow_created', entity: 'workflow', userId: me.id, entityId: row.id, details: { name: row.name } });
  return NextResponse.json(row);
};
