"use client";
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [userForm, setUserForm] = useState<any>({ email: '', name: '', role: 'viewer', password: '' });
  const [typeForm, setTypeForm] = useState<any>({ type: '', description: '' });
  const [catForm, setCatForm] = useState<any>({ name: '', description: '' });

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then(r=>r.json()),
      fetch('/api/doc-types').then(r=>r.json()),
      fetch('/api/categories').then(r=>r.json()),
    ]).then(([u,t,c]) => { setUsers(u); setDocTypes(t); setCategories(c); })
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) });
    if (res.ok) {
      const id = (await res.json()).id;
      setUsers([...users, { ...userForm, id }]);
      setUserForm({ email: '', name: '', role: 'viewer', password: '' });
    }
  }

  async function createType(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/doc-types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(typeForm) });
    if (res.ok) {
      const row = await res.json();
      setDocTypes([...docTypes, row]);
      setTypeForm({ type: '', description: '' });
    }
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catForm) });
    if (res.ok) {
      const row = await res.json();
      setCategories([...categories, row]);
      setCatForm({ name: '', description: '' });
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Admin</h1>

      <section className="card p-4">
        <h2 className="font-medium mb-3">Create User</h2>
        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="input" placeholder="Email" value={userForm.email} onChange={e=>setUserForm({...userForm,email:e.target.value})} required />
          <input className="input" placeholder="Name" value={userForm.name} onChange={e=>setUserForm({...userForm,name:e.target.value})} required />
          <select className="select" value={userForm.role} onChange={e=>setUserForm({...userForm,role:e.target.value})}>
            {['admin','author','reviewer','approver','viewer'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input className="input" placeholder="Password" type="password" value={userForm.password} onChange={e=>setUserForm({...userForm,password:e.target.value})} required />
          <button className="btn md:col-span-4" type="submit">Create</button>
        </form>

        <div className="mt-4">
          <h3 className="font-medium">Users</h3>
          <ul className="text-sm mt-2 space-y-1">
            {users.map(u => <li key={u.id}>{u.name} ({u.email}) ? <span className="badge">{u.role}</span></li>)}
          </ul>
        </div>
      </section>

      <section className="card p-4">
        <h2 className="font-medium mb-3">Document Types</h2>
        <form onSubmit={createType} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="Type" value={typeForm.type} onChange={e=>setTypeForm({...typeForm,type:e.target.value})} required />
          <input className="input" placeholder="Description" value={typeForm.description} onChange={e=>setTypeForm({...typeForm,description:e.target.value})} />
          <button className="btn" type="submit">Add</button>
        </form>
        <ul className="text-sm mt-2 space-y-1">
          {docTypes.map((t:any) => <li key={t.id}>{t.type} ? {t.description}</li>)}
        </ul>
      </section>

      <section className="card p-4">
        <h2 className="font-medium mb-3">Categories</h2>
        <form onSubmit={createCategory} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="Name" value={catForm.name} onChange={e=>setCatForm({...catForm,name:e.target.value})} required />
          <input className="input" placeholder="Description" value={catForm.description} onChange={e=>setCatForm({...catForm,description:e.target.value})} />
          <button className="btn" type="submit">Add</button>
        </form>
        <ul className="text-sm mt-2 space-y-1">
          {categories.map((c:any) => <li key={c.id}>{c.name} ? {c.description}</li>)}
        </ul>
      </section>
    </div>
  );
}
