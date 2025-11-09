"use client";
import { useEffect, useState } from 'react';
import { Select } from '@/components/Select';

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ title: '', documentNumber: '', version: '1.0', documentSecurity: 'internal' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/documents').then(r=>r.json()),
      fetch('/api/doc-types').then(r=>r.json()),
      fetch('/api/categories').then(r=>r.json()),
    ]).then(([d, t, c]) => { setDocs(d); setTypes(t); setCats(c); })
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) {
      const created = await res.json();
      setDocs([created, ...docs]);
      setForm({ title: '', documentNumber: '', version: '1.0', documentSecurity: 'internal' });
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || 'Failed to create document');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Documents</h1>
      <form onSubmit={submit} className="card p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Document Title</label>
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Document Number</label>
            <input className="input" value={form.documentNumber} onChange={e => setForm({ ...form, documentNumber: e.target.value })} required />
          </div>
          <div>
            <label className="label">Version</label>
            <input className="input" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} />
          </div>
          <div>
            <label className="label">Document Type</label>
            <Select value={form.documentTypeId || ''} onChange={e => setForm({ ...form, documentTypeId: e.target.value })}>
              <option value="">Select...</option>
              {types.map((t: any) => <option key={t.id} value={t.id}>{t.type}</option>)}
            </Select>
          </div>
          <div>
            <label className="label">Category</label>
            <Select value={form.documentCategoryId || ''} onChange={e => setForm({ ...form, documentCategoryId: e.target.value })}>
              <option value="">Select...</option>
              {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="label">Security</label>
            <Select value={form.documentSecurity} onChange={e => setForm({ ...form, documentSecurity: e.target.value })}>
              {['confidential','internal','restricted','public'].map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Change Summary</label>
            <textarea className="input" rows={3} value={form.changeSummary||''} onChange={e => setForm({ ...form, changeSummary: e.target.value })} />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn" type="submit">Create Document</button>
      </form>

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Title</th>
              <th className="p-2">Number</th>
              <th className="p-2">Version</th>
              <th className="p-2">Type</th>
              <th className="p-2">Security</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d:any) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="p-2"><a className="text-brand-700 underline" href={`/documents/${d.id}`}>{d.title}</a></td>
                <td className="p-2">{d.documentNumber}</td>
                <td className="p-2">{d.version}</td>
                <td className="p-2">{types.find((t:any)=>t.id===d.documentTypeId)?.type}</td>
                <td className="p-2">{d.documentSecurity}</td>
                <td className="p-2"><span className="badge">{d.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
