"use client";
import { useEffect, useState } from 'react';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/audit').then(r=>r.json()).then(setLogs);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Audit Trail</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Timestamp</th>
              <th className="p-2">User</th>
              <th className="p-2">Action</th>
              <th className="p-2">Entity</th>
              <th className="p-2">Entity ID</th>
              <th className="p-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l:any) => (
              <tr key={l.id} className="border-b">
                <td className="p-2 whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                <td className="p-2">{l.userId || '-'}</td>
                <td className="p-2">{l.action}</td>
                <td className="p-2">{l.entity}</td>
                <td className="p-2">{l.entityId || '-'}</td>
                <td className="p-2 text-xs max-w-xl truncate">{typeof l.details === 'object' ? JSON.stringify(l.details) : (l.details||'-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
