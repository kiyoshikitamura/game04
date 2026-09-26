import type { RedesignState, Rarity } from './types';
import { EXP_SIZES, emptyGrowthInventory } from './growthMaster';
import { growthRewardLabel } from './growthReward';
import { growthExpImage, growthSoulImage, approvedGrowthItemImage } from './growthAssetPresentation';
import { CHARACTER_MASTERS } from './masters';
import { CANONICAL_ITEM_BY_ID, canonicalItemName } from '../gameplay/canonical/items';

export const INVENTORY_CATEGORIES = ['回復・侵攻', '召喚券', '育成', '魂', '保管品'] as const;
export type InventoryCategory = typeof INVENTORY_CATEGORIES[number];
export type InventoryEntry = { key: string; name: string; amount: number; image?: string; category: InventoryCategory; detail: string; destination?: string; use?: 'use_energy_drink' };
export type StoredItem = { item_id: string; quantity: number };

/** Read projection only. Never add a delivery ledger to spendable balances or
 * silently convert the separate, unmigrated user_items growth stock. */
export function inventoryEntries(state: RedesignState, stored: StoredItem[]): InventoryEntry[] {
  const growth = state.growthInventory ?? emptyGrowthInventory();
  const rows: InventoryEntry[] = [
    {key:'energy',name:canonicalItemName('ENERGY_DRINK'),amount:state.energyDrinks??0,image:'/items/energy_drink.png',category:'回復・侵攻',detail:'行動力を50回復します。',use:'use_energy_drink'},
    {key:'invasion',name:'侵攻令',amount:state.materials.unlock,image:'/creative/items/territory-invasion-ticket.png',category:'回復・侵攻',detail:'領土侵攻の主催に使用します。',destination:'territory'},
    {key:'skill-lb',name:canonicalItemName('SKILL_MANUAL'),amount:state.materials.skill,image:'/items/skill_manual.png',category:'育成',detail:'スキルのLBに使用します。',destination:'character'},
    {key:'equipment-lb',name:canonicalItemName('EQUIP_LB_PART'),amount:state.materials.equipmentLb,image:'/items/equip_lb_part.png',category:'育成',detail:'装備のLBに使用します。',destination:'character'},
  ];
  for (const kind of ['character','equipment'] as const) for (const size of EXP_SIZES) rows.push({key:`${kind}-${size}`,name:growthRewardLabel({kind:`${kind}_exp_item`,id:size})!,amount:growth.expItems[kind][size],image:growthExpImage(kind,size),category:'育成',detail:`${kind==='character'?'武将':'装備'}のLv育成に使用します。繰越EXP：${growth.carryExp[kind].toLocaleString()}`,destination:'character'});
  for (const rarity of ['N','R','SR','SSR'] as Rarity[]) for (const kind of ['generic_soul','soul_selector'] as const) rows.push({key:`${kind}-${rarity}`,name:growthRewardLabel({kind,id:rarity})!,amount:growth[kind==='generic_soul'?'genericSouls':'soulSelectors'][rarity],image:growthSoulImage(kind,rarity),category:'魂',detail:kind==='generic_soul'?'同じレアリティの武将の覚醒に使用します。':'所持武将の固有魂を選択します。',destination:'character'});
  for (const [id,amount] of Object.entries(state.souls)) {
    const master=CHARACTER_MASTERS.find(c=>c.id===id);
    rows.push({key:`soul-${id}`,name:`${master?.name??id}の魂`,amount,image:master?.image,category:'魂',detail:'武将の解放・覚醒・魂交換に使用します。',destination:'character'});
  }
  for (const [id,amount] of Object.entries(state.territoryItems??{})) if(id!=='raid_unlock') rows.push({key:`territory-${id}`,name:canonicalItemName(id),amount,category:'回復・侵攻',detail:'領土侵攻の開催アイテムです。',destination:'territory'});
  for (const [id,amount] of [['character',state.materials.character],['equipment',state.materials.equipment]] as const) if(amount>0) rows.push({key:`legacy-${id}`,name:`${id==='character'?'武将':'装備'}育成素材（保管分）`,amount,category:'保管品',detail:'従来の所持分です。現在のEXP素材へ自動換算せず保持しています。'});
  for (const item of stored) {
    const master=CANONICAL_ITEM_BY_ID.get(item.item_id);
    const ticket=master?.category==='GACHA_TICKET';
    rows.push({key:`stored-${item.item_id}`,name:canonicalItemName(item.item_id),amount:item.quantity,image:approvedGrowthItemImage(item.item_id)??master?.assetPath,category:ticket?'召喚券':'保管品',detail:ticket?'所持している召喚券です。使用可否は召喚画面で確認できます。':'従来の所持分です。現在の育成・回復素材と合算・自動換算せず保持しています。',...(item.item_id.startsWith('SPECIAL_TICKET_')?{destination:'gacha'}:{})});
  }
  return rows.filter(r=>r.amount>0);
}
