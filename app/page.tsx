'use client';

/* ============================================================
 * app/page.tsx — '아직' 메인 페이지
 * ------------------------------------------------------------
 * 세 단계의 의식적 흐름:
 *   1) entry    — 고백 (입력)
 *   2) erosion  — 직면 (증식 + 응시)
 *   3) passage  — 통과 (결과 + 자동 복귀)
 *
 * 탭 이탈 시:
 *   - 어느 단계든 강제로 entry로 되돌리고 입력값까지 비움
 * ============================================================ */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Entry from '@/components/Entry';
import Erosion from '@/components/Erosion';
import Passage from '@/components/Passage';
import TabAlert from '@/components/TabAlert';
import useTabVisibility from '@/hooks/useTabVisibility';

type Stage = 'entry' | 'erosion' | 'passage';

export default function HomePage() {
  const [stage, setStage] = useState<Stage>('entry');
  const [confession, setConfession] = useState('');
  // Erosion에서 머무른 시간을 Passage로 전달하기 위한 보관
  const [finalElapsed, setFinalElapsed] = useState(0);

  const isVisible = useTabVisibility();

  // 탭 이탈 시 무조건 entry로 강제 복귀 (수동공격적 초기화)
  useEffect(() => {
    if (!isVisible) {
      setStage('entry');
      setConfession('');
      setFinalElapsed(0);
    }
  }, [isVisible]);

  // entry → erosion
  const handleConfess = (text: string) => {
    setConfession(text);
    setStage('erosion');
  };

  // erosion → passage (자발적 통과)
  const handlePassage = (elapsedSeconds: number) => {
    setFinalElapsed(elapsedSeconds);
    setStage('passage');
  };

  // passage → entry (자동 복귀)
  const handleReset = () => {
    setConfession('');
    setFinalElapsed(0);
    setStage('entry');
  };

  return (
    <main className="relative min-h-screen w-full">
      {/* 메인 콘텐츠 — 탭 이탈 시 blur+grayscale */}
      <motion.div
        animate={{
          filter: isVisible ? 'blur(0px) grayscale(0%)' : 'blur(12px) grayscale(100%)',
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ willChange: 'filter' }}
      >
        <AnimatePresence mode="wait">
          {stage === 'entry' && <Entry key="entry" onSubmit={handleConfess} />}
          {stage === 'erosion' && (
            <Erosion key="erosion" text={confession} sessionKey={confession} onPassage={handlePassage} />
          )}
          {stage === 'passage' && <Passage key="passage" elapsedSeconds={finalElapsed} onReset={handleReset} />}
        </AnimatePresence>
      </motion.div>

      {/* 탭 이탈 오버레이 */}
      <TabAlert visible={!isVisible} />
    </main>
  );
}
