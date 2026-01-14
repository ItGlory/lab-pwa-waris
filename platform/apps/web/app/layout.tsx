import type { Metadata } from 'next';
import { Sarabun, Prompt, Inter, Noto_Sans_Thai } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

// Primary Thai body font (PWA standard)
const sarabun = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Thai heading font (PWA standard)
const prompt = Prompt({
  weight: ['400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-heading',
  display: 'swap',
});

// English/Numbers font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Fallback Thai font
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  variable: '--font-noto',
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
    <html lang="th" className="light" suppressHydrationWarning>
      <body
        className={`${sarabun.variable} ${prompt.variable} ${inter.variable} ${notoSansThai.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
