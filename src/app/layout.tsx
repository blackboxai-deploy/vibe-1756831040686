import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Productivity Hub - Your Personal Notion-like Workspace',
  description: 'A powerful productivity app with rich text editing, databases, AI assistance, and real-time collaboration features.',
  keywords: ['productivity', 'notes', 'workspace', 'notion', 'collaboration', 'AI'],
  authors: [{ name: 'Productivity Hub Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📝</text></svg>" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <div id="root" className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}