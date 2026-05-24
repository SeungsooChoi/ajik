import type { Metadata, Viewport } from 'next';
import { Manrope, Newsreader } from 'next/font/google';
import './globals.css';
import JsonLd from '@/components/JsonLd';

/* ============================================================
 * next/font/google로 폰트 셀프 호스팅
 * - 빌드 타임에 폰트 파일을 Next.js 도메인으로 다운로드 → 외부 요청 0건
 * - FOUT/FOIT 방지 (display: swap)
 * - CSS 변수로 노출해 Tailwind와 인라인 style 모두에서 사용
 * - variable axis 'wght' 200~800 전체 범위를 받아 Erosion에서 활용
 * ============================================================ */
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-newsreader',
  display: 'swap',
});

/* ============================================================
 * SEO 메타데이터 — 정적 HTML에 인라인으로 박힌다
 * Next.js가 빌드 시 <head>에 자동 삽입하므로 크롤러가 즉시 읽음
 * ============================================================ */
export const metadata: Metadata = {
  // 도메인이 정해지면 metadataBase를 실제 URL로 교체할 것
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

  // 검색엔진 크롤링 허용
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

  // Open Graph (Slack, KakaoTalk, Twitter 등 공유 카드)
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
        // /public/og.png 파일을 1200x630으로 준비해 둘 것
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

  // 정식 URL 지정 — 중복 콘텐츠 방지
  alternates: {
    canonical: '/',
  },

  // 검색 콘솔 인증 토큰 (Search Console 등록 시 채워 넣을 것)
  // verification: {
  //   google: "여기에-구글-검증-코드",
  // },
};

/* ============================================================
 * Viewport는 Next 14에서 metadata와 분리되었다
 * 모바일에서 텍스트 증식이 보기 좋게 펼쳐지도록 설정
 * ============================================================ */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5f3ee',
};

/* ============================================================
 * RootLayout — 서버 컴포넌트
 * 'use client' 지시어 없음 → 정적 HTML로 렌더되어 크롤러 친화적
 * ============================================================ */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${manrope.variable} ${newsreader.variable}`}>
      <body className="font-sans">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
