"use client";

type Props = {
  className?: string;
  label?: string;
};

export default function BrandedLoading({ className = "", label = "戦国の世界を準備中" }: Props) {
  return (
    <div className={`branded-loading ${className}`.trim()} role="status" aria-live="polite" aria-label={label}>
      <img src="/branding/tribe-neon-logo.png" alt="戦国姫艶武" />
      <span>{label}</span>
    </div>
  );
}
