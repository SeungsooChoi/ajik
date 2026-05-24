'use client';

import { motion, AnimatePresence } from 'framer-motion';

/* ============================================================
 * <TabAlert /> — 탭 이탈 시 수동공격적 오버레이
 * ------------------------------------------------------------
 * 필터 적용은 page.tsx의 모션 div가 담당.
 * 이 컴포넌트는 오버레이 메시지만 책임진다.
 * ============================================================ */
interface TabAlertProps {
  visible: boolean;
}

export default function TabAlert({ visible }: TabAlertProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-8"
        >
          <p
            className="text-center text-2xl leading-relaxed text-stone-900 md:text-3xl font-serif"
            style={{ fontWeight: 400, letterSpacing: '-0.01em' }}
          >
            흐름이 끊겼습니다.
            <br />
            돌아오시면 처음부터 다시 시작해야 합니다.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
