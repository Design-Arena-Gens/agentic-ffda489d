import { db, AuditLogRecord } from './storage';
import { nanoid } from 'nanoid';

export function logAudit(record: Omit<AuditLogRecord, 'id' | 'timestamp'>) {
  const rows = db.audit.getAll();
  rows.push({ id: nanoid(), timestamp: new Date().toISOString(), ...record });
  db.audit.saveAll(rows);
}
