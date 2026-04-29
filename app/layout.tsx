import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Score Overlay Chart',
  description: 'Reusable overlay score chart built with Next.js and Recharts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

