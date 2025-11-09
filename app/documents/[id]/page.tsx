"use client";
import { useEffect, useState } from 'react';

export default function DocumentDetail({ params }: any) {
  const { id } = params;
  const [doc, setDoc] = useState<any | null>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [password, setPassword] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetch(`/api/documents/${id}`).then(r=>r.json()).then(setDoc);
    fetch('/api/approvals').then(r=>r.json()).then(setApprovals);
  }, [id]);

  async function requestApproval() {
    if (!doc) return;
    const res = await fetch('/api/approvals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ documentId: doc.id, stepId: 'review', requiredRole: 'reviewer' }) });
    if (res.ok) {
      const created = await res.json();
      setApprovals([created, ...approvals]);
    }
  }

  async function sign(approvalId: string, approve: boolean) {
    const res = await fetch('/api/approvals', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: approvalId, approve, comment, password }) });
    if (res.ok) {
      const updated = await res.json();
      setApprovals(approvals.map(a => a.id === updated.id ? updated : a));
      setPassword(''); setComment('');
    }
  }

  if (!doc) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <h1 className="text-xl font-semibold">{doc.title} <span className="badge">v{doc.version}</span></h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-3">
          <div><span className="font-medium">Document Number:</span> {doc.documentNumber}</div>
          <div><span className="font-medium">Status:</span> {doc.status}</div>
          <div><span className="font-medium">Security:</span> {doc.documentSecurity}</div>
          <div><span className="font-medium">Date Created:</span> {new Date(doc.dateCreated).toLocaleString()}</div>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Approvals</h2>
          <button className="btn" onClick={requestApproval}>Request Review</button>
        </div>
        <div className="space-y-2">
          {approvals.filter(a=>a.documentId===doc.id).map(a => (
            <div key={a.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">Step: {a.stepId} ? Role: {a.requiredRole} ? Status: <span className="badge">{a.status}</span></div>
                {a.status==='pending' && (
                  <div className="flex gap-2">
                    <input className="input" type="password" placeholder="Password (e-sign)" value={password} onChange={e=>setPassword(e.target.value)} />
                    <input className="input" placeholder="Comment" value={comment} onChange={e=>setComment(e.target.value)} />
                    <button className="btn" onClick={()=>sign(a.id, true)}>Approve</button>
                    <button className="btn bg-red-600 hover:bg-red-700" onClick={()=>sign(a.id, false)}>Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
