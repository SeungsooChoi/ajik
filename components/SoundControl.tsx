'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SoundType } from '@/hooks/useAmbientSound';

/* ============================================================
 * <SoundControl /> — 사운드 컨트롤 UI
 * ------------------------------------------------------------
 * Erosion 화면 좌측 하단에 위치.
 *
 * 기본 상태: 현재 사운드 라벨만 표시 (예: "백색소음")
 * 호버 시: 사운드 선택지 + 볼륨 슬라이더가 위로 펼쳐짐
 *
 * 분위기 보존:
 *  - 통과 출구와 동일한 타이포(자간, 색상)로 시각적 통일
 *  - 펼친 상태에서도 위계가 분명한 미니멀 레이아웃
 * ============================================================ */
// 미니멀 벡터 스피커 아이콘 컴포넌트
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
];

export default function SoundControl({ soundType, volume, onSoundChange, onVolumeChange }: SoundControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 현재 선택된 사운드의 라벨 (기본 표시용)
  const currentLabel = SOUND_OPTIONS.find((opt) => opt.type === soundType)?.label ?? '침묵';
  const isMuted = soundType === 'silence';

  // 침묵일 때는 표시 볼륨을 0으로 고정, 아닐 때는 실제 볼륨 표시
  const displayVolume = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div
      className="absolute w-16 bottom-8 z-30"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* ----- 펼쳐지는 패널 (옵션 + 볼륨) ----- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            // className="absolute bottom-full left-0 mb-3 w-48 bg-stone-50 p-5 rounded-lg shadow-xl border border-stone-100"
            className="absolute bottom-6 left-0 mb-6 w-44"
          >
            {/* 사운드 옵션 목록 */}
            <ul className="mb-4 flex flex-col gap-2">
              {SOUND_OPTIONS.map((opt) => (
                <li key={opt.type}>
                  <button
                    onClick={() => onSoundChange(opt.type)}
                    className={`text-left text-[11px] uppercase tracking-[0.3em] transition-colors cursor-pointer ${
                      soundType === opt.type ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* 볼륨 슬라이더 */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500">볼륨 {displayVolume}</span>
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

      {/* ----- 기본 표시 (현재 사운드 라벨) -----
       *  통과 출구와 같은 톤. 호버 시 약간 진해짐 */}
      <button
        className="w-40 flex gap-2 items-center cursor-pointer text-md uppercase tracking-[0.4em] text-stone-500 transition-colors hover:text-stone-900"
        aria-label="사운드 설정"
      >
        {currentLabel}
        <SpeakerIcon isMuted={isMuted} />
      </button>

      {/* ----- 슬라이더 스타일 (range input은 Tailwind만으로 한계가 있음) ----- */}
      <style jsx>{`
        .ajik-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 1px;
          background: #a8a29e; /* stone-400 */
          outline: none;
          cursor: pointer;
        }
        .ajik-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #1c1917; /* stone-900 */
          cursor: pointer;
        }
        .ajik-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #1c1917;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
