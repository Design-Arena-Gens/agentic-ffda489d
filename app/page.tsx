import Link from 'next/link'

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Pharmaceutical Document Management System</h1>
      <p className="text-gray-600 max-w-2xl">
        Manage controlled documents with versioning, workflows, electronic signatures, and audit trails.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <h2 className="font-medium">Documents</h2>
          <p className="text-sm text-gray-600">Create, revise, and control documents.</p>
          <Link href="/documents" className="btn mt-3">Open</Link>
        </div>
        <div className="card p-4">
          <h2 className="font-medium">Approvals</h2>
          <p className="text-sm text-gray-600">Review and approve with e-signatures.</p>
          <Link href="/approvals" className="btn mt-3">Open</Link>
        </div>
        <div className="card p-4">
          <h2 className="font-medium">Admin</h2>
          <p className="text-sm text-gray-600">Roles, users, types, categories.</p>
          <Link href="/admin" className="btn mt-3">Open</Link>
        </div>
      </div>
      <div>
        <Link href="/auth/login" className="text-sm text-brand-700 underline">Login</Link>
      </div>
    </div>
  )
}
