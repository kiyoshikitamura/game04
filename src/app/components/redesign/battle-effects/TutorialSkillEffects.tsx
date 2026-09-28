'use client';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import type { BattleResult } from '@/domain/redesign/battle';
import { projectRecordedBattleFrame } from '@/domain/presentation/recordedBattlePresentation';
import { tutorialCutin, tutorialComboAsset } from './tutorialEffects';
import './tutorial-effects.css';

/** Keyed by recorded frame. There is no independent completion callback or sound. */
export function TutorialSkillCutin({ result, index, paused, speed }: { result: BattleResult; index: number; paused: boolean; speed: number }) {
  const root = useRef<HTMLDivElement>(null);
  const asset = tutorialCutin(result, index);
  const presentation = projectRecordedBattleFrame(result, index);
  useLayoutEffect(() => {
    // Preserve elapsed animation time across pause/speed changes, matching the replay clock.
    for (const animation of root.current?.getAnimations({ subtree: true }) ?? []) {
      animation.updatePlaybackRate(speed);
      if (paused) animation.pause(); else animation.play();
    }
  }, [paused, speed]);
  if (!asset) return null;
  return <div ref={root} className="tutorial-skill-fx" data-tutorial-cutin={presentation.actor?.id} data-effect-frame={index} data-paused={paused} style={{ '--cutin-inner': asset.inner, '--cutin-outer': asset.outer } as CSSProperties} role="status" aria-label={`${asset.name} ${presentation.skill?.name ?? 'スキル'}`}>
    <div className="tutorial-skill-veil" />
    <div className="tutorial-skill-art"><img className="tutorial-skill-aura" src={asset.src} alt="" /><img className="tutorial-skill-image" src={asset.src} alt={asset.name} /></div>
    <div className="tutorial-skill-name">{presentation.skill?.name}</div>
  </div>;
}

export function TutorialCombo({ count, targetId, paused, index }: { count: number; targetId?: string; paused: boolean; index: number }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    const battle = element?.closest('[data-playback-frame]');
    if (!element || !battle) return;
    const target = Array.from(battle.querySelectorAll<HTMLElement>('[data-unit-id]')).find(node => node.dataset.unitId === targetId);
    const position = () => {
      const stage = battle.getBoundingClientRect();
      const box = target?.getBoundingClientRect();
      const width = stage.width * .825;
      element.style.width = `${width}px`;
      element.style.left = `${Math.max(width / 2, Math.min(stage.width - width / 2, box ? box.left + box.width / 2 - stage.left : stage.width / 2))}px`;
      element.style.top = `${Math.max(width / 2.25 * 1.65 + 12, box ? box.top + box.height / 2 - stage.top : stage.height * .34)}px`;
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(battle);
    return () => observer.disconnect();
  }, [targetId]);
  return <div ref={root} className="tutorial-combo-fx" data-tutorial-combo={count} data-effect-frame={index} data-paused={paused} role="status"><img src={tutorialComboAsset(count)} alt={`${count}連撃`} /></div>;
}
