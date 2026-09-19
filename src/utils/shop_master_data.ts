import { canonicalItemName } from "@/domain/gameplay/canonical/items";

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
const diaProducts = [[300,300],[500,500],[1030,1000],[2080,2000],[5240,5000],[10680,10000]];
const recoveries = [
  ["energy", "ENERGY_DRINK", "エナジードリンク"],
  ["bp", "PVP_POINT_TICKET", "ファイトチケット"],
  ["rp", "RAID_POINT_TICKET", "レイドチケット"],
];
const sourceProducts: ShopProduct[] = [
  {
    id: "beginner_pack_01", shopType: "LIMITED", category: "BEGINNER",
    title: "ビギナーパック", description: "", priceJpy: 100, purchaseLimit: 1, sortOrder: 1,
    items: [
      {itemId:"SPECIAL_TICKET_CHARACTER",itemName:"SPキャラチケット",quantity:1},
      {itemId:"SPECIAL_TICKET_SKILL",itemName:"SPスキルチケット",quantity:1},
      {itemId:"SPECIAL_TICKET_EQUIPMENT",itemName:"SP装備チケット",quantity:1},
      {itemId:"CASH",itemName:"CASH",quantity:1000},
      {itemId:"RAID_POINT_TICKET",itemName:"レイドチケット",quantity:3},
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
      {itemId:"CHAR_EXP_L",itemName:"強化ドリンク・大",quantity:30},
      {itemId:"EQUIP_EXP_L",itemName:"カスタムオイル・大",quantity:20},
      {itemId:"CASH",itemName:"CASH",quantity:10000},
    ],
  },
  {
    id:"awakening_pack_01",shopType:"LIMITED",category:"LIMITED_N",title:"覚醒応援パック",
    description:"",priceJpy:1000,purchaseLimit:3,sortOrder:4,
    items:[
      {itemId:"AWAKENING_BOOK",itemName:"覚醒の書",quantity:3},
      {itemId:"SKILL_MANUAL",itemName:"スキル指南書",quantity:3},
      {itemId:"EQUIP_LB_PART",itemName:"改造パーツ",quantity:3},
      {itemId:"CASH",itemName:"CASH",quantity:20000},
    ],
  },
  ...diaProducts.map(([quantity,priceJpy], index): ShopProduct => ({
    id:`diamond_${quantity}`, shopType:"LIMITED", category:"DIAMOND",
    title:`ダイア ${quantity.toLocaleString("ja-JP")}個`, description:"",
    priceJpy, items:[{itemId:"DIAMOND",itemName:"ダイア",quantity}], sortOrder:10+index,
  })),
  ...recoveries.flatMap(([key,itemId,itemName], index) => [1,11].map((quantity): ShopProduct => ({
    id:`${key}_${quantity}`,shopType:"NORMAL",category:"NORMAL_ITEM",
    title:`${itemName} ×${quantity}`,description:`${itemName}を${quantity}個購入します。`,
    priceDiamond:quantity===1?50:500, items:[{itemId,itemName,quantity}],sortOrder:100+index*2+(quantity===1?0:1),
  }))),
  ...[[3000,300],[5200,500],[10500,1000],[32000,3000]].map(([quantity,priceDiamond],index): ShopProduct => ({
    id:`cash_${quantity}`,shopType:"NORMAL",category:"NORMAL_ITEM",title:`CASH ${quantity.toLocaleString("ja-JP")}`,
    description:"育成や通常ガチャに使えるCASHです。",priceDiamond,
    items:[{itemId:"CASH",itemName:"CASH",quantity}],sortOrder:110+index,
  })),
];

const packTitles: Readonly<Record<string, string>> = {
  beginner_pack_01: "初陣応援パック", ticket_pack_01: "特選召喚札パック",
  growth_pack_01: "修練応援パック", awakening_pack_01: "覚醒応援パック",
};
export const SHOP_PRODUCTS_MASTER: ShopProduct[] = sourceProducts.map((product) => {
  const items = product.items.map((item) => ({ ...item, itemName: canonicalItemName(item.itemId) }));
  const single = items.length === 1 ? items[0] : null;
  return { ...product, items,
    title: packTitles[product.id] ?? (single ? `${single.itemName} ×${single.quantity.toLocaleString("ja-JP")}` : product.title),
    description: product.category === "DIAMOND" ? "登用や商店で使用できるダイヤです。"
      : product.id.startsWith("cash_") ? "姫武将の育成や通常登用に使えるCASHです。"
      : items.map(item => `${item.itemName} ×${item.quantity.toLocaleString("ja-JP")}`).join("／"),
  };
});

/** 表示用。購入の最終判定はサーバー側の注文・購入履歴を使用する。 */
export function remainingShopPurchases(product: ShopProduct, purchased: number): number | null {
  if (!product.purchaseLimit) return null;
  return Math.max(0, product.purchaseLimit - Math.max(0, Math.floor(purchased || 0)));
}
