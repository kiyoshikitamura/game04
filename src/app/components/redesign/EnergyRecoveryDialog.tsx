"use client";
import { useRef, useState } from 'react';
import CanonicalDialog from '../ui/CanonicalDialog';
import { game04UiError } from '@/app/lib/game04UiError';
export type EnergyRecovery = { owned: number; amount: number; canUse: boolean; onUse: () => Promise<void> };
export default function EnergyRecoveryDialog({ recovery, onCancel, onRecovered }: { recovery?: EnergyRecovery; onCancel: () => void; onRecovered: () => void }) {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const available = busy || (!error && !!recovery && recovery.owned > 0 && recovery.canUse);
  async function usePotion() {
    if (!available || lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await recovery!.onUse(); onRecovered(); }
    catch (reason) { setError(game04UiError(reason)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <CanonicalDialog kind={available ? 'confirm' : 'notice'} onClose={available && !busy ? onCancel : undefined} ariaLabel="行動力の回復" actions={available ? [
    { label: 'キャンセル', onClick: onCancel, disabled: busy },
    { label: busy ? '使用中…' : '使用する', onClick: usePotion, semantic: 'primary', disabled: busy },
  ] : [{ label: '閉じる', onClick: onCancel }]}>
    <p>行動力が足りません。{available && <><br/>回復薬を使用しますか？</>}</p>
    {recovery && <><img className="g4-recovery-icon" src="/items/energy_drink.png" alt="回復薬"/><p>消費数 1個 ／ 所持数 {recovery.owned}個</p><p>回復量 {recovery.amount}</p></>}
    {!available && <p>行動力の自然回復をお待ちください。</p>}
    {error && <p role="alert">{error}</p>}
  </CanonicalDialog>;
}
