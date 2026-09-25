"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import { SHOP_PRODUCTS_MASTER, ShopProduct, ShopProductItem, remainingShopPurchases } from "@/utils/shop_master_data";
import { loadBillingReadiness, peekBillingReadiness } from "@/utils/billing_config_client";
import "./ShopTab.css";
import SectionHeader from "./ui/SectionHeader";
import SubTabNav from "./ui/SubTabNav";
import OutlawCard from "./ui/OutlawCard";
import OutlawButton from "./ui/OutlawButton";
import BillingHistory from "./BillingHistory";
import PaidAssetExpiry from "./PaidAssetExpiry";
import ShopExchangePanel from "./ShopExchangePanel";
import type { RedesignState } from "@/domain/redesign/types";
import { isVipActive } from "@/domain/redesign/vip";
import { SHOP_CATALOG_VERSION } from "@/utils/shop_master_data";

const PACK_EXPIRY_NOTICE = "パックの未使用アイテム・銭は付与から120日で失効します。プレゼント受取による期限延長はありません。";
const shopText = (value: string) => value.replaceAll("CASH", "銭").replaceAll("ダイア", "輝石").replaceAll("ダイヤ", "輝石");

function Bundle({ product }: { product: ShopProduct }) {
  return <p className="shop-bundle-text">
    {product.category === "VIP" && product.description}
    {product.items.map(item => `${shopText(item.itemName)} ×${item.quantity.toLocaleString("ja-JP")}`).join(" / ")}
  </p>;
}

export type ShopExchangeProps = { state: RedesignState; onExchange: (payload: Record<string, unknown>) => Promise<unknown>; onUseEnergyDrink?: () => Promise<unknown> };
export default function ShopTab({ exchange }: { exchange?: ShopExchangeProps } = {}) {
  const [initialReadiness] = useState(peekBillingReadiness);
  const [availability, setAvailability] = useState<"loading" | "available" | "unavailable">(initialReadiness ? "available" : "loading");
  const [sandbox, setSandbox] = useState(initialReadiness?.mode === "sandbox");
  const [availabilityAttempt, setAvailabilityAttempt] = useState(0);
  const [disabledProductIds, setDisabledProductIds] = useState<string[]>(initialReadiness?.disabledProductIds ?? []);
  useEffect(() => {
    let active = true;
    loadBillingReadiness(availabilityAttempt > 0)
      .then(data => {
        if (!active) return;
        setAvailability(data.available === true && data.catalogVersion === SHOP_CATALOG_VERSION ? "available" : "unavailable");
        setDisabledProductIds(Array.isArray(data.disabledProductIds) ? data.disabledProductIds : []);
        setSandbox(data.mode === "sandbox");
      }).catch(() => { if (active) setAvailability("unavailable"); });
    return () => { active = false; };
  }, [availabilityAttempt]);
  const {
    shopSubTab, setShopSubTab, userShopPurchases, boughtResultModal,
    setBoughtResultModal, handleBuyNormalProduct, handleBuyStripeProduct,
    profileLoading, upgradeLoading, setConfirmDialogConfig, session,
    onboardingState, handleGoogleLogin
  } = useGame();
  const busy = profileLoading || upgradeLoading;
  const disabled = busy || availability !== "available";
  const packOrder = ["beginner_pack_01", "growth_pack_01", "awakening_pack_01", "ticket_pack_01", "game04_vip_30d"];
  const packs = SHOP_PRODUCTS_MASTER.filter(p => p.shopType === "LIMITED" && p.category !== "DIAMOND").sort((a,b) => packOrder.indexOf(a.id)-packOrder.indexOf(b.id));
  const diamonds = SHOP_PRODUCTS_MASTER.filter(p => p.category === "DIAMOND").sort((a,b) => a.sortOrder-b.sortOrder);
  const normal = SHOP_PRODUCTS_MASTER.filter(p => p.shopType === "NORMAL").sort((a,b) => a.sortOrder-b.sortOrder);
  const purchaseAuthReady = Boolean(session?.user?.id
    && session.user.is_anonymous !== true
    && (exchange || (onboardingState?.user_id === session.user.id
    && onboardingState.has_profile
    && onboardingState.identity_integrity_valid
    && onboardingState.gameplay_authorized)));

  const showPurchaseAuthGate = () => {
    window.localStorage.setItem("tribe_purchase_auth_return", "shop");
    setConfirmDialogConfig({
      isOpen: true,
      title: "購入前にアカウント連携をお願いします",
      message: <div>
        <p>購入したアイテムやプレイデータを安全に引き継ぐため、課金商品の購入にはアカウント連携が必要です。</p>
        <p>アカウント連携後も、現在のゲームデータはそのまま利用できます。</p>
      </div>,
      confirmText: "アカウント連携する",
      cancelText: "あとで",
      presentation: "canonical",
      onConfirm: async () => {
        setConfirmDialogConfig({ isOpen: false });
        if (exchange) window.location.assign("/auth/game04");
        else await handleGoogleLogin();
      },
      onCancel: () => {
        window.localStorage.removeItem("tribe_purchase_auth_return");
        setConfirmDialogConfig({ isOpen: false });
      },
    });
  };

  useEffect(() => {
    if (!boughtResultModal) return;
    const close = () => { setConfirmDialogConfig({ isOpen: false }); setBoughtResultModal(null); };
    setConfirmDialogConfig({
      isOpen: true, title: "購入完了",
      message: <div>
        {boughtResultModal.items.map((item: ShopProductItem) => <div key={item.itemId} className="bundle-item-chip">
          <span>{shopText(item.itemName)}</span><span>×{item.quantity.toLocaleString("ja-JP")}</span>
        </div>)}
        <p className="shop-card-desc">{boughtResultModal.productTitle === "VIPパス" ? "VIP特典が反映されました。" : "プレゼントBOXに届きました。"}</p>
      </div>,
      confirmText: "確認する", onConfirm: close, onCancel: close
    });
  }, [boughtResultModal, setConfirmDialogConfig, setBoughtResultModal]);

  const confirmPurchase = (product: ShopProduct) => {
    if (disabled || disabledProductIds.includes(product.id) || remainingShopPurchases(product, userShopPurchases[product.id] || 0) === 0) return;
    const paid = product.shopType === "LIMITED";
    if (paid && !purchaseAuthReady) {
      showPurchaseAuthGate();
      return;
    }
    const vip = product.category === "VIP";
    if (vip && exchange && isVipActive(exchange.state.vipExpiresAt)) return;
    const isPack = paid && product.category !== "DIAMOND" && !vip;
    const remaining = remainingShopPurchases(product, userShopPurchases[product.id] || 0);
    setConfirmDialogConfig({
      isOpen: true, title: shopText(product.title),
      message: <div>
        <Bundle product={product} />
        <p className="shop-price">{paid ? `¥${product.priceJpy?.toLocaleString("ja-JP")}（税込）` : `${product.priceDiamond?.toLocaleString("ja-JP")} 輝石`}</p>
        {!paid && <p className="shop-expiry-notice">有償輝石で交換した分は、元の有効期限を引き継ぎます。</p>}
        {remaining !== null && <p className="shop-card-desc">残り{remaining} / {product.purchaseLimit}回</p>}
        {isPack && <p className="shop-expiry-notice">{PACK_EXPIRY_NOTICE}</p>}
        {paid && !isPack && !vip && <p className="shop-expiry-notice">有償{product.priceJpy?.toLocaleString("ja-JP")}＋無償{((product.items[0]?.quantity ?? 0)-(product.priceJpy ?? 0)).toLocaleString("ja-JP")} 輝石。有償分は付与から120日、無償分は無期限です。</p>}
      </div>,
      confirmText: paid ? "お支払いへ" : "購入する",
      onConfirm: async () => {
        setConfirmDialogConfig({ isOpen: false });
        if (paid) await handleBuyStripeProduct(product.id);
        else await handleBuyNormalProduct(product.id, "DIAMOND");
      },
      onCancel: () => setConfirmDialogConfig({ isOpen: false })
    });
  };

  const productCard = (product: ShopProduct) => {
    const remaining = remainingShopPurchases(product, userShopPurchases[product.id] || 0);
    const vipActive = product.category === "VIP" && !!exchange && isVipActive(exchange.state.vipExpiresAt);
    const soldOut = remaining === 0 || vipActive;
    const compact = product.category === "DIAMOND" || product.shopType === "NORMAL";
    const price = product.priceJpy !== undefined
      ? `¥${product.priceJpy.toLocaleString("ja-JP")}`
      : `${product.priceDiamond?.toLocaleString("ja-JP")} 輝石`;
    return <OutlawCard key={product.id} glowLine="left" className={`shop-product-card ${compact ? "shop-product-row" : "shop-product-pack"}`}>
      <div className="shop-product-info">
        <div className="shop-card-heading">
          <div className="shop-card-title">{shopText(product.title)}
            {product.category === "DIAMOND" && <span className="shop-dia-breakdown">（有償{product.priceJpy?.toLocaleString("ja-JP")}個＋無償{((product.items[0]?.quantity ?? 0)-(product.priceJpy ?? 0)).toLocaleString("ja-JP")}個）</span>}
          </div>
          {remaining !== null && <span className="shop-limit-badge">{soldOut ? "購入済み" : `残り${remaining} / ${product.purchaseLimit}回`}</span>}
        </div>
        {!compact && <Bundle product={product} />}
      </div>
      <OutlawButton variant="primary" className="shop-buy-button"
        aria-label={`${shopText(product.title)}を${price}で購入`}
        disabled={disabled || soldOut || disabledProductIds.includes(product.id)} onClick={() => confirmPurchase(product)}>
        {busy ? <span className="shop-btn-spinner" aria-label="処理中" /> : soldOut ? (vipActive ? "有効中" : "購入済み") : disabledProductIds.includes(product.id) ? "準備中" : price}
      </OutlawButton>
    </OutlawCard>;
  };

  return <div className="view-container shop-tab-container">
    <SectionHeader title="商店" />
    {sandbox && availability === "available" && <p className="shop-billing-notice">テスト決済環境</p>}
    <div className="shop-account-actions"><BillingHistory /><PaidAssetExpiry /></div>
    <SubTabNav className="shop-sub-tabs" tabs={[{id:"LIMITED",label:"特選商店"},{id:"NORMAL",label:"輝石商店"}, ...(exchange ? [{id:"EXCHANGE",label:"交換所"}] : [])]}
      activeTabId={shopSubTab} onSelect={setShopSubTab} />
    <p className="shop-tax-note">価格は全て税込み表示です</p>
    {availability === "loading" && <div className="shop-status"><span className="shop-btn-spinner" aria-label="購入情報を確認中" /></div>}
    {availability === "unavailable" && <div className="shop-status" role="status">
      <p>ただいま購入できません。</p>
      <OutlawButton variant="secondary" onClick={() => {
        setAvailability("loading");
        setAvailabilityAttempt(attempt => attempt + 1);
      }}>再確認する</OutlawButton>
    </div>}
    <div className="scroll-container flex-1 shop-scroll-body custom-scrollbar">
      {shopSubTab === "EXCHANGE" && exchange ? <ShopExchangePanel {...exchange} /> : shopSubTab === "LIMITED" ? <>
        <section className="shop-section" aria-label="パック">
          {packs.map(productCard)}
          <p className="shop-expiry-notice">{PACK_EXPIRY_NOTICE}</p>
        </section>
        <section className="shop-section" aria-label="輝石">
          <div className="shop-section-title">輝石</div>
          {diamonds.map(productCard)}
        </section>
      </> : <section className="shop-section" aria-label="輝石商店">{normal.map(productCard)}</section>}
    </div>
  </div>;
}
