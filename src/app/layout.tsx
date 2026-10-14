import React from 'react';

export const metadata = {
  title: 'RentPod 2.0 - Smart Car Rental',
  description: 'Full-Stack Next.js TypeScript OOP Car Rental with AI & Live GPS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}