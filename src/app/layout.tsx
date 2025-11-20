import type { Metadata } from 'next';
import { Ubuntu } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const ubuntu = Ubuntu({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-ubuntu',
});

export const metadata: Metadata = {
  title: 'nmMatrix - Autonomous Self-Evolving Web Application',
  description: 'A fully autonomous, self-evolving web application built with Next.js, React, TailwindCSS, and Firebase',
  keywords: ['autonomous', 'self-evolving', 'AI', 'web application', 'evolution'],
  openGraph: {
    title: 'nmMatrix - Autonomous Self-Evolving Web Application',
    description: 'A fully autonomous, self-evolving web application',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={ubuntu.className}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
