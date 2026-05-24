'use client';

import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

/* ============================================================
 * <Entry /> — 진입 단계
 * ------------------------------------------------------------
 * 단일 폰트(Newsreader)로 통일.
 * 위계는 크기·자간·색상·이탤릭으로 표현:
 *  - 작은 라벨   : 11px, 자간 0.5em, 대문자, stone-600
 *  - 큰 질문     : 5xl, 자간 -0.02em, stone-900
 *  - 입력/메타   : 18px, stone-900 / 10px stone-600
 *  - 버튼       : 12px, 자간 0.5em, 대문자
 * ============================================================ */

interface EntryProps {
  onSubmit: (text: string) => void;
}

export default function Entry({ onSubmit }: EntryProps) {
  const [text, setText] = useState('');
  const isReady = text.trim().length >= 1;

  const handleSubmit = () => {
    if (!isReady) return;
    onSubmit(text.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.0, ease: 'easeOut' }}
      className="flex min-h-screen w-full flex-col items-center justify-center px-6"
    >
      {/* 작은 표식 — 자간을 극단적으로 넓혀 산세리프 같은 절제된 인상 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.4 }}
        className="mb-24 text-xl uppercase tracking-[0.5em] text-stone-600"
      >
        아직
      </motion.p>

      {/* 본 질문 — Newsreader 세리프의 진중함이 빛나는 자리 */}
      <motion.h1
        className="mb-20 max-w-4xl text-center text-3xl leading-snug text-stone-900 md:text-5xl"
        style={{ fontWeight: 400, letterSpacing: '-0.02em' }}
      >
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0, ease: 'easeOut' }}
          className="block"
        >
          지금 무엇을 멈추고 이곳에 오셨나요?
        </motion.span>
      </motion.h1>

      {/* 입력 + 메타 + 버튼 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 2.2, ease: 'easeOut' }}
        className="flex w-full max-w-xl flex-col items-center"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="한 문장으로 적으세요"
          rows={2}
          className="w-full resize-none border-b border-stone-400 bg-transparent px-2 py-3 text-center text-lg text-stone-900 placeholder:italic placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
          style={{ fontWeight: 300 }}
        />

        <motion.button
          onClick={handleSubmit}
          disabled={!isReady}
          whileHover={isReady ? { scale: 1.02 } : {}}
          whileTap={isReady ? { scale: 0.98 } : {}}
          className={`mt-12 border px-12 py-3 text-xs uppercase tracking-[0.5em] transition-colors ${
            isReady
              ? 'border-stone-900 text-stone-900 cursor-pointer'
              : 'border-stone-300 text-stone-400 cursor-not-allowed'
          }`}
        >
          생각하기
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
