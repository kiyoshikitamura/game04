import { VIP_PRODUCT } from "@/domain/redesign/vip";
import { canonicalItemName } from "@/domain/gameplay/canonical/items";

export const SHOP_CATALOG_VERSION = "20260922-game04-shop";

export interface ShopProductItem {
  itemId: string;
  itemName: string;
  quantity: number;
}

export interface ShopProduct {
  id: string;
  shopType: "LIMITED" | "NORMAL";
  category: "BEGINNER" | "VIP" | "LIMITED_N" | "DIAMOND" | "NORMAL_ITEM";
  title: string;
  description: string;
  priceJpy?: number;        // 日本円（Stripe決済時）
  priceCash?: number;       // キャッシュ価格
  priceDiamond?: number;    // ダイヤ価格
  purchaseLimit?: number;   // 最大購入可能回数（0または未定義は無制限）
  timeLimitHours?: number;  // アカウント作成からの制限時間（時間単位）
  bannerUrl?: string;       // 販促バナー画像パス（差替可能）
  iconUrl?: string;         // アイコン画像パス（差替可能）
  items: ShopProductItem[];
  sortOrder: number;
}

// 商品Authority: specs/monetization_release_20260912.md。価格は税込。
const diaProducts = [[300,300],[500,500],[1000,1000],[3000,3000],[5000,5000],[10000,10000]];
const sourceProducts: ShopProduct[] = [
  {
    id: "beginner_pack_01", shopType: "LIMITED", category: "BEGINNER",
    title: "ビギナーパック", description: "", priceJpy: 100, purchaseLimit: 1, sortOrder: 1,
    items: [
      {itemId:"SPECIAL_TICKET_CHARACTER",itemName:"キャラ券",quantity:1},
      {itemId:"SPECIAL_TICKET_SKILL",itemName:"スキル券",quantity:3},
      {itemId:"SPECIAL_TICKET_EQUIPMENT",itemName:"装備券",quantity:1},
      {itemId:"ENERGY_DRINK",itemName:"活力丸",quantity:2},
      {itemId:"CASH",itemName:"銭",quantity:10000},
    ],
  },
  {
    id:"ticket_pack_01",shopType:"LIMITED",category:"LIMITED_N",title:"チケットパック",
    description:"",priceJpy:1500,purchaseLimit:3,sortOrder:2,
    items:[
      {itemId:"SPECIAL_TICKET_CHARACTER",itemName:"SPキャラチケット",quantity:5},
      {itemId:"SPECIAL_TICKET_SKILL",itemName:"SPスキルチケット",quantity:5},
      {itemId:"SPECIAL_TICKET_EQUIPMENT",itemName:"SP装備チケット",quantity:5},
    ],
  },
  {
    id:"growth_pack_01",shopType:"LIMITED",category:"LIMITED_N",title:"育成応援パック",
    description:"",priceJpy:500,purchaseLimit:3,sortOrder:3,
    items:[
      {itemId:"CHAR_EXP_XL",itemName:"キャラEXP特大",quantity:5},
      {itemId:"EQUIP_EXP_XL",itemName:"装備EXP特大",quantity:15},
      {itemId:"CASH",itemName:"銭",quantity:100000},
    ],
  },
  {
    id:"awakening_pack_01",shopType:"LIMITED",category:"LIMITED_N",title:"覚醒応援パック",
    description:"",priceJpy:1000,purchaseLimit:3,sortOrder:4,
    items:[
      {itemId:"SOUL_SELECTOR_SSR",itemName:"SSR選択魂",quantity:3},
      {itemId:"SKILL_LB_PART",itemName:"スキルLB素材",quantity:100},
      {itemId:"EQUIP_LB_PART",itemName:"装備LB素材",quantity:150},
      {itemId:"CASH",itemName:"銭",quantity:50000},
    ],
  },
  { id: VIP_PRODUCT.id, shopType: "LIMITED", category: "VIP", title: VIP_PRODUCT.name,
    description: "720時間、バトル3倍速・スキップ。無償輝石100個を購入時と以後24時間ごとに合計30回付与。自動更新なし。",
    priceJpy: VIP_PRODUCT.priceJpy, items: [], sortOrder: 5 },
  ...diaProducts.map(([quantity,priceJpy], index): ShopProduct => ({
    id:`diamond_${quantity}`, shopType:"LIMITED", category:"DIAMOND",
    title:`輝石 ${quantity.toLocaleString("ja-JP")}個`, description:"",
    priceJpy, items:[{itemId:"DIAMOND",itemName:"ダイア",quantity}], sortOrder:10+index,
  })),
];

const packTitles: Readonly<Record<string, string>> = {
  beginner_pack_01: "初陣応援パック", ticket_pack_01: "特選召喚札パック",
  growth_pack_01: "修練応援パック", awakening_pack_01: "覚醒応援パック",
};
export const SHOP_PRODUCTS_MASTER: ShopProduct[] = sourceProducts.map((product) => {
  const items = product.items.map((item) => ({ ...item, itemName: canonicalItemName(item.itemId) === item.itemId ? item.itemName : canonicalItemName(item.itemId) }));
  const single = items.length === 1 ? items[0] : null;
  return { ...product, items,
    title: packTitles[product.id] ?? (single ? `${single.itemName} ×${single.quantity.toLocaleString("ja-JP")}` : product.title),
    description: product.category === "VIP" ? product.description : product.category === "DIAMOND" ? "登用や交換所で使用できる輝石です。"
      : product.id.startsWith("cash_") ? "姫武将の育成や通常登用に使える銭です。"
      : items.map(item => `${item.itemName} ×${item.quantity.toLocaleString("ja-JP")}`).join("／"),
  };
});

/** 表示用。購入の最終判定はサーバー側の注文・購入履歴を使用する。 */
export function remainingShopPurchases(product: ShopProduct, purchased: number): number | null {
  if (!product.purchaseLimit) return null;
  return Math.max(0, product.purchaseLimit - Math.max(0, Math.floor(purchased || 0)));
}
