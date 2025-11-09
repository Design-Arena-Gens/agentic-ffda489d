import fs from 'node:fs';
import path from 'node:path';

// Simple JSON-backed storage with in-memory fallback for serverless

const dataDir = path.join(process.cwd(), 'data');
const files = {
  users: path.join(dataDir, 'users.json'),
  documents: path.join(dataDir, 'documents.json'),
  docTypes: path.join(dataDir, 'docTypes.json'),
  categories: path.join(dataDir, 'categories.json'),
  workflows: path.join(dataDir, 'workflows.json'),
  approvals: path.join(dataDir, 'approvals.json'),
  audit: path.join(dataDir, 'audit.json'),
};

let memoryStore: Record<string, any[]> = {
  users: [],
  documents: [],
  docTypes: [],
  categories: [],
  workflows: [],
  approvals: [],
  audit: [],
};

function ensureDir() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  } catch {
    // serverless - ignore
  }
}

function readFileSafe<T>(filename: string): T[] {
  try {
    ensureDir();
    if (!fs.existsSync(filename)) return [];
    const raw = fs.readFileSync(filename, 'utf8');
    return JSON.parse(raw) as T[];
  } catch {
    const key = path.basename(filename, '.json') as keyof typeof memoryStore;
    return memoryStore[key] as T[];
  }
}

function writeFileSafe<T>(filename: string, data: T[]): void {
  try {
    ensureDir();
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    const key = path.basename(filename, '.json') as keyof typeof memoryStore;
    memoryStore[key] = data as any[];
  }
}

export type Role = 'admin' | 'author' | 'reviewer' | 'approver' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string; // bcrypt hash
}

export type DocumentSecurity = 'confidential' | 'internal' | 'restricted' | 'public';
export type DocumentTypeEnum = 'manual' | 'procedure' | 'process' | 'work instruction' | 'policy' | 'checklist' | 'format' | 'template' | 'masters';

export interface DocumentType { id: string; type: DocumentTypeEnum; description: string }
export interface DocumentCategory { id: string; name: string; description?: string }

export interface DocumentRecord {
  id: string;
  title: string;
  documentNumber: string;
  version: string;
  dateCreated: string; // ISO
  createdBy: string; // userId
  dateOfIssue?: string;
  issuedBy?: string; // userId
  issuerRole?: Role;
  effectiveFromDate?: string;
  dateOfNextIssue?: string;
  documentTypeId: string;
  documentCategoryId?: string;
  documentSecurity: DocumentSecurity;
  status: 'draft' | 'in_review' | 'approved' | 'effective' | 'obsolete' | 'rejected';
  changeSummary?: string;
}

export interface WorkflowStep { id: string; name: string; role: Role; }
export interface Workflow { id: string; name: string; steps: WorkflowStep[]; active: boolean }

export interface ApprovalRecord {
  id: string;
  documentId: string;
  stepId: string;
  requiredRole: Role;
  reviewerId?: string;
  status: 'pending' | 'approved' | 'rejected';
  signedAt?: string;
  signatureId?: string;
  comment?: string;
}

export interface SignatureRecord {
  id: string;
  userId: string;
  documentId: string;
  purpose: 'approval' | 'issuance';
  signedAt: string;
  signatureHash: string; // derived from user + secret + timestamp
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  userId?: string;
  action: string;
  entity: 'user' | 'document' | 'doctype' | 'category' | 'workflow' | 'approval' | 'signature' | 'auth';
  entityId?: string;
  details?: any;
  ip?: string;
}

export const db = {
  users: {
    getAll: (): User[] => readFileSafe<User>(files.users),
    saveAll: (rows: User[]) => writeFileSafe<User>(files.users, rows),
  },
  docTypes: {
    getAll: (): DocumentType[] => readFileSafe<DocumentType>(files.docTypes),
    saveAll: (rows: DocumentType[]) => writeFileSafe<DocumentType>(files.docTypes, rows),
  },
  categories: {
    getAll: (): DocumentCategory[] => readFileSafe<DocumentCategory>(files.categories),
    saveAll: (rows: DocumentCategory[]) => writeFileSafe<DocumentCategory>(files.categories, rows),
  },
  documents: {
    getAll: (): DocumentRecord[] => readFileSafe<DocumentRecord>(files.documents),
    saveAll: (rows: DocumentRecord[]) => writeFileSafe<DocumentRecord>(files.documents, rows),
  },
  workflows: {
    getAll: (): Workflow[] => readFileSafe<Workflow>(files.workflows),
    saveAll: (rows: Workflow[]) => writeFileSafe<Workflow>(files.workflows, rows),
  },
  approvals: {
    getAll: (): ApprovalRecord[] => readFileSafe<ApprovalRecord>(files.approvals),
    saveAll: (rows: ApprovalRecord[]) => writeFileSafe<ApprovalRecord>(files.approvals, rows),
  },
  audit: {
    getAll: (): AuditLogRecord[] => readFileSafe<AuditLogRecord>(files.audit),
    saveAll: (rows: AuditLogRecord[]) => writeFileSafe<AuditLogRecord>(files.audit, rows),
  },
};
