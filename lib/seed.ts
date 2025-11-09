import { db, User, DocumentType, DocumentCategory } from './storage';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

export function seed() {
  const users = db.users.getAll();
  if (!users.find(u => u.email === 'admin@example.com')) {
    const passwordHash = bcrypt.hashSync('admin123!', 10);
    const admin: User = { id: nanoid(), email: 'admin@example.com', name: 'Admin', role: 'admin', passwordHash };
    db.users.saveAll([...users, admin]);
  }

  const types = db.docTypes.getAll();
  if (types.length === 0) {
    const defaults: DocumentType[] = [
      { id: nanoid(), type: 'manual', description: 'Manual' },
      { id: nanoid(), type: 'procedure', description: 'Procedure' },
      { id: nanoid(), type: 'process', description: 'Process' },
      { id: nanoid(), type: 'work instruction', description: 'Work Instruction' },
      { id: nanoid(), type: 'policy', description: 'Policy' },
      { id: nanoid(), type: 'checklist', description: 'Checklist' },
      { id: nanoid(), type: 'format', description: 'Format' },
      { id: nanoid(), type: 'template', description: 'Template' },
      { id: nanoid(), type: 'masters', description: 'Masters' },
    ];
    db.docTypes.saveAll(defaults);
  }

  const cats = db.categories.getAll();
  if (cats.length === 0) {
    const defaults: DocumentCategory[] = [
      { id: nanoid(), name: 'Quality', description: 'Quality System' },
      { id: nanoid(), name: 'Manufacturing', description: 'Manufacturing Processes' },
      { id: nanoid(), name: 'Regulatory', description: 'Regulatory Submissions' },
    ];
    db.categories.saveAll(defaults);
  }
}
