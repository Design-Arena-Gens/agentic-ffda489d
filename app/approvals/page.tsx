"use client";
import { useEffect, useState } from 'react';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/approvals').then(r=>r.json()).then(setApprovals);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Pending Approvals</h1>
      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Document</th>
              <th className="p-2">Step</th>
              <th className="p-2">Required Role</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((a:any) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-2"><a className="text-brand-700 underline" href={`/documents/${a.documentId}`}>{a.documentId}</a></td>
                <td className="p-2">{a.stepId}</td>
                <td className="p-2">{a.requiredRole}</td>
                <td className="p-2"><span className="badge">{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
