'use client';
import { useEffect, useRef } from 'react';
import './qa-operations.css';

const VIEWS = [['home', 'Home'], ['quest', 'Quest'], ['character', 'Growth'], ['raid', 'Raid'], ['territory', '領土侵攻'], ['battle', 'Battle'], ['gacha', 'ガチャ'], ['shop', 'ショップ'], ['missions', 'ミッション']] as const;

type Props = {
  open: boolean; onClose: () => void; activeView: string; onSelectView: (view: string) => void;
  vip: boolean; onVipChange: (value: boolean) => void;
  cash: number; energy: number; energyMax: number; message: string;
  onReset: () => void; onEmptyItems: () => void; onReplenish: () => void;
};

/** Full-screen QA surface: the fixture and underlying view stay mounted. */
export default function QaOperations(props: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (props.open && !dialog.current?.open) dialog.current?.showModal();
    if (!props.open && dialog.current?.open) dialog.current.close();
  }, [props.open]);
  return <dialog ref={dialog} className="qa-operations" aria-labelledby="qa-operations-title" onCancel={event => { event.preventDefault(); props.onClose(); }}>
    <div className="qa-operations-content">
      <header className="qa-operations-header"><h1 id="qa-operations-title">QA操作</h1><button className="rd-button" autoFocus onClick={props.onClose}>確認画面へ戻る</button></header>
      <p><strong>表示確認専用・ローカル操作</strong></p><p>保存・API接続・認証・決済は行いません。再読込で初期化されます。</p>
      <h2>確認対象</h2><div className="rd-tabs qa-operations-views">{VIEWS.map(([id, label]) => <button key={id} className={props.activeView === id ? 'active' : ''} aria-current={props.activeView === id ? 'page' : undefined} onClick={() => props.onSelectView(id)}>{label}</button>)}</div>
      <section className="rd-stack"><label><input type="checkbox" checked={props.vip} onChange={event => props.onVipChange(event.target.checked)} /> VIP表示確認</label>
        <button className="rd-button" onClick={props.onReset}>QA初期化</button>
        <button className="rd-button" onClick={props.onEmptyItems}>QA 開催アイテム0</button>
        <button className="rd-button" onClick={props.onReplenish}>QA 開催枠とアイテム補充</button>
      </section>
      <p>銭 {props.cash} ／ 行動力 {props.energy}/{props.energyMax}</p>{props.message && <p role="status">{props.message}</p>}
    </div>
  </dialog>;
}
