import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'DocumentManagement',
  description: 'Pharma DMS - 21 CFR Part 11 compliant features',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b bg-white">
            <div className="mx-auto max-w-6xl px-4 py-3 flex justify-between items-center">
              <a href="/" className="font-semibold text-lg">DocumentManagement</a>
              <nav className="flex gap-4 text-sm">
                <a href="/documents" className="hover:underline">Documents</a>
                <a href="/approvals" className="hover:underline">Approvals</a>
                <a href="/audit" className="hover:underline">Audit</a>
                <a href="/admin" className="hover:underline">Admin</a>
                <a href="/auth/logout" className="hover:underline">Logout</a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
