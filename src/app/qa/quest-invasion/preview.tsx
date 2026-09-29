'use client';
import { useEffect, useState } from 'react';
import QuestView from '@/app/components/redesign/QuestView';
import { initializeEarlyProgress } from '@/domain/redesign/earlyProgress';
import { createInitialState, buildBattleParty } from '@/domain/redesign/masters';
import { QUEST_STAGES } from '@/domain/redesign/quests';
import type { QuestInvasionCounts } from '@/hooks/useQuestInvasionCounts';
import '@/app/components/redesign/redesign.css';

// Appearance-only snapshot: production aggregation, 2026-09-29 08:50–08:54 JST.
// Never used by the game route or written to any account.
const counts: QuestInvasionCounts = {
  areas: { mikawa:25, owari:18, mino:19, omi:0, kai:3, echigo:2, kyoto:0, izumo:0, satsuma:0, sekigahara:0 },
  stages: { 'mikawa-1':1, 'mikawa-2':11, 'mikawa-3':8, 'mikawa-4':4, 'mikawa-5':1,
    'owari-1':14, 'owari-2':2, 'owari-3':2, 'mino-1':13, 'mino-2':1, 'mino-5':5,
    'kai-1':2, 'kai-5':1, 'echigo-1':1, 'echigo-5':1 },
};

export default function QuestInvasionPreview({ areaId }: { areaId?: string }) {
  const [state] = useState(() => {
    const value = initializeEarlyProgress(createInitialState('qa-invasion-appearance'));
    value.clearedStages = QUEST_STAGES.filter(stage => ['mikawa','owari'].includes(stage.areaId)).map(stage => stage.id);
    if (value.earlyProgress) value.earlyProgress.preservedUnlockedStages = QUEST_STAGES.map(stage => stage.id);
    return value;
  });
  useEffect(() => {
    document.body.classList.add('rd-active');
    return () => document.body.classList.remove('rd-active');
  }, []);
  return <div className="rd-shell"><main className="rd-main">
    <QuestView state={state} party={buildBattleParty(state)} vipActive={false} invasionCounts={counts} initialAreaId={areaId}
      onStart={async () => { throw new Error('表示確認用のため出撃は行いません。'); }} onOpenDeck={() => {}} onOpenRaid={() => {}} />
  </main></div>;
}
