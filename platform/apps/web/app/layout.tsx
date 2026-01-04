import type { Metadata } from 'next';
import { Noto_Sans_Thai, Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  variable: '--font-sans',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | WARIS',
    default: 'WARIS - ระบบวิเคราะห์น้ำสูญเสียอัจฉริยะ',
  },
  description:
    'Water Loss Intelligent Analysis and Reporting System สำหรับการประปาส่วนภูมิภาค (กปภ.)',
  keywords: [
    'water loss',
    'DMA',
    'น้ำสูญเสีย',
    'การประปา',
    'AI',
    'analytics',
    'กปภ',
    'PWA',
  ],
  authors: [{ name: 'Provincial Waterworks Authority' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${notoSansThai.variable} ${inter.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
