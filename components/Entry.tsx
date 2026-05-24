'use client';

import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

/* ============================================================
 * <Entry /> — 진입 단계 (The Confession)
 * ------------------------------------------------------------
 * 미루고 있는 일을 입력받는 단계. 10자 이상이어야 진행 가능.
 *
 * 폰트 참조:
 *  - layout.tsx에서 next/font가 --font-newsreader, --font-manrope
 *    CSS 변수를 주입함. Tailwind의 font-serif/font-sans로 매핑되어 있음.
 * ============================================================ */
interface EntryProps {
  onSubmit: (text: string) => void;
}

export default function Entry({ onSubmit }: EntryProps) {
  const [text, setText] = useState('');
  const isReady = text.trim().length >= 10;

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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex min-h-screen w-full flex-col items-center justify-center px-6 font-serif"
    >
      {/* 상단 작은 라벨 */}
      <p className="mb-12 text-xs uppercase tracking-[0.4em] text-stone-400 font-sans">아직 · ajik</p>

      {/* 메인 질문 */}
      <h1
        className="mb-10 max-w-2xl text-center text-3xl leading-snug text-stone-900 md:text-4xl"
        style={{ fontWeight: 400, letterSpacing: '-0.015em' }}
      >
        지금 무엇을 미루고 이곳에 오셨습니까?
      </h1>

      {/* 입력창 */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="구체적으로 적으십시오. 10자 이상."
        rows={2}
        className="w-full max-w-xl resize-none border-b border-stone-300 bg-transparent px-2 py-3 text-center text-lg text-stone-800 placeholder:text-stone-300 focus:border-stone-800 focus:outline-none font-sans"
        style={{ fontWeight: 300 }}
      />

      {/* 글자 수 카운터 */}
      <p className="mt-4 text-xs text-stone-400 font-sans">{text.trim().length} / 10자</p>

      {/* 시작 버튼 */}
      <motion.button
        onClick={handleSubmit}
        disabled={!isReady}
        animate={{
          opacity: isReady ? 1 : 0.3,
          y: isReady ? 0 : 4,
        }}
        transition={{ duration: 0.3 }}
        whileHover={isReady ? { scale: 1.02 } : {}}
        whileTap={isReady ? { scale: 0.98 } : {}}
        className="mt-12 border border-stone-800 px-10 py-3 text-sm uppercase tracking-[0.3em] text-stone-800 disabled:cursor-not-allowed font-sans"
      >
        직면한다
      </motion.button>

      {/* 하단 안내 */}
      <p className="mt-16 max-w-md text-center text-xs leading-relaxed text-stone-400 font-sans">
        이곳에 머무는 동안 당신은 그 일을 마주합니다.
        <br />
        탭을 떠나면 처음부터 다시 시작해야 합니다.
      </p>
    </motion.section>
  );
}
