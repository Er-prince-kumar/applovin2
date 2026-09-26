import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LinkEarn | Turn Genuine Traffic into Measurable Earnings',
  description:
    'The premier performance link monetization platform. Create smart links, track real-time analytics with built-in fraud prevention, and monetize genuine traffic with automated payouts.',
  keywords: [
    'link monetization',
    'affiliate traffic',
    'cpc earnings',
    'cpm advertising',
    'smart links',
    'publisher revenue',
  ],
  authors: [{ name: 'LinkEarn Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LinkEarn',
  },
};

export const viewport = {
  themeColor: '#0B0F17',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0B0F17] text-gray-100 selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
