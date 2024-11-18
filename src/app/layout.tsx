// src/app/layout.tsx
import Link from 'next/link';
import '../app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Flush Email</title>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="bg-gray-100 text-gray-900 font-sans antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="bg-white w-64 p-6 shadow-lg h-screen sticky top-0">
            <div className="flex items-center mb-10">
              <img src="/logo.png" alt="Flush Email Logo" className="h-10 w-10 mr-4" />
              <h1 className="text-2xl font-bold text-blue-600">Flush Email</h1>
            </div>
            <nav className="space-y-4">
              <Link href="/" className="block p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                Home
              </Link>
              <Link href="/emails" className="block p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                Emails
              </Link>
              <Link href="/email-template" className="block p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                Email Template
              </Link>
              <Link href="/email-address-format" className="block p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                Email Address Format
              </Link>
              <Link href="/linkedinMessages" className="block p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                LinkedIn Messages
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
