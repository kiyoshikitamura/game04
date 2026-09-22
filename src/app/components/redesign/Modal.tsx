"use client";
import React, { useEffect, useId, useState } from 'react';
import { usePresentationBusy } from '../ui/presentationTasks';
import DialogSurface from '../ui/DialogSurface';

export default function Modal({ title, onClose, children, footer, className = '', kind = 'detail', dirty = false, busy = false, trackChanges = false, resetKey }: {
  title?: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode | ((cancel: () => void) => React.ReactNode); className?: string;
  kind?: 'detail' | 'confirm' | 'edit' | 'result' | 'notice'; dirty?: boolean; busy?: boolean; trackChanges?: boolean; resetKey?: unknown;
}) {
  const id = useId();
  usePresentationBusy(busy);
  const [changed, setChanged] = useState(false);
  useEffect(() => { setChanged(false); }, [resetKey]);
  const [discard, setDiscard] = useState(false);
  const cancel = () => { if (busy) return; if ((dirty || changed) && !discard) setDiscard(true); else onClose(); };
  const hasClose = kind !== 'result' && kind !== 'notice';
  return <DialogSurface className="rd-modal-backdrop" onCancel={hasClose ? cancel : undefined}>
    <section role="dialog" aria-modal="true" aria-labelledby={title ? id : undefined} aria-label={title ? undefined : '確認'} className={`rd-modal ${className}`}>
      {(title || hasClose) && <header className="rd-modal-header"><h2 id={id}>{discard ? '変更を破棄しますか？' : title}</h2>{hasClose && <button className="rd-button g4-dialog-close" disabled={busy} onClick={() => discard ? setDiscard(false) : cancel()} aria-label="閉じる">×</button>}</header>}
      <div className="rd-modal-body" onInputCapture={() => { if (trackChanges) setChanged(true); }} onChangeCapture={() => { if (trackChanges) setChanged(true); }}>{discard ? <p>保存していない変更を破棄して戻ります。</p> : children}</div>
      {(discard || footer || kind === 'result' || kind === 'notice') && <footer className="rd-modal-footer">{discard ? <div className="g4-cta-row"><button className="rd-button" onClick={() => setDiscard(false)}>キャンセル</button><button className="rd-button rd-primary" onClick={onClose}>破棄する</button></div> : (typeof footer === 'function' ? footer(cancel) : footer) ?? <button className="rd-button" onClick={onClose}>閉じる</button>}</footer>}
    </section>
  </DialogSurface>;
}
