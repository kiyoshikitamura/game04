import React from "react";
import CanonicalItemIcon from "./CanonicalItemIcon";
import "./RewardReceipt.css";

export interface RewardReceiptItem {
  id?: string;
  name: string;
  quantity: number;
  kind?: "ITEM" | "COSMETIC";
  delivery?: "PRESENT" | "INVENTORY";
}

interface RewardReceiptProps {
  items: RewardReceiptItem[];
  delivery?: "PRESENT" | "INVENTORY";
  note?: string;
}

export default function RewardReceipt({ items, delivery = "INVENTORY", note }: RewardReceiptProps) {
  const destinations = new Set(items.map(item => item.delivery ?? delivery));
  const mixed = destinations.size > 1;
  return (
    <div className="reward-receipt" data-delivery={mixed ? "MIXED" : [...destinations][0] ?? delivery}>
      <div className="reward-receipt-list" aria-label="獲得報酬">
        {items.map((item, index) => (
          <div className={`reward-receipt-item ${item.kind === "COSMETIC" ? "is-cosmetic" : ""}`} data-reward-kind={item.kind || "ITEM"} key={`${item.id || item.name}-${index}`}>
            {item.kind === "COSMETIC"
              ? <span className="reward-receipt-cosmetic-mark" aria-hidden="true">装飾</span>
              : <CanonicalItemIcon itemId={item.id} alt="" className="reward-receipt-mark" />}
            <span className="reward-receipt-name">{item.name}</span>
            {item.kind === "COSMETIC" ? null : <strong className="reward-receipt-quantity">× {Number(item.quantity).toLocaleString()}</strong>}
            {mixed && <small className="reward-receipt-destination">{(item.delivery ?? delivery) === 'PRESENT' ? 'プレゼントBOXへ' : '所持品へ'}</small>}
          </div>
        ))}
      </div>
      <p className="reward-receipt-note">
        {note || (mixed ? "所持品とプレゼントBOXに入りました。" : (destinations.has("PRESENT") || (!items.length && delivery === "PRESENT")) ? "報酬はプレゼントへ送られました。" : "所持品に入りました。")}
      </p>
    </div>
  );
}
