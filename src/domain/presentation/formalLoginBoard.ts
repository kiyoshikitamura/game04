import {loginBonusForDay} from '../redesign/loginBonus';
import {growthRewardImage} from '../redesign/growthAssetPresentation';
import {raidRewardLabel} from '../redesign/raidPresentation';
import {characterArt} from '../../theme/creativeAssets';
import type {Reward} from '../redesign/types';

export function loginBoardRewards(day:number) {
  const grant=loginBonusForDay(day);
  const rewards:Reward[]=[...grant.rewards,...(grant.freeDiamonds?[{kind:'free_diamonds' as const,amount:grant.freeDiamonds}]:[])];
  return rewards.map((reward,i)=>({
    key:`${reward.kind}:${reward.id??''}:${i}`,
    name:raidRewardLabel(reward).replace(/ ×[\d,]+$/,''),
    amount:reward.amount,
    image:growthRewardImage(reward)??(reward.kind==='cash'?'/ui/sengoku/13-coin.png'
      :reward.kind==='free_diamonds'?'/ui/sengoku/16-diamond.png'
      :reward.kind==='soul'?characterArt({id:reward.id},'portrait')
      :reward.kind==='ticket'?`/items/${reward.id?.toLowerCase()}.png`:undefined),
  }));
}
export function loginBoardStatus(day:number,today:number) {
  // Day 1 of the next cycle is announced separately; completed cells stay received.
  return day===today?'本日':day<today?'受取済み':day===today+1?'次回':'未到達';
}
