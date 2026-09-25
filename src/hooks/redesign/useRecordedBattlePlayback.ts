'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BattleResult } from '../../domain/redesign/battle';
import { recordedBattleFrameDuration } from '../../domain/presentation/recordedBattlePresentation';

interface Options {
  result: BattleResult;
  initialFrame?: number;
  initialPaused?: boolean;
  vipActive: boolean;
  blocked?: boolean;
  minimumFrameDuration?: (result: BattleResult, index: number) => number;
}
const clampFrame = (index: number, result: BattleResult) => Math.max(0, Math.min(Number.isFinite(index) ? Math.floor(index) : 0, result.frames.length - 1));

/** A single cancellable clock controls all recorded state, including HP, SP and cut-ins. */
export function useRecordedBattlePlayback({ result, initialFrame = 0, initialPaused = false, vipActive, blocked = false, minimumFrameDuration }: Options) {
  const [index, setIndex] = useState(() => clampFrame(initialFrame, result));
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(initialPaused);
  const clock = useRef<{ result: BattleResult; index: number; remaining: number } | null>(null);
  const generation = useRef(0);
  const frame = result.frames[clampFrame(index, result)];
  const effectiveSpeed = speed;
  const finished = !frame || index >= result.frames.length - 1;
  const playbackPaused = paused || blocked || finished;

  useEffect(() => {
    generation.current += 1;
    clock.current = null;
    setIndex(clampFrame(initialFrame, result));
    setPaused(initialPaused);
  }, [result, initialFrame, initialPaused]);
  useEffect(() => { if (!vipActive && speed > 2) setSpeed(1); }, [vipActive, speed]);
  useEffect(() => {
    if (!clock.current || clock.current.result !== result || clock.current.index !== index) {
      clock.current = { result, index, remaining: Math.max(recordedBattleFrameDuration(frame), minimumFrameDuration?.(result,index) ?? 0) };
    }
    if (playbackPaused) return;
    const activeClock = clock.current;
    const activeGeneration = generation.current;
    const startedAt = performance.now();
    const timer = setTimeout(() => {
      if (generation.current !== activeGeneration) return;
      activeClock.remaining = 0;
      setIndex(current => Math.min(current + 1, result.frames.length - 1));
    }, Math.max(0, activeClock.remaining / effectiveSpeed));
    return () => {
      clearTimeout(timer);
      activeClock.remaining = Math.max(0, activeClock.remaining - (performance.now() - startedAt) * effectiveSpeed);
    };
  }, [result, index, frame, effectiveSpeed, playbackPaused, minimumFrameDuration]);

  const cycleSpeed = useCallback(() => setSpeed(value => value >= (vipActive ? 3 : 2) ? 1 : value + 1), [vipActive]);
  const skip = useCallback(() => {
    if (!vipActive) return;
    generation.current += 1;
    clock.current = null;
    setIndex(Math.max(0, result.frames.length - 1));
  }, [vipActive, result]);
  return { index, frame, finished, speed, effectiveSpeed, paused, playbackPaused, setPaused, cycleSpeed, skip };
}
