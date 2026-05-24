'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ============================================================
 * useAmbientSound
 * ------------------------------------------------------------
 * 환경음 재생/정지/볼륨 제어를 담당하는 훅.
 *
 * 지원 사운드 종류:
 *  - "silence" : 무음 (기본값)
 *  - "white"   : 백색소음 — Web Audio API로 실시간 생성
 *  - "pink"    : 핑크노이즈 — 백색소음보다 부드러움
 *  - "rain"    : 빗소리 — /public/sounds/rain.mp3 파일 필요
 *
 * 자동재생 정책 대응:
 *  - AudioContext는 사용자 인터랙션 직후에만 생성/재개 가능
 *  - 따라서 첫 play() 호출 시점에 AudioContext를 만든다
 *
 * 메모리 정리:
 *  - 컴포넌트 언마운트 시 모든 노드/소스를 정리
 * ============================================================ */

export type SoundType = 'silence' | 'white' | 'pink' | 'rain' | 'wave';

interface UseAmbientSoundReturn {
  soundType: SoundType;
  volume: number;
  isPlaying: boolean;
  setSoundType: (type: SoundType) => void;
  setVolume: (vol: number) => void;
}

const RAIN_FILE_PATH = '/sounds/rain.mp3';
const WAVES_FILE_PATH = '/sounds/waves.mp3';

export default function useAmbientSound(
  // 초기 사운드 — Erosion 시작 시 자동으로 켜질 사운드
  initialSound: SoundType = 'silence',
  // 초기 볼륨 (0 ~ 1) — 기본 10%
  initialVolume: number = 8,
): UseAmbientSoundReturn {
  const [soundType, setSoundType] = useState<SoundType>(initialSound);
  const [volume, setVolume] = useState<number>(initialVolume);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Web Audio 관련 ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const rainElementRef = useRef<HTMLAudioElement | null>(null);
  const waveElementRef = useRef<HTMLAudioElement | null>(null);

  // 사운드 전환 effect가 볼륨 변경으로 재실행되어 오디오가 재시작되는 것을 막기 위해
  // 최신 볼륨을 ref로 보관. 실제 볼륨 변경은 아래의 별도 useEffect가 즉시 반영.
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  /* ----- AudioContext 지연 초기화 -----
   *  자동재생 정책 때문에 사용자 인터랙션 시점에 만들어야 한다.
   *  Erosion 진입 = "직면한다" 버튼 클릭 직후이므로 안전. */
  const ensureContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    // Safari 호환을 위해 webkitAudioContext도 fallback
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    audioContextRef.current = ctx;

    // 볼륨 제어용 GainNode를 한 번만 만들어 재사용
    const gain = ctx.createGain();
    gain.gain.value = volumeRef.current;
    gain.connect(ctx.destination);
    gainNodeRef.current = gain;

    return ctx;
  }, []);

  /* ----- 노이즈 버퍼 생성 -----
   *  2초 분량 노이즈를 만들고 loop 재생.
   *  type에 따라 백색/핑크 알고리즘 분기. */
  const createNoiseBuffer = useCallback((ctx: AudioContext, type: 'white' | 'pink'): AudioBuffer => {
    const bufferSize = ctx.sampleRate * 2; // 2초
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      // 백색소음: 균등 분포 무작위 값// 원본은 파형이 너무 크므로 0.1 ~ 0.2 정도를 곱해 기본 진폭을 낮춥니다.
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }
    } else {
      // 핑크노이즈: Paul Kellet의 알고리즘 (1/f 분포)
      // 백색소음보다 저주파가 강해 더 부드럽게 들림
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }, []);

  /* ----- 모든 사운드 정리 ----- */
  const stopAll = useCallback(() => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
      } catch {
        // 이미 정지된 경우 무시
      }
      noiseSourceRef.current.disconnect();
      noiseSourceRef.current = null;
    }
    if (rainElementRef.current) {
      rainElementRef.current.pause();
      rainElementRef.current.currentTime = 0;
    }
    if (waveElementRef.current) {
      waveElementRef.current.pause();
      waveElementRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  /* ----- 사운드 종류 변경 감지 → 재생/정지 처리 -----
   *  silence는 stopAll로 일괄 처리.
   *  그 외 전환은 noise/rain/wave 세 소스를 모두 멈춘 뒤 새 소스를 시작 —
   *  분기별 개별 정리를 누락해 발생했던 rain ↔ wave 동시 재생 버그 차단. */
  useEffect(() => {
    if (soundType === 'silence') {
      stopAll();
      return;
    }

    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
      } catch {}
      noiseSourceRef.current.disconnect();
      noiseSourceRef.current = null;
    }
    if (rainElementRef.current) {
      rainElementRef.current.pause();
      rainElementRef.current.currentTime = 0;
    }
    if (waveElementRef.current) {
      waveElementRef.current.pause();
      waveElementRef.current.currentTime = 0;
    }

    if (soundType === 'white' || soundType === 'pink') {
      const ctx = ensureContext();
      const gain = gainNodeRef.current!;

      const source = ctx.createBufferSource();
      source.buffer = createNoiseBuffer(ctx, soundType);
      source.loop = true;
      source.connect(gain);
      source.start();
      noiseSourceRef.current = source;

      setIsPlaying(true);
      return;
    }

    if (soundType === 'rain') {
      if (!rainElementRef.current) {
        const audio = new Audio(RAIN_FILE_PATH);
        audio.loop = true;
        rainElementRef.current = audio;
      }
      const audio = rainElementRef.current;
      audio.volume = volumeRef.current;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('빗소리 재생 실패:', err);
          setIsPlaying(false);
        });
      return;
    }

    if (soundType === 'wave') {
      if (!waveElementRef.current) {
        const audio = new Audio(WAVES_FILE_PATH);
        audio.loop = true;
        waveElementRef.current = audio;
      }
      const audio = waveElementRef.current;
      audio.volume = volumeRef.current;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('파도소리 재생 실패:', err);
          setIsPlaying(false);
        });
      return;
    }
  }, [soundType, ensureContext, createNoiseBuffer, stopAll]);

  /* ----- 볼륨 변경 → 즉시 반영 ----- */
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
    if (rainElementRef.current) {
      rainElementRef.current.volume = volume;
    }
    if (waveElementRef.current) {
      waveElementRef.current.volume = volume;
    }
  }, [volume]);

  /* ----- 언마운트 시 정리 ----- */
  useEffect(() => {
    return () => {
      stopAll();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [stopAll]);

  return {
    soundType,
    volume,
    isPlaying,
    setSoundType,
    setVolume,
  };
}
