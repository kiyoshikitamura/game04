'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GameContext } from '@/app/context/GameContext';
import BattleView from '@/app/components/redesign/BattleView';
import HomeView from '@/app/components/redesign/HomeView';
import HomeEffect from '@/app/components/redesign/HomeEffect';
import QuestView, { type QuestSettlement } from '@/app/components/redesign/QuestView';
import GrowthView from '@/app/components/redesign/GrowthView';
import { CHARACTER_MASTERS, buildBattleParty, BATTLE_RULES, grantReward } from '@/domain/redesign/masters';
import { getFormalOwnedSkill } from '@/domain/redesign/formalOwnedSkills';
import { applyGrowthAction } from '@/domain/redesign/growth';
import { getQuestStage, isQuestStageUnlocked } from '@/domain/redesign/quests';
import { createQuestBattleInput, questEnergyCost, questVictoryRewards } from '@/domain/redesign/questMaster';
import { simulateBattle } from '@/domain/redesign/battle';
import type { RedesignState } from '@/domain/redesign/types';
import { characterArt } from '@/theme/creativeAssets';
import { BACKGROUNDS, FIRST_DEFEAT_TEXT, FIRST_SORTIE_TEXT, SCENES, STARTERS, STARTER_SKILLS } from '@/domain/redesign/tutorial/content';
import { advanceTutorial, newTutorial, type TutorialAction, type TutorialSave } from '@/domain/redesign/tutorial/state';
import { createTutorialBattle } from '@/domain/redesign/tutorial/battle';
import { openTutorial, persistTutorial } from './store';
import '@/app/components/redesign/redesign.css';
import './tutorial.css';
import Modal from '@/app/components/redesign/Modal';
import TutorialSceneAssets from './TutorialSceneAssets';
import { TUTORIAL_ASSETS } from './assets';
import { preloadBattleImage } from '@/app/components/battle/battleAssetPreload';

function Notice({ text, button, onClick, busy, title = 'ご案内' }: { text: string; button: string; onClick: () => void; busy: boolean; title?: string }) {
  return <Modal title={title} onClose={() => undefined} hideCloseButton closeDisabled className="tutorial-notice"
    footer={<button className="rd-button tutorial-next" disabled={busy} onClick={onClick}>{button}</button>}>
    <p>{text}</p>
  </Modal>;
}
const noop = () => undefined;
const castMember = (id: string) => CHARACTER_MASTERS.find(c => c.id === id)!;
export default function TutorialPreview() {
  const [save, setSave] = useState<TutorialSave | null>(null);
  const current = useRef<TutorialSave | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [name, setName] = useState('');
  const [tab, setTab] = useState('home');
  const [playing, setPlaying] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const entryReceipt = useRef('');
  const shell = useRef<HTMLDivElement>(null);
  const step = save?.step;
  useEffect(() => { shell.current?.scrollTo({ top: 0 }); }, [step, tab]);
  const party = useMemo(() => save?.game.deck.length ? buildBattleParty(save.game) : [], [save]);
  const practice = useMemo(() => save?.game.deck.length ? createTutorialBattle(save.game) : null, [save]);
  useEffect(() => {
    let cancelled = false;
    // Start the full image bundle in parallel with the saved-progress request.
    void Promise.all(TUTORIAL_ASSETS.map(preloadBattleImage)).catch(noop);
    document.body.classList.add('rd-active');
    entryReceipt.current ||= crypto.randomUUID();
    void openTutorial().then(async state => {
      if (cancelled) return;
      if (state.step >= SCENES.length) state = await persistTutorial(state, advanceTutorial(state, { type: 'home', now: Date.now() }, entryReceipt.current));
      if (!cancelled) { current.current = state; setSave(state); setName(state.name); }
    }).catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; document.body.classList.remove('rd-active'); };
  }, []);

  async function update(actions: TutorialAction[]) {
    if (inFlight.current || !current.current) throw new Error('保存中です。');
    inFlight.current = true; setBusy(true); setError('');
    const before = current.current;
    try {
      let next = before;
      for (const action of actions) next = advanceTutorial(next, action, crypto.randomUUID());
      // One row update commits the entire transition (grant, step, and receipt).
      next = await persistTutorial(before, next);
      current.current = next; setSave(next);
      return next;
    } catch (e) { setError(e instanceof Error ? e.message : '保存できませんでした。'); throw e; }
    finally { inFlight.current = false; setBusy(false); }
  }
  const act = (actions: TutorialAction[], after?: () => void) => { void update(actions).then(after).catch(noop); };
  function next() {
    if (!save) return;
    const actions: TutorialAction[] = [{ type: 'next', step: save.step, name }];
    if (save.step === SCENES.length - 1) actions.push({ type: 'home', now: Date.now() });
    act(actions);
  }
  function navigate(destination: string) {
    if (!save || (!save.departed && !destination.startsWith('quest'))) return;
    const target = destination.startsWith('quest') ? 'quest' : destination;
    if (target === 'home' && tab !== 'home') act([{ type: 'home', now: Date.now() }], () => setTab('home'));
    else if (!save.departed && target === 'quest') act([{ type: 'depart' }], () => setTab('quest'));
    else setTab(target);
  }
  async function action(type: string, payload: Record<string, unknown> = {}) {
    const state = current.current!.game;
    const game = type === 'set_home' ? { ...state,
      ...(typeof payload.characterId === 'string' ? { homeCharacterId: payload.characterId } : {}),
      ...(typeof payload.backgroundId === 'string' ? { homeBackgroundId: payload.backgroundId } : {}) }
      : applyGrowthAction(state, type, payload);
    await update([{ type: 'game', game }]);
    return { state: game };
  }
  async function startQuest(stageId: string): Promise<QuestSettlement> {
    const state = current.current!.game;
    const stage = getQuestStage(stageId);
    if (!stage || !isQuestStageUnlocked(stageId, state.clearedStages)) throw new Error('未解放の出陣先です。');
    const cost = questEnergyCost(stage, state);
    if (state.energy < cost) throw new Error('行動力が不足しています。');
    const seed = Date.now() % 2147483647;
    const result = simulateBattle(createQuestBattleInput(seed, buildBattleParty(state), stage, BATTLE_RULES));
    let game: RedesignState = { ...state, energy: state.energy - cost, questAttempts: { ...state.questAttempts, [stageId]: (state.questAttempts?.[stageId] ?? 0) + 1 } };
    const firstClear = result.outcome === 'win' && !state.clearedStages.includes(stageId);
    const settled = questVictoryRewards(stage, state, buildBattleParty(state), seed);
    const rewards = result.outcome === 'win' ? settled.rewards : [];
    for (const [i, reward] of rewards.entries()) game = grantReward(game, reward, `tutorial-quest:${seed}:${i}`);
    if (result.outcome === 'win') game = { ...game, clearedStages: [...new Set([...game.clearedStages, stageId])], questClearCounts: { ...game.questClearCounts, [stageId]: settled.count } };
    const actions: TutorialAction[] = [{ type: 'game', game }, { type: 'depart' }];
    if (result.outcome !== 'win') actions.push({ type: 'defeat' });
    await update(actions);
    return { battle: result, rewards, firstClear };
  }
  const gameContext = { session: null, username: save?.name || '', userLevel: 1, playCyberSe: noop,
    setShowMissionPanel: () => navigate('missions'), directMessages: [], dmUnreadConversations: [], dmUnreadTotal: 0,
    guildChats: [], chatInput: '', chatCooldown: 0, chatSending: false, dmRecipientId: null,
    setDmRecipientId: noop, setChatInput: noop, setChatChannel: noop, setShowTribeChatPanel: noop,
    handleSendChat: async () => undefined, handleSendDirectMessage: async () => false };
  if (!save) return <main className="rd-shell tutorial-loading"><p role="status">{error || 'チュートリアルを準備しています…'}</p>{error && <button className="rd-button" onClick={() => window.location.reload()}>再読み込み</button>}</main>;
  const scene = SCENES[save.step];
  const world = scene && 'cast' in scene;
  const acquisition = scene?.id === 'characters' || scene?.id === 'skills';
  const background = world ? scene.background : BACKGROUNDS.guide;
  const cast = world ? scene.cast : ['char_ageha_01'];
  const errorView = error && <Notice title="保存できませんでした" text={error} button="再読み込み" busy={false} onClick={() => window.location.reload()} />;
  return <TutorialSceneAssets assets={scene ? TUTORIAL_ASSETS : []}><GameContext.Provider value={gameContext}><div ref={shell} className={`rd-shell tutorial-shell ${scene ? '' : 'is-complete'}`}>
    {scene ? scene.id === 'battle' && practice ? <BattleView requirePlaybackCompletion result={practice} vipActive={false} onComplete={next} title="模擬戦" backgroundSrc={BACKGROUNDS.battle} /> :
      <main key={scene.id} className={`tutorial-scene ${world ? 'is-world' : ''}`} style={{ backgroundImage: `linear-gradient(0deg, #160f0beb, transparent 65%), url('${background}')` }} data-scene={scene.id}>
        {world && <HomeEffect effectId={scene.effectId} />}
        <div className={`tutorial-cast count-${cast.length}`} aria-label={world ? '乱世の武将たち' : '豊臣秀吉'}>
          {!acquisition && cast.map(id => <img key={id} src={characterArt(castMember(id), 'full')} alt={castMember(id).name} />)}
          {scene.id === 'characters' && <div className="tutorial-rewards">{STARTERS.map(id => <figure key={id}><img src={characterArt(castMember(id), 'card')} alt={castMember(id).name} /><figcaption><b>{id === 'char_aoi_01' ? 'お市' : castMember(id).name}</b><span>R　Lv.1・覚醒0</span></figcaption></figure>)}</div>}
          {scene.id === 'skills' && <div className="tutorial-rewards is-skills">{STARTER_SKILLS.map(id => { const skill = getFormalOwnedSkill(id, 0); return <figure key={id}><img src={skill.image} alt={skill.name} /><figcaption><b>{skill.name}</b><span>{skill.rarity}　LB0</span></figcaption></figure>; })}</div>}
        </div>
        <section className="tutorial-copy" aria-live="polite">
          {!world && !acquisition && !['name', 'equipped'].includes(scene.id) && <h1>豊臣秀吉</h1>}
          <p>{scene.text.replace('〇〇', save.name)}</p>
          {scene.id === 'name' && <label>名前（1〜8文字）<input autoComplete="off" placeholder="名前を入力" value={name} onChange={e => setName(e.target.value)} maxLength={16} /></label>}
          {world && <div className="tutorial-progress" aria-label={`${save.step + 1} / 3`}>{[0, 1, 2].map(i => <i key={i} data-active={save.step === i} />)}</div>}
          <button className="rd-button tutorial-next" disabled={busy || (scene.id === 'name' && (!name.trim() || [...name.trim()].length > 8))} onClick={next}>{'button' in scene ? scene.button : '次へ'}</button>
        </section>
      </main> : <>
      <header className="tutorial-header"><strong>{save.name}</strong><span>Lv.1</span><span>銭 {save.game.cash.toLocaleString()}</span><span>行動力 {save.game.energy}</span></header>
      <main className="rd-main" inert={!save.departed && tab === 'home' ? true : undefined}>
        {tab === 'home' && <HomeView state={save.game} onAction={action} onNavigate={navigate} previewOnly />}
        {tab === 'quest' && <QuestView state={save.game} party={party} vipActive={false} onStart={startQuest} onOpenDeck={() => navigate('character')} onOpenRaid={() => navigate('raid')} onBattlePlayingChange={setPlaying} />}
        {tab === 'character' && <GrowthView state={save.game} onAction={action} />}
        {tab === 'missions' && <section className="rd-panel"><h1>任務</h1><p>任務を進めながら部隊を強化しましょう。</p><button className="rd-button" onClick={() => navigate('character')}>武将を育成する</button><button className="rd-button" onClick={() => navigate('quest')}>出陣する</button><p className="rd-muted">専用確認環境では、通常の任務報酬は付与しません。</p></section>}
        {!['home', 'quest', 'character', 'missions'].includes(tab) && <section className="rd-panel"><h1>{tab === 'shop' ? '商店' : tab === 'gacha' ? '雇用' : '共闘'}</h1><p>チュートリアルによるロックは解除されています。この確認環境では通常機能への接続を省いています。</p><button className="rd-button" onClick={() => navigate('home')}>マイページへ</button></section>}
      </main>
      {!playing && <nav className="rd-footer" aria-label="メインナビゲーション">{[['home', 'ホーム'], ['quest', '出陣'], ['character', '武将'], ['raid', '共闘'], ['gacha', '雇用']].map(([id, label]) => <button key={id} disabled={busy || (!save.departed && id !== 'quest')} aria-current={tab === id ? 'page' : undefined} onClick={() => navigate(id)}>{label}</button>)}</nav>}
      {!error && !save.departed && !save.loginPending && tab === 'home' && <Notice text={FIRST_SORTIE_TEXT} button="出陣へ" busy={busy} onClick={() => navigate('quest')} />}
      {!error && save.loginPending && tab === 'home' && <Notice text={`ログインボーナス ${save.loginDays % 30 || 30}日目\n本日の報酬を受け取りました。`} button="閉じる" busy={busy} onClick={() => act([{ type: 'dismiss-login' }])} />}
      {!error && save.defeatPending && !playing && !(save.loginPending && tab === 'home') && <Notice text={FIRST_DEFEAT_TEXT} button="任務へ" busy={busy} onClick={() => act([{ type: 'dismiss-defeat' }], () => setTab('missions'))} />}
    </>}
    {errorView}
    <details className="tutorial-review" open={toolsOpen} onToggle={e => setToolsOpen(e.currentTarget.open)}><summary>確認メニュー</summary><p>通常プレイと独立した確認用データです。</p><button disabled={busy} onClick={() => {
      if (inFlight.current) return;
      inFlight.current = true; setBusy(true);
      const reset = newTutorial(save.game.userId); reset.revision = save.revision + 1;
      void persistTutorial(save, reset).then(state => { current.current = state; setSave(state); setName(''); setTab('home'); setToolsOpen(false); }).catch(e => setError(e.message)).finally(() => { inFlight.current = false; setBusy(false); });
    }}>最初から確認する</button>{!scene && <button disabled={busy} onClick={() => act([{ type: 'defeat' }])}>初敗北の案内を確認する</button>}</details>
  </div></GameContext.Provider></TutorialSceneAssets>;
}
