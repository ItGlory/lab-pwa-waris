import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WARIS - ระบบวิเคราะห์น้ำสูญเสียอัจฉริยะ',
  description: 'Water Loss Intelligent Analysis and Reporting System สำหรับการประปาส่วนภูมิภาค',
  keywords: ['water loss', 'DMA', 'น้ำสูญเสีย', 'การประปา', 'AI', 'analytics'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
