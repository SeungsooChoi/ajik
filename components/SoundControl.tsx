'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SoundType } from '@/hooks/useAmbientSound';

/* ============================================================
 * <SoundControl /> — 사운드 컨트롤 UI
 * ------------------------------------------------------------
 * Erosion 화면 우측 하단(통과 버튼과 같은 줄)에 위치.
 *
 * 기본 상태: 현재 사운드 라벨 + (재생 중이면) 펄스 점 + 스피커 아이콘
 * 펼침: hover, 클릭 토글, 외부 클릭/Escape로 닫힘
 *
 * 분위기 보존:
 *  - 통과 출구와 동일한 타이포(자간, 색상)로 시각적 통일
 *  - 펼친 상태에서도 위계가 분명한 미니멀 레이아웃
 * ============================================================ */

function SpeakerIcon({ isMuted }: { isMuted: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {isMuted ? (
        <>
          <line x1="21" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="21" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      )}
    </svg>
  );
}

// 재생 중임을 표시하는 작은 펄스 점
function PlayingDot() {
  return (
    <motion.span
      aria-hidden
      className="inline-block h-[5px] w-[5px] rounded-full bg-stone-900"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

interface SoundControlProps {
  soundType: SoundType;
  volume: number;
  onSoundChange: (type: SoundType) => void;
  onVolumeChange: (vol: number) => void;
}

const SOUND_OPTIONS: { type: SoundType; label: string }[] = [
  { type: 'silence', label: '침묵' },
  { type: 'white', label: '백색소음' },
  { type: 'pink', label: '핑크노이즈' },
  { type: 'rain', label: '빗소리' },
  { type: 'wave', label: '파도소리' },
];

export default function SoundControl({ soundType, volume, onSoundChange, onVolumeChange }: SoundControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const currentLabel = SOUND_OPTIONS.find((opt) => opt.type === soundType)?.label ?? '침묵';
  const isMuted = soundType === 'silence';
  const displayVolume = isMuted ? 0 : Math.round(volume * 100);

  // 외부 클릭 / Escape 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className="relative w-44"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* ----- 펼쳐지는 패널 (옵션 + 볼륨) ----- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="sound-panel"
            role="group"
            aria-label="사운드 설정"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute bottom-full left-0 mb-6 w-44 bg-[#f5f3ee]/75 backdrop-blur-sm px-3 py-3"
          >
            {/* 사운드 옵션 목록 */}
            <ul className="mb-5 flex flex-col gap-2">
              {SOUND_OPTIONS.map((opt) => {
                const active = soundType === opt.type;
                return (
                  <li key={opt.type} className="flex items-center gap-2">
                    <button
                      onClick={() => onSoundChange(opt.type)}
                      aria-pressed={active}
                      className={`flex-1 text-left text-[11px] uppercase tracking-[0.3em] transition-colors cursor-pointer ${
                        active ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                    {active && opt.type !== 'silence' && <PlayingDot />}
                  </li>
                );
              })}
            </ul>

            {/* 볼륨 슬라이더 */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500">볼륨 — {displayVolume}%</span>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={displayVolume}
                onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                className="ajik-slider"
                aria-label="볼륨 조절"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----- 기본 표시 (현재 사운드 라벨 + 재생 점 + 스피커) ----- */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls="sound-panel"
        aria-label="사운드 설정"
        className="flex w-44 items-center justify-between cursor-pointer bg-[#f5f3ee]/80 backdrop-blur-sm px-3 py-2 text-md uppercase tracking-[0.4em] text-stone-500 transition-colors hover:text-stone-900"
      >
        <span className="flex items-center gap-2">
          {currentLabel}
          {!isMuted && <PlayingDot />}
        </span>
        <SpeakerIcon isMuted={isMuted} />
      </button>

      {/* ----- 슬라이더 스타일 (range input은 Tailwind만으로 한계가 있음) ----- */}
      <style jsx>{`
        .ajik-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 2px;
          background: #d6d3d1; /* stone-300 */
          outline: none;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .ajik-slider:hover {
          background: #a8a29e; /* stone-400 */
        }
        .ajik-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #1c1917; /* stone-900 */
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .ajik-slider:hover::-webkit-slider-thumb {
          transform: scale(1.15);
        }
        .ajik-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #1c1917;
          cursor: pointer;
          border: none;
          transition: transform 0.15s ease;
        }
        .ajik-slider:hover::-moz-range-thumb {
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
}
