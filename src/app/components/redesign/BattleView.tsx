'use client';
import { createPortal } from 'react-dom';
import CanonicalDialog from '../ui/CanonicalDialog';
import BattleResourceDisplay, {BATTLE_RESOURCE_ASSETS} from './BattleResourceDisplay';
import RecordedBattleResult from './RecordedBattleResult';
import { UI_MOTION } from '../ui/uiMotion';
import type { ReactNode } from 'react';
import { useAudio } from '@/audio/AudioProvider';
import { SE_ASSETS, type BgmScene, type SeEvent } from '@/audio/audioContract';
import { recordedBattleSounds } from '@/audio/recordedBattleSound';
import { enemyDisplayName, enemyRoleLabel } from '@/domain/redesign/contextNames';
import { useEffect, useMemo, useState, useRef, type CSSProperties } from 'react';
import { beginQaImageGroup } from '@/utils/redesignQaTelemetry';
import { useRecordedBattlePlayback } from '@/hooks/redesign/useRecordedBattlePlayback';
import { projectRaidBattleHp } from '../../../domain/presentation/raidBattleHpPresentation';
import { projectRecordedBattleFrame } from '../../../domain/presentation/recordedBattlePresentation';
import type { BattleResult, BattleUnitState } from '../../../domain/redesign/battle';
import type { BattleUnit, SkillMaster } from '../../../domain/redesign/types';
import styles from './BattleView.module.css';
import { BattleEffectLayer } from './battle-effects/BattleEffectLayer';
import { effectAssetPaths, minimumEffectFrameDuration } from './battle-effects/recordedEffects';
import { resolveBattleFrameEffects } from './battleEffectPresentation';
import { isBattleImageReady, preloadBattleImages } from '../battle/battleAssetPreload';
import { characterArt } from '@/theme/creativeAssets';
import characterAssets from '@/theme/local-characters.json';
import { getCharacterPresentationMetadata } from '../character/characterPresentationMetadata';
import { STATUS_LABELS, TARGET_LABELS, passiveDescription, skillConditionText, READINESS_REASONS, CLEANSE_LABELS, skillDescription, LEGACY_SKILL_MAPPING_NOTICE } from './battleLabels';

const knownCharacterImages = new Set(characterAssets.flatMap(entry => Object.entries(entry).filter(([key]) => !['id', 'name'].includes(key)).map(([, value]) => value)));
function unitArt(unit: BattleUnit, state: BattleUnitState | undefined, variant: 'full' | 'portrait' | 'battle') {
  const source = state?.image || unit.image;
  // Unknown phase art remains authoritative; only known variants use the existing character mapping.
  return knownCharacterImages.has(source) ? characterArt({ id: unit.id, name: unit.name, image: source }, variant) ?? source : source;
}
const isUnassignedSkillImage = (src?: string) => !src || src === '/menu/event_banner_placeholder.png';
const elements = { fire: '火', water: '水', earth: '土', wind: '風', light: '光', dark: '闇' };
const statusNames: Record<string, string> = { ...STATUS_LABELS, damage: 'ダメージ', heal: '回復', revive: '蘇生', sp: 'SP回復' };
const readinessNames: Record<string, string> = { ready: '発動可能', insufficient_sp: 'SP不足', condition_unmet: '条件未達', active: '発動中' };
const reasonNames: Record<string, string> = { action_limit: '300回の味方行動機会で未決着のため敗北', party_defeated: '味方全員が戦闘不能', mutual_annihilation: '双方全滅のため敗北', final_wave_defeated: '最終派の敵を撃破' };
const reasonText = (reason: string) => reasonNames[reason] ?? CLEANSE_LABELS[reason] ?? reason;
const eventText = (text: string) => text.replace(/(?:Wave|WAVE)\s*(\d+)/g, "第$1派").replace(/Wave|WAVE/g, "派").replace(/\b(atk_up|def_up|atk_down|def_down|stun|dot|hot|shield|taunt|counter|cleanse|protection)\b/g, key => key === 'protection' ? CLEANSE_LABELS.protection : statusNames[key]);
const signed = (value: number) => `${value > 0 ? '+' : ''}${value}`;
const meterWidth = (value: number, max: number) => `${Math.max(0, Math.min(100, 100 * value / Math.max(1, max)))}%`;

const statusPaths: Record<string, string> = {
  atk_up:'M5 19 19 5V11L11 19ZM4 14 10 20M3 21 7 17', atk_down:'M5 19 19 5V11L11 19ZM4 14 10 20M3 21 7 17',
  def_up:'M12 3 20 6V12Q20 18 12 22Q4 18 4 12V6Z', def_down:'M12 3 20 6V12Q20 18 12 22Q4 18 4 12V6Z', shield:'M12 3 20 6V12Q20 18 12 22Q4 18 4 12V6ZM8 10H16M12 6V16',
  dot:'M12 2Q9 7 6 12Q1 22 12 22Q23 22 18 12Z', poison:'M8 3H16M10 3V9L4 18Q3 22 7 22H17Q21 22 20 18L14 9V3M7 15H17',
  hot:'M9 3H15V9H21V15H15V21H9V15H3V9H9Z', stun:'M4 7 10 9 8 3 14 7 19 3 18 10 23 11 17 15 20 21 12 18 8 22 6 15 1 15 5 11Z',
  counter:'M4 11H15Q21 11 21 17Q21 22 15 22M4 11 10 5M4 11 10 17', taunt:'M12 1V6M12 18V23M1 12H6M18 12H23M20 12A8 8 0 1 1 4 12A8 8 0 1 1 20 12',
};
interface Props { onRetire?: () => void; resultActions?: ReactNode; resultRewards?: ReactNode; bgmScene?: BgmScene; requirePlaybackCompletion?: boolean; result: BattleResult; vipActive: boolean; onComplete: () => void; title?: string; backgroundSrc?: string; raidHp?: { current: number; max: number; level?: number }; initialFrame?: number; initialPaused?: boolean; }

/** Every visible value is projected from the recorded server frame. */
export function BattleView({ onRetire, resultActions, resultRewards, bgmScene = 'BATTLE', requirePlaybackCompletion = false, result, vipActive, onComplete, title = '合戦', backgroundSrc = '/creative/backgrounds/char_reiji_01.png', raidHp, initialFrame = 0, initialPaused = false }: Props) {
  const { playBgm, stopBgm, playSe, stopSe, preloadAudio } = useAudio();
  const [pauseMenu, setPauseMenu] = useState(false);
  const [confirmRetire, setConfirmRetire] = useState(false);
  const [exited, setExited] = useState(false);
  const exitLock = useRef(false);
  const wasPaused = useRef(false);
  const heardFrame = useRef(-1);
  const heardAction = useRef(new Set<SeEvent>());
  useEffect(() => {
    exitLock.current = false; setExited(false); setPauseMenu(false); setConfirmRetire(false);
    heardFrame.current = -1;
    heardAction.current.clear();
    playBgm(bgmScene);
    preloadAudio({ scene: bgmScene, events: Object.keys(SE_ASSETS).filter(key => key.startsWith('BATTLE_') || key === 'VICTORY' || key === 'DEFEAT') as SeEvent[] });
    return () => { stopSe(); stopBgm(); };
  }, [result, bgmScene, playBgm, stopBgm, stopSe, preloadAudio]);
  const displayedRaidHp = projectRaidBattleHp(result.raidStartSnapshot, raidHp);
  const [detail, setDetail] = useState<{ unit?: BattleUnit; state?: BattleUnitState; skill?: SkillMaster; readiness?: string; cost?: number; reason?: string } | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [assetState, setAssetState] = useState<{ result: BattleResult; key: string; status: 'loading' | 'ready' | 'error' }>({ result, key: '', status: 'loading' });
  const [retry, setRetry] = useState(0);
  const loadingDialog = useRef<HTMLDialogElement>(null);
  const recoveredResult = useRef<BattleResult | null>(null);
  const measuredImageResult = useRef<BattleResult | null>(null);
  const detailDialog = useRef<HTMLDialogElement>(null);
  const assetsBlocked = assetState.result !== result || assetState.status !== 'ready';
  const { index, frame, finished, speed, effectiveSpeed, paused, playbackPaused, waveIntroActive, setPaused, cycleSpeed, skip } = useRecordedBattlePlayback({ result, initialFrame, initialPaused, vipActive, blocked: exited || pauseMenu || confirmRetire || !!detail || showLog || assetsBlocked, minimumFrameDuration: minimumEffectFrameDuration, waveIntroDuration: UI_MOTION.waveIntroMs });
  const presentation = projectRecordedBattleFrame(result, index);
  const battleRoot = useRef<HTMLElement>(null);
  useEffect(() => { if (finished) { stopBgm(); battleRoot.current?.scrollIntoView({ block: 'start' }); } }, [finished, stopBgm]);
  useEffect(() => {
    stopSe();
    if (!frame || exited || pauseMenu || confirmRetire || assetsBlocked || paused || waveIntroActive || detail || showLog || heardFrame.current === index) return;
    if (['action_start', 'phase', 'burst_start', 'start', 'end'].includes(frame.event ?? frame.kind)) heardAction.current.clear();
    heardFrame.current = index;
    for (const event of recordedBattleSounds(result, index)) {
      if (heardAction.current.has(event)) continue;
      heardAction.current.add(event);
      playSe(event);
    }
    return stopSe;
  }, [result, index, frame, speed, exited, pauseMenu, confirmRetire, assetsBlocked, paused, waveIntroActive, detail, showLog, playSe, stopSe]);
  function openPauseMenu() { wasPaused.current = paused; setPaused(true); stopSe(); setPauseMenu(true); }
  function cancelRetire() { setConfirmRetire(false); setPauseMenu(false); setPaused(wasPaused.current); }
  function retire() {
    if (exitLock.current || finished || requirePlaybackCompletion) return;
    exitLock.current = true;
    setPaused(true); setExited(true); setConfirmRetire(false); setPauseMenu(false);
    stopSe(); stopBgm();
    (onRetire ?? onComplete)();
  }
  const effects = frame ? resolveBattleFrameEffects(frame, result.frames[index - 1], presentation.skill) : [];
  // A result-wide gate avoids hiding the battle when a later effect first appears.
  const imageKey = useMemo(() => JSON.stringify([...new Set([
    '/branding/tribe-neon-logo.png', backgroundSrc, ...BATTLE_RESOURCE_ASSETS,
    ...result.frames.flatMap((record, i) => effectAssetPaths(resolveBattleFrameEffects(record, result.frames[i - 1], projectRecordedBattleFrame(result, i).skill))),
    ...result.frames.flatMap(record => [...record.party, ...record.enemies].flatMap(state => {
      const unit = result.party.find(item => item.id === state.id) ?? result.waves[record.wave - 1]?.find(item => item.id === state.id);
      return [unit ? unitArt(unit, state, 'battle') : state.image, unit ? unitArt(unit, state, 'full') : undefined,
        unit && record.party.some(member => member.id === state.id) ? unitArt(unit, state, 'portrait') : undefined,
        unit ? `/ui/raid/v2/element-${unit.element}.png` : undefined,
        ...(state.skills ?? unit?.skills ?? []).filter(skill => !isUnassignedSkillImage(skill.image)).map(skill => skill.image)];
    }))
  ].filter((src): src is string => !!src))]), [result, backgroundSrc]);
  const decoded = (JSON.parse(imageKey) as string[]).every(isBattleImageReady);
  const visibleLoading = !decoded;
  const assetError = assetState.result === result && assetState.key === imageKey && assetState.status === 'error';
  // The API has already settled this result. Recovery leaves playback only; it must
  // neither start another battle nor grant the normal VIP-only skip capability.
  const leaveFailedPlayback = () => {
    if (!assetError || recoveredResult.current === result) return;
    recoveredResult.current = result;
    loadingDialog.current?.close();
    onComplete();
  };
  useEffect(() => {
    let cancelled = false;
    const finishImageTiming = measuredImageResult.current !== result ? beginQaImageGroup('battle', (JSON.parse(imageKey) as string[]).length) : null;
    measuredImageResult.current = result;
    if ((JSON.parse(imageKey) as string[]).every(isBattleImageReady)) {
      setAssetState({ result, key: imageKey, status: 'ready' });
      finishImageTiming?.('success');
      return;
    }
    setAssetState({ result, key: imageKey, status: 'loading' });
    preloadBattleImages(JSON.parse(imageKey) as string[]).then(() => { if (!cancelled) { setAssetState({ result, key: imageKey, status: 'ready' }); finishImageTiming?.('success'); } }, () => { if (!cancelled) { setAssetState({ result, key: imageKey, status: 'error' }); finishImageTiming?.('error'); } });
    return () => { cancelled = true; };
  }, [result, imageKey, retry]);
  useEffect(() => {
    const dialog = loadingDialog.current;
    if (visibleLoading && dialog && !dialog.open) dialog.showModal();
    if (!visibleLoading && dialog?.open) dialog.close();
  }, [visibleLoading]);
  useEffect(() => { setDetail(null); setShowLog(false); }, [result]);
  useEffect(() => {
    if (!detail && !showLog) return;
    const dialog = detailDialog.current;
    if (dialog && !dialog.open) dialog.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setDetail(null); setShowLog(false); } };
    window.addEventListener('keydown', closeOnEscape);
    return () => { window.removeEventListener('keydown', closeOnEscape); document.body.style.overflow = oldOverflow; if (dialog?.open) dialog.close(); };
  }, [detail, showLog]);
  if (!frame) return <p>戦闘結果を読み込めません。</p>;
  const lookup = (id: string, wave = frame.wave) => result.party.find(u => u.id === id) ?? result.waves[wave - 1]?.find(u => u.id === id);
  const close = () => { setDetail(null); setShowLog(false); };
  const detailReason = detail?.reason ? (result.rulesVersion === 'balance-v2-20260920' && detail.skill?.unsupportedReason ? LEGACY_SKILL_MAPPING_NOTICE : READINESS_REASONS[detail.reason] ?? detail.reason) : undefined;
  const showDetailReason = detailReason && detailReason !== detail?.readiness && detailReason !== (detail?.skill ? skillDescription(detail.skill, result.rulesVersion === 'balance-v2-20260920') : undefined);
  const unitCard = (state: BattleUnitState, enemy: boolean, order: number) => {
    const unit = lookup(state.id); if (!unit) return null;
    const impact = presentation.impacts.find(item => item.targetId === state.id);
    const active = presentation.activeActorId === state.id;
    const artSource = unitArt(unit, state, enemy ? 'battle' : 'portrait');
    const faceCrop = getCharacterPresentationMetadata(artSource);
    return <div data-unit-id={state.id} data-order={order} data-hit={impact?.type === 'damage' ? frame.index : undefined} className={`${enemy ? styles.enemy : styles.member} ${state.hp <= 0 ? styles.dead : ''} ${active ? styles.active : ''}`} key={state.id}>
      {!enemy && <span className={styles.order}>{order + 1}</span>}
      {!enemy && active && <span className={styles.acting}>行動中</span>}
      <button key={impact?.type === 'damage' ? `hit-${frame.index}` : 'idle'} className={`${styles.unitButton} ${impact?.type === 'damage' ? styles.hit : ''}`} onClick={() => setDetail({ unit, state })} aria-label={`${enemyDisplayName(unit)}の戦闘詳細`}>
        {enemy ? <img data-effect-anchor src={artSource} alt="" className={styles.enemyImage} /> : <span data-effect-anchor className={styles.memberPortrait}><img src={artSource} alt="" className={styles.memberImage} style={{ '--face-scale': faceCrop.thumbnailScale, '--face-x': `${faceCrop.thumbnailX}%`, '--face-y': `${faceCrop.thumbnailY}%` } as CSSProperties} /></span>}
        <span className={styles.unitInfo}>
          <span className={styles.unitName}>{enemy && <img className={styles.element} src={`/ui/raid/v2/element-${unit.element}.png`} alt={elements[unit.element]} />}{enemy && <small>Lv.{unit.level} </small>}{enemyDisplayName(unit)}</span>
          {!enemy && <span className={styles.level}>Lv.{unit.level}</span>}
          <span className={styles.hp}><span style={{ width: meterWidth(state.hp, state.maxHp) }} /></span>
          <span className={styles.hpNumber}><span>{Math.floor(state.hp).toLocaleString()}</span><span> / {Math.floor(state.maxHp).toLocaleString()}</span></span>
          {enemy && <span className={styles.count}>{state.hp > 0 ? <>あと <b>{state.count}</b></> : '撃破'}</span>}
          {state.phase && <span className={styles.phase}>{state.phase}</span>}
        </span>
      </button>
      <div className={styles.status} aria-label={`${unit.name}の状態`}>
        {state.statuses.slice(0, 2).map((s, i) => <button key={`${s.type}-${i}`} data-status={s.type} onClick={() => setDetail({ unit, state })} title={`${statusNames[s.type] ?? s.type} 残り${s.remaining}回${s.type === 'shield' ? `・吸収残量${s.amount ?? 0}` : ''}`} aria-label={`${statusNames[s.type] ?? s.type} 残り${s.remaining}回`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={statusPaths[s.type] ?? 'M12 3V15M12 19V21'} />{s.type.endsWith('_down') && <path d="M18 2V9M15 6 18 9 21 6" />}</svg><span>{s.remaining}</span></button>)}
        {state.statuses.length > 2 && <button onClick={() => setDetail({ unit, state })} aria-label={`ほか${state.statuses.length - 2}件の状態を表示`}>+{state.statuses.length - 2}</button>}
        {state.stunImmune && <button onClick={() => setDetail({ unit, state })} title="実際に1回行動するまで行動不能の再付与を防ぎます">耐</button>}
      </div>
      {!enemy && <span className={styles.skills}>{(state.skills ?? unit.skills).slice(0, 3).map((skill, slot) => {
        const recorded = frame.skillStates?.[unit.id]?.find(entry => entry.skillId === skill.id);
        const skillActive = recorded ? recorded.status === 'active' : !frame.skillStates && active && frame.skillId === skill.id;
        const status = skillActive ? '発動中' : recorded?.reason === 'reapply_unavailable' ? '再付与不可' : recorded ? readinessNames[recorded.status] ?? recorded.status : '記録なし';
        return <button key={`${skill.id}-${slot}`} className={`${styles.skill} ${skillActive ? styles.skillActive : recorded?.status === 'condition_unmet' ? styles.condition : recorded?.status === 'insufficient_sp' ? styles.shortSp : ''}`} title={`優先${slot + 1} ${skill.name}：${status}`} aria-label={`優先${slot + 1} ${skill.name}：${status}`} onClick={() => setDetail({ skill, readiness: status, cost: recorded?.cost, reason: recorded?.reason })}>
          {isUnassignedSkillImage(skill.image) ? <svg className={styles.skillTypeIcon} viewBox="0 0 24 24" aria-hidden="true"><path d={statusPaths[skill.effects[0]?.type] ?? (skill.effects[0]?.type === 'heal' || skill.effects[0]?.type === 'revive' ? statusPaths.hot : statusPaths.atk_up)} /></svg> : <img src={skill.image} alt="" />}<span>{slot + 1}<small>{skillActive ? '発動' : recorded?.status === 'insufficient_sp' ? 'SP' : '詳細'}</small></span>
        </button>;
      })}</span>}
      {impact && <div key={`${frame.index}-${state.id}`} className={`${styles.impact} ${impact.type === 'heal' ? styles.healing : ''}`} data-impact-target={state.id}><strong>{impact.type === 'miss' ? 'MISS' : impact.type === 'status' ? ({effect_applied:'付与',effect_miss:'不成立',cleanse:'解除',shield_absorbed:'吸収'}[frame.event ?? ''] ?? '') : `${impact.type === 'heal' ? '+' : ''}${Math.abs(impact.amount).toLocaleString()}`}</strong>{impact.hits && impact.hits.length > 1 && <small>{impact.hits.length} HITS</small>}</div>}
    </div>;
  };
  if (exited) return null;
  return <section ref={battleRoot} className={styles.battle} aria-label={title} data-playback-paused={playbackPaused && !waveIntroActive} data-intro-paused={paused || assetsBlocked || !!detail || showLog} data-playback-frame={index} style={{ '--battle-speed': effectiveSpeed, '--wave-intro-ms': `${UI_MOTION.waveIntroMs}ms`, '--battle-background': `url(${JSON.stringify(backgroundSrc)})` } as CSSProperties}>
    {!finished && (pauseMenu || confirmRetire) && createPortal(<CanonicalDialog title={confirmRetire ? 'リタイアしますか？' : '一時停止'} onClose={cancelRetire} actions={confirmRetire ? [{label:'続ける',semantic:'secondary',onClick:cancelRetire},{label:'リタイア',semantic:'danger',onClick:retire}] : [{label:'バトルを続ける',semantic:'primary',onClick:()=>{setPauseMenu(false);setPaused(false);} },...(!requirePlaybackCompletion ? [{label:'リタイア',semantic:'danger' as const,onClick:()=>{setPauseMenu(false);setConfirmRetire(true);}}] : [])]}>{confirmRetire ? <p>再生を終了して挑戦元へ戻ります。確定した戦績・報酬・消費は変更されません。</p> : <p>バトルの再生を停止しています。</p>}</CanonicalDialog>, document.body)}
    <dialog ref={loadingDialog} className={styles.loading} onCancel={event => event.preventDefault()} aria-label="戦闘画面の読み込み"><img src="/branding/tribe-neon-logo.png" alt="戦国姫艶武" />{assetError ? <><p>戦闘画像を読み込めませんでした。</p><button onClick={() => { setAssetState({ result, key: imageKey, status: 'loading' }); setRetry(value => value + 1); }}>再試行</button>{!requirePlaybackCompletion && <button onClick={leaveFailedPlayback}>再生を終了する</button>}</> : <><span className={styles.spinner} /><p>戦闘の準備中</p></>}</dialog>
    <div className={visibleLoading ? styles.loadingContent : undefined}>
    {!finished && <><header className={styles.header}><strong>第<b>{frame.wave}</b>派 / 全{result.waves.length}派</strong><div><button onClick={cycleSpeed} aria-label={`再生速度 ${speed}倍`}>▶▶ ×{speed}</button><button onClick={() => paused ? setPaused(false) : openPauseMenu()} disabled={finished} aria-label={paused ? '再開' : '一時停止'}>{paused ? '▶' : 'Ⅱ'}</button>{paused && !pauseMenu && !confirmRetire && !requirePlaybackCompletion && <button onClick={() => { wasPaused.current = true; setConfirmRetire(true); }}>リタイア</button>}{vipActive && <button className={styles.skip} disabled={finished} onClick={skip}>SKIP</button>}</div></header>
    {displayedRaidHp && <div className={styles.raidHp}>{displayedRaidHp.label} <span>{Math.floor(displayedRaidHp.current).toLocaleString()} / {Math.floor(displayedRaidHp.max).toLocaleString()}</span></div>}
    <div className={`${styles.arena} ${waveIntroActive ? styles.waveEntering : ''}`} key={`arena-${frame.wave}`}>
      {waveIntroActive && <div className={styles.waveIntro} role="status">第{frame.wave}派</div>}
      <div className={styles.enemyZone} data-count={frame.enemies.length}>{frame.enemies.map((u, i) => unitCard(u, true, i))}</div>
      {presentation.cutIn && presentation.actor && <div className={`${styles.cutIn} ${presentation.cutIn === 'burst' ? styles.burstCutIn : styles.skillCutIn}`} key={`cutin-${frame.index}`} aria-label={`${presentation.actor.name} ${presentation.cutIn === 'burst' ? 'BURST' : presentation.skill?.name ?? 'スキル'}`}><div className={styles.cutInLight} /><img src={unitArt(presentation.actor, presentation.actorState, 'full')} alt="" /><strong>{presentation.cutIn === 'burst' ? 'BURST' : presentation.skill?.name}</strong><span>{presentation.actor.name}</span></div>}
    </div>
    <BattleResourceDisplay key={result.seed+'-'+result.frames.length} frame={frame} startIndex={result.frames.slice(0,index+1).findLast(f=>f.event==='burst_start')?.index??-1} paused={playbackPaused} speed={effectiveSpeed} animate={result.frames.slice(initialFrame,index+1).some(f=>f.event==='burst_start')}/>
    {frame.burstGauge !== undefined && <div className={`${styles.sp} ${styles.gauge}`} role="meter" aria-label="バーストゲージ" aria-valuemin={0} aria-valuemax={frame.maxBurstGauge ?? 200} aria-valuenow={frame.burstGauge}><span style={{ width: meterWidth(frame.burstGauge, frame.maxBurstGauge ?? 200) }} /></div>}
    <div className={styles.party}>{frame.party.map((u, i) => unitCard(u, false, i))}</div>
    {frame.remainingActions !== undefined && <p className={styles.actionLimit}>残り味方行動機会 <strong>{frame.remainingActions}</strong> / 300</p>}
    </>}
    {presentation.isSkill && !presentation.cutIn && presentation.actor && presentation.skill && <div className={`${styles.feedback} ${styles.skillFeedback}`}><span>{presentation.actor.name}</span>{presentation.skill.name}</div>}
    {finished && <RecordedBattleResult result={result} title={title} backgroundSrc={backgroundSrc} rewards={resultRewards} actions={resultActions ?? <button onClick={onComplete}>結果へ</button>} />}
    </div>
    {!finished && !assetsBlocked && <BattleEffectLayer key={index} effects={effects} partyIds={frame.party.map(unit => unit.id)} paused={playbackPaused} speed={effectiveSpeed} />}
    {(detail || showLog) && <dialog ref={detailDialog} className={styles.backdrop} aria-label={showLog ? '戦闘ログ' : '戦闘詳細'} onCancel={event => { event.preventDefault(); close(); }}><section className={styles.modal}><button className={styles.close} onClick={close} autoFocus>閉じる</button>{showLog ? <>
      <h2>戦闘ログ</h2>{result.frames.map(f => <article className={styles.logEntry} key={f.index}><strong>#{f.index + 1} 第{f.wave}派 {f.actorId ? lookup(f.actorId, f.wave)?.name ?? f.actorId : ''}</strong><p>{eventText(f.text)}</p>{f.targetIds?.length ? <p>対象：{f.targetIds.map(id => lookup(id, f.wave)?.name ?? id).join('、')}</p> : null}<p>SP {f.partySp}/{f.maxSp}{f.spDelta !== undefined ? ` (${signed(f.spDelta)})` : ''}{f.burstGauge !== undefined ? ` · ゲージ ${f.burstGauge}/${f.maxBurstGauge ?? 200}` : ''}{f.gaugeDelta !== undefined ? ` (${signed(f.gaugeDelta)})` : ''}{f.remainingActions !== undefined ? ` · 残り${f.remainingActions}回` : ''}</p><p>敵SP：{f.enemies.map(enemy => `${lookup(enemy.id, f.wave)?.name ?? enemy.id} ${enemy.sp}/${enemy.maxSp}`).join(' · ')}</p>{f.hits && f.hits.length > 1 && <p>ヒット表示：{f.hits.join(' + ')}</p>}{f.reason && <p>{reasonText(f.reason)}</p>}</article>)}
    </> : detail?.skill ? <><h2>{detail.skill.name}</h2><p>{detail.readiness}{detail.cost !== undefined ? ` · 今回の消費SP ${detail.cost}` : ''}</p>{showDetailReason && <p>{detailReason}</p>}<p>基本消費SP {detail.skill.spCost} · {elements[detail.skill.element]}</p><p>{skillDescription(detail.skill, result.rulesVersion === 'balance-v2-20260920')}</p><p>条件：{skillConditionText(detail.skill)}</p><p>対象：{TARGET_LABELS[detail.skill.target] ?? detail.skill.target}</p><p>効果順：{detail.skill.effects.map(effect => `${statusNames[effect.type] ?? '状態効果'}${effect.cleanseCategory ? `（${CLEANSE_LABELS[effect.cleanseCategory]}）` : ''}`).join(' → ')}</p></> : detail?.unit && <><h2>{enemyDisplayName(detail.unit)}</h2>{enemyRoleLabel(detail.unit) && <p>{enemyRoleLabel(detail.unit)}</p>}<p>HP {detail.state ? Math.floor(detail.state.hp).toLocaleString() : undefined} / {detail.state ? Math.floor(detail.state.maxHp).toLocaleString() : undefined}</p>{detail.state && result.waves[frame.wave - 1]?.some(u => u.id === detail.unit?.id) && <p>SP {detail.state.sp} / {detail.state.maxSp} · あと {detail.state.count} 行動で割り込み</p>}{detail.unit.passives.length > 0 && <><h3>パッシブ</h3>{detail.unit.passives.map((p, i) => <p key={`${p.id}-${i}`}><strong>{p.name} Lv.{p.level ?? 0}</strong><br />{passiveDescription(p)}{detail.state?.passiveEffects?.find(entry=>entry.id===p.id) && <><br />記録時：{detail.state.passiveEffects.find(entry=>entry.id===p.id)?.active ? '条件成立' : '条件不成立・無効'}</>}</p>)}</>}<h3>スキル発動優先順</h3>{(detail.state?.skills ?? detail.unit.skills).map((s, slot) => <p key={s.id}><strong>優先{slot + 1}：{s.name}</strong>（SP {s.spCost}）<br />{skillConditionText(s)}<br />{skillDescription(s, result.rulesVersion === 'balance-v2-20260920')}</p>)}<h3>状態</h3>{detail.state?.statuses.length ? detail.state.statuses.map((s, i) => <p key={i}>{statusNames[s.type] ?? s.type} {s.type === 'shield' ? `残量 ${(s.amount ?? 0).toLocaleString()}` : ['dot','hot'].includes(s.type) ? `保持基礎量 ${s.amount ?? 0}` : ['stun','taunt'].includes(s.type) ? '' : `${s.power}%`} · 残り{s.remaining}回{s.sourceSkillId ? ` · 付与元 ${[...result.party, ...(result.waves[frame.wave - 1] ?? [])].flatMap(unit => unit.skills).find(skill => skill.id === s.sourceSkillId)?.name ?? '状態付与スキル'}` : ''}</p>) : <p>なし</p>}{detail.state?.stunImmune && <p>行動不能の再付与耐性：次の実行行動完了まで</p>}</>}</section></dialog>}
  </section>;
}
export default BattleView;
