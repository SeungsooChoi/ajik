/* ============================================================
 * <JsonLd /> — Schema.org 구조화 데이터
 * ------------------------------------------------------------
 * 'use client' 없음 → 서버에서 정적 렌더되어 크롤러가 즉시 읽음.
 * WebApplication 타입으로 선언하여 구글이 앱임을 명확히 인지하게 함.
 * ============================================================ */
export default function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '아직 · ajik',
    alternateName: 'ajik',
    description: '당신이 미루고 있는 일을 입력하고, 그 일을 마주하며 머무르는 동안만 시간이 흐르는 미니멀한 집중 도구.',
    url: 'https://ajik.example.com',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Any (Web)',
    inLanguage: 'ko-KR',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
  };

  return (
    <script
      type="application/ld+json"
      // dangerouslySetInnerHTML가 표준 방식 — Next.js 공식 문서 권장
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
