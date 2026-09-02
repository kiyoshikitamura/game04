"use client";

import { usePathname } from "next/navigation";
import type { ApplicationAvailability as Availability } from "@/lib/operations/contract";

export function MaintenanceNotice({ availability }: { availability: Availability }) {
  const disabled = availability.state === "disabled";
  return (
    <main className="shell title-shell" data-operational-state={availability.state}>
      <p className="eyebrow">GAME04 · SYSTEM STATUS</p>
      <h1 className="engineering-title">{disabled ? "現在ご利用いただけません" : "メンテナンス中です"}</h1>
      <p className="lede">
        {disabled
          ? "安全な再開準備が整うまで、しばらくお待ちください。"
          : "作業が完了し次第、同じページから再開できます。"}
      </p>
      <button className="primary-action availability-retry" type="button" onClick={() => window.location.reload()}>
        状態を再確認
      </button>
      <p className="notice">状態コード: {availability.messageCode ?? "system.unavailable"}</p>
    </main>
  );
}

export function ApplicationAvailability({
  availability,
  children,
}: {
  availability: Availability;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/engineering/operations" || availability.state === "enabled") return children;
  return <MaintenanceNotice availability={availability} />;
}
