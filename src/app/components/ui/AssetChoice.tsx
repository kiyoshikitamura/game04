import type { ReactNode } from 'react';
import './asset-choice.css';

/** Acquisition and inventory surfaces only; battle presentation stays independent. */
export function AssetIcon({ src, name, className = '' }: { src: string; name: string; className?: string }) {
  return <span className={`g4-asset-icon ${className}`}><img src={src} alt={name} /></span>;
}

export function AssetChoice({ image, name, metadata, description, status, disabled, onSelect }: {
  image: string; name: string; metadata: ReactNode; description: ReactNode; status?: string;
  disabled?: boolean; onSelect: () => void;
}) {
  return <button type="button" className="g4-asset-choice" disabled={disabled} onClick={onSelect}>
    <AssetIcon src={image} name="" />
    <span className="g4-asset-choice-copy"><strong>{name}</strong><span>{metadata}</span>
      <span className="g4-asset-choice-description">{description}</span>{status && <small>{status}</small>}
    </span>
  </button>;
}
