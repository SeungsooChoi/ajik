'use client';

import { useEffect, useState } from 'react';

/* ============================================================
 * useTabVisibility
 * ------------------------------------------------------------
 * Page Visibility API를 구독하여 탭 활성화 상태를 추적.
 * Next.js의 SSR 단계에서는 document가 없으므로 typeof 가드 필수.
 * ============================================================ */
export default function useTabVisibility(): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(() =>
    typeof document !== 'undefined' ? !document.hidden : true,
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
