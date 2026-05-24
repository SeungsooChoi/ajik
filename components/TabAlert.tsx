'use client';

import { motion, AnimatePresence } from 'framer-motion';

/* ============================================================
 * <TabAlert /> — 탭 이탈 오버레이
 * ------------------------------------------------------------
 * 단일 폰트(Newsreader)로 통일.
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
            className="text-center text-3xl leading-relaxed text-stone-900 md:text-4xl"
            style={{ fontWeight: 400, letterSpacing: '-0.015em' }}
          >
            돌아오시면 처음부터입니다.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
