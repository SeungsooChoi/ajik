import type { Metadata, Viewport } from 'next';
import { Newsreader } from 'next/font/google';
import JsonLd from '@/components/JsonLd';
import './globals.css';

/* ============================================================
 * 폰트 — Newsreader 하나로 통일
 * 위계는 크기·자간·이탤릭·색상으로 만들고 폰트는 일관되게 유지
 * ============================================================ */
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ajik.example.com'),
  title: {
    default: '아직 — 미루고 있는 일을 직면하는 공간',
    template: '%s | 아직 · ajik',
  },
  description:
    '당신이 미루고 있는 일을 입력하고, 그 일을 마주하며 머무르는 동안만 시간이 흐르는 미니멀한 집중 도구. 탭을 떠나면 처음부터 다시 시작해야 합니다.',
  keywords: ['미루기 극복', '집중 도구', '딥워크', '포모도로 대안', '멍때리기', '직면', 'ajik', '아직'],
  authors: [{ name: 'ajik' }],
  creator: 'ajik',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://ajik.example.com',
    siteName: '아직 · ajik',
    title: '아직 — 미루고 있는 일을 직면하는 공간',
    description:
      '당신이 미루고 있는 일을 입력하고 머무르는 동안만 시간이 흐릅니다. 탭을 떠나면 처음부터 다시 시작해야 합니다.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: '아직 · ajik',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '아직 — 미루고 있는 일을 직면하는 공간',
    description: '머무르는 동안만 시간이 흐르는 미니멀한 집중 도구. 탭을 떠나면 처음부터 다시 시작해야 합니다.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5f3ee',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={newsreader.variable}>
      <body>
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
