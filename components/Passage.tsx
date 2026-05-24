'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

/* ============================================================
 * <Passage /> — 종료 단계
 * ------------------------------------------------------------
 * 단일 폰트(Newsreader)로 통일.
 * 두 문장만 남김.
 * ============================================================ */
interface PassageProps {
  elapsedSeconds: number;
  onReset: () => void;
}

export default function Passage({ elapsedSeconds, onReset }: PassageProps) {
  useEffect(() => {
    const timer = setTimeout(onReset, 6000);
    return () => clearTimeout(timer);
  }, [onReset]);

  const m = Math.floor(elapsedSeconds / 60);
  const s = Math.floor(elapsedSeconds % 60);
  const timeText = m === 0 ? `${s}초` : s === 0 ? `${m}분` : `${m}분 ${s}초`;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4, ease: 'easeOut' }}
      className="flex min-h-screen w-full flex-col items-center justify-center px-6"
    >
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
        className="text-center text-2xl text-stone-900 md:text-3xl"
        style={{ fontWeight: 400, letterSpacing: '-0.01em' }}
      >
        {timeText} 머물렀습니다.
      </motion.h1>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 2.0, ease: 'easeOut' }}
        className="my-14 h-px w-24 origin-center bg-stone-500"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 2.8 }}
        className="text-center text-base italic text-stone-700"
      >
        그 일은 그대로 있습니다.
      </motion.p>
    </motion.section>
  );
}
