'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import SoundControl from './SoundControl';
import useAmbientSound from '@/hooks/useAmbientSound';

/* ============================================================
 * <Erosion /> — 진행 단계
 * ------------------------------------------------------------
 * 단일 폰트(Newsreader)로 통일.
 * 증식 텍스트도 세리프로 — '문장이 쌓여가는' 인상이 산세리프보다
 * 더 무게 있게 다가온다.
 * ============================================================ */

interface ErosionProps {
  text: string;
  sessionKey: string;
  onPassage: (elapsedSeconds: number) => void;
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

const OBSERVATIONS: [number, string][] = [
  [0, '당신이 머물고 있습니다.'],
  [60, '조금 더 머무르십시오.'],
  [180, '당신은 그 일과 함께 있습니다.'],
  [360, '이 시간은 사라지지 않습니다.'],
];

export default function Erosion({ text, sessionKey, onPassage }: ErosionProps) {
  const [elapsed, setElapsed] = useState(0);
  const [instances, setInstances] = useState<Instance[]>([]);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ----- 환경음 훅 -----
   *  기본값: 백색소음, 15% 볼륨
   *  사용자가 원하면 SoundControl로 변경 가능 */
  const { soundType, volume, setSoundType, setVolume } = useAmbientSound('silence', 0.15);

  /* 경과 시간 측정 (RAF) */
  useEffect(() => {
    startTimeRef.current = performance.now();
    const tick = () => {
      setElapsed((performance.now() - startTimeRef.current) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sessionKey]);

  /* 텍스트 증식 로직 */
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

  const progress = Math.min(elapsed / 60, 1);

  const currentObservation = useMemo(() => {
    let chosen = OBSERVATIONS[0][1];
    for (const [threshold, sentence] of OBSERVATIONS) {
      if (elapsed >= threshold) chosen = sentence;
    }
    return chosen;
  }, [elapsed]);

  return (
    <div className="relative h-screen w-full overflow-hidden" style={{ background: '#f5f3ee' }}>
      {/* 응시자 — 이탤릭 세리프로 부드러운 응시감 */}
      <div className="absolute left-0 right-0 top-14 z-20 flex justify-center">
        <motion.p
          key={currentObservation}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="text-sm italic text-stone-700"
        >
          {currentObservation}
        </motion.p>
      </div>

      {/* 증식 텍스트 — 세리프의 무게가 누적되는 효과 */}
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
              fontWeight: 400,
              fontSize: `${inst.fontSize}px`,
            }}
          >
            {text}
          </motion.span>
        );
      })}

      {/* 비네팅 */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: `radial-gradient(ellipse at center,
            transparent 35%,
            rgba(0, 0, 0, ${progress * 0.35}) 100%)`,
          transition: 'background 0.4s linear',
        }}
      />

      <div className="absolute bottom-14 right-10 z-30 flex flex-col items-end gap-6">
        {/* ----- 사운드 컨트롤 (좌측 하단) ----- */}
        <SoundControl soundType={soundType} volume={volume} onSoundChange={setSoundType} onVolumeChange={setVolume} />

        {/* 통과 출구 — 자간을 넓혀 절제된 인상 유지 */}
        <button
          onClick={() => onPassage(elapsed)}
          className="flex cursor-pointer bg-[#f5f3ee]/80 backdrop-blur-sm px-3 py-2 text-md uppercase tracking-[0.4em] text-stone-500 transition-colors hover:text-stone-900"
        >
          통과 →
        </button>
      </div>
    </div>
  );
}

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
