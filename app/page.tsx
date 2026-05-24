'use client';

/* ============================================================
 * app/page.tsx — '아직' 메인 페이지
 * ------------------------------------------------------------
 * Next.js App Router에서 / 경로에 매핑되는 페이지.
 * 'use client'를 선언한 이유:
 *  - useState, useEffect, Framer Motion AnimatePresence는 클라이언트 전용
 *  - useTabVisibility 훅이 document를 참조함
 *
 * 단, layout.tsx는 서버 컴포넌트로 유지되므로
 * <head>의 SEO 메타데이터는 정적 HTML에 박힘 → 크롤러 친화적
 * ============================================================ */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Erosion from '@/components/Erosion';
import Entry from '@/components/Entry';
import useTabVisibility from '@/hooks/useTabVisibility';
import TabAlert from '@/components/TabAlert';

export default function HomePage() {
  // ----- 단계 상태 -----
  const [stage, setStage] = useState<'entry' | 'erosion'>('entry');

  // ----- 사용자가 입력한 미루는 일 -----
  const [confession, setConfession] = useState('');

  // ----- 탭 가시성 -----
  const isVisible = useTabVisibility();

  // ----- 탭 이탈 시 강제 초기화 -----
  // hidden 상태가 되면 Entry로 되돌리고 입력값까지 비운다
  useEffect(() => {
    if (!isVisible) {
      setStage('entry');
      setConfession('');
    }
  }, [isVisible]);

  // ----- Entry → Erosion 전환 -----
  const handleConfess = (text: string) => {
    setConfession(text);
    setStage('erosion');
  };

  return (
    <main className="relative min-h-screen w-full">
      {/* 메인 콘텐츠 — 탭 이탈 시 blur+grayscale 필터 */}
      <motion.div
        animate={{
          filter: isVisible ? 'blur(0px) grayscale(0%)' : 'blur(12px) grayscale(100%)',
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ willChange: 'filter' }}
      >
        <AnimatePresence mode="wait">
          {stage === 'entry' && <Entry key="entry" onSubmit={handleConfess} />}
          {stage === 'erosion' && <Erosion key="erosion" text={confession} sessionKey={confession} />}
        </AnimatePresence>
      </motion.div>

      {/* 오버레이 텍스트 — 필터 위에 떠 있음 */}
      <TabAlert visible={!isVisible} />
    </main>
  );
}
