'use client';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useGame } from '@/app/context/GameContext';
import { QUEST_TOWN_STORIES, type QuestProgressionGuide, type QuestStoryPhase, type QuestStoryStage } from '@/domain/quest/progressionGuide';
import CharacterPresentation from '../character/CharacterPresentation';
import TypewriterText from '../tutorial/TypewriterText';
import '../TutorialWorldIntro.css';

export default function QuestTownStory({ townId, phase = 'START', stage = 'EASY', completedStages = [] }: { townId: string | null; phase?: QuestStoryPhase; stage?: QuestStoryStage; completedStages?: QuestStoryStage[] }) {
  const game = useGame() as any;
  const guide = game.questGuide as QuestProgressionGuide | null;
  const owner = game.session?.user?.id || 'guest';
  const [line, setLine] = useState(0);
  const [seen, setSeen] = useState<string[]>([]);
  const [loadedOwner, setLoadedOwner] = useState<string | null>(null);
  useEffect(() => {
    if (!townId || typeof window === 'undefined') return;
    try { const saved: unknown = JSON.parse(window.localStorage.getItem(`game04-quest-story:v1:${owner}`) || '[]'); setSeen(Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : []); } catch { setSeen([]); }
    setLoadedOwner(owner);
  }, [owner, townId]);
  const completedKey = completedStages.join(',');
  const story = useMemo(() => QUEST_TOWN_STORIES.find(entry => entry.townId === townId && !seen.includes(entry.id) && (
    completedStages.includes(entry.stage) || (entry.stage === stage && entry.phase === phase)
  )), [townId, stage, phase, completedKey, seen]);
  const eventKey = story?.id || '';
  useEffect(() => { setLine(0); }, [eventKey]);
  if (loadedOwner !== owner || !story || !guide || !eventKey || seen.includes(eventKey) || game.battleState || !game.onboardingState?.gameplay_authorized) return null;
  const hasNext = line + 1 < story.lines.length;
  const finish = async () => {
    const nextSeen = [...new Set([...seen, eventKey])];
    setSeen(nextSeen);
    try { window.localStorage.setItem(`game04-quest-story:v1:${owner}`, JSON.stringify(nextSeen)); } catch { /* 閲覧は継続。保存できないブラウザでは再表示される。 */ }
    setLine(0);
    try { if (story.stage === 'HARD' && story.phase === 'CLEAR') await game.markQuestStorySeen(story.townId); } catch { /* local event receipt remains available */ }
  };
  return <div className="tutorial-world quest-town-story-world" role="dialog" aria-modal="true" aria-label={`${story.speaker}の会話`}>
    <div className="tutorial-world-content" style={{ backgroundImage: "url('/bg/sengoku/castle-approach.jpg')" }}>
      <div className="tutorial-world-shade" />
      <div className="tutorial-world-ageha" aria-hidden="true" style={{ '--story-scale': story.presentation.scale, '--story-position-x': `${story.presentation.positionX}%`, '--story-position-y': `${story.presentation.positionY}%` } as CSSProperties}><CharacterPresentation src={story.image} alt="" variant="dialogue-bust" /></div>
      <div className="tutorial-world-dialogue"><strong>{story.speaker}</strong><TypewriterText key={`${eventKey}:${line}`} text={story.lines[line]} speedMs={34} /></div>
      <button className="semantic-cta semantic-cta--primary tutorial-world-next-cta" onClick={() => hasNext ? setLine(value => value + 1) : void finish()}>{hasNext ? '次へ' : story.phase === 'START' ? '探索へ' : '次へ'}</button>
    </div>
  </div>;
}
