'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/* ============================================================
 * <Erosion /> — 메인 진행 단계 (Visual Erosion)
 * ------------------------------------------------------------
 * 사용자가 고백한 문장을 시간이 지날수록 점점 더 많이,
 * 점점 더 굵고 진하게 화면 전체에 증식시킨다.
 *
 * 시각적 압박 메커니즘:
 *  1) 텍스트 개수 증식 (3초마다 1개, 최대 80개)
 *  2) 무작위 좌표 분포
 *  3) 인스턴스별 페이드인 (0 → 1, 8초)
 *  4) 가변 폰트 굵기 (100 → 900, 60초)
 *  5) 시간 경과에 따른 가장자리 비네팅 (배경 압박)
 * ============================================================ */

interface ErosionProps {
  text: string;
  sessionKey: string;
}

interface Instance {
  id: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  fontSize: number;
  bornAt: number;
}

export default function Erosion({ text, sessionKey }: ErosionProps) {
  const [elapsed, setElapsed] = useState(0);
  const [instances, setInstances] = useState<Instance[]>([]);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ----- 경과 시간 측정 (RAF 기반) -----
   * 탭이 hidden일 때 RAF는 자동 멈춤 → 백그라운드 카운트 누적 방지 */
  useEffect(() => {
    startTimeRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const seconds = (now - startTimeRef.current) / 1000;
      setElapsed(seconds);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sessionKey]);

  /* ----- 텍스트 증식 로직 ----- */
  useEffect(() => {
    setInstances([createInstance(0)]);

    spawnIntervalRef.current = setInterval(() => {
      setInstances((prev) => {
        if (prev.length >= 80) return prev;
        const now = (performance.now() - startTimeRef.current) / 1000;
        return [...prev, createInstance(now)];
      });
    }, 3000);

    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, [sessionKey]);

  // 전역 진행도 (0 ~ 1)
  const progress = Math.min(elapsed / 60, 1);
  const globalWeight = Math.round(100 + progress * 800); // 100 → 900

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans" style={{ background: '#f5f3ee' }}>
      {/* 상단 좌측: 경과 시간 */}
      <div className="absolute left-8 top-8 z-20">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">경과</p>
        <p className="mt-1 text-lg tabular-nums text-stone-700">{formatTime(elapsed)}</p>
      </div>

      {/* 상단 우측: 증식 카운트 */}
      <div className="absolute right-8 top-8 z-20 text-right">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">증식</p>
        <p className="mt-1 text-lg tabular-nums text-stone-700">{instances.length}</p>
      </div>

      {/* 증식 텍스트 레이어 */}
      {instances.map((inst) => {
        const age = elapsed - inst.bornAt;
        const localOpacity = Math.max(0, Math.min(age / 8, 1));

        return (
          <motion.span
            key={inst.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: localOpacity, scale: inst.scale }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute select-none whitespace-nowrap text-stone-900"
            style={{
              left: `${inst.x}%`,
              top: `${inst.y}%`,
              transform: `translate(-50%, -50%) rotate(${inst.rotate}deg)`,
              transformOrigin: 'center',
              fontVariationSettings: `"wght" ${globalWeight}`,
              fontWeight: globalWeight,
              fontSize: `${inst.fontSize}px`,
              letterSpacing: `${-0.01 * progress}em`,
            }}
          >
            {text}
          </motion.span>
        );
      })}

      {/* ----- 비네팅 레이어 -----
       * 시간이 지날수록 화면 가장자리가 어두워지며 압박감 가중
       * pointer-events-none으로 인터랙션 막지 않음 */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: `radial-gradient(ellipse at center,
            transparent 40%,
            rgba(0, 0, 0, ${progress * 0.25}) 100%)`,
          transition: 'background 0.4s linear',
        }}
      />

      {/* 하단: 진행도 게이지 */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">압박 강도</p>
        <div className="mt-2 h-px w-64 bg-stone-300">
          <motion.div
            className="h-full bg-stone-800"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * 헬퍼
 * ============================================================ */
function createInstance(bornAt: number): Instance {
  return {
    id: `${bornAt}-${Math.random().toString(36).slice(2, 8)}`,
    x: 5 + Math.random() * 90,
    y: 5 + Math.random() * 90,
    rotate: (Math.random() - 0.5) * 16,
    scale: 0.95 + Math.random() * 0.15,
    fontSize: 18 + Math.random() * 38,
    bornAt,
  };
}

function formatTime(totalSeconds: number): string {
  const total = Math.floor(totalSeconds);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}
