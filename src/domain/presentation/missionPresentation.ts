import { FORMAL_MISSION_CONFIG } from '../redesign/formalMissions';
import type { MissionProjection } from '../redesign/missions';
import type { Reward } from '../redesign/types';
import { growthRewardImage } from '../redesign/growthAssetPresentation';
import { characterArt } from '../../theme/creativeAssets';
const masters = new Map(FORMAL_MISSION_CONFIG.missions.map(m => [m.id, m]));
/** Display only. Conditions, rewards and date-qualified claim IDs are unchanged. */
export function missionPresentation(m: MissionProjection) {
 const master=masters.get(m.id.split(':')[0]),c=master?.condition;
 let title=m.name.replace(/キャラクター|キャラ/g,'武将'),unit='件',destination:string|undefined;
 const original=title;
 if(c?.type==='stage_clear'){destination='quest';unit='回'}
 if(c?.type==='area_clear'){destination='quest';unit='面'}
 if(c?.type==='metric'){
 const n=c.target,v=c.threshold;
 const labels:Record<string,[string,string,string]>={
 battle:[`戦闘に${n}回挑戦`,'回','quest'],quest_clear:[`出陣で${n}回勝利`,'回','quest'],player_level:[`プレイヤーLv${n}に到達`,'Lv','quest'],
 character_count:[`武将を累計${n}種類入手`,'種類','gacha'],ssr_character_count:[`SSR武将を累計${n}種類入手`,'種類','gacha'],soul_unlock:['魂で武将を初解放','回','character'],
 character_level:[`Lv${v}以上の武将を${n}種類育成`,'種類','character'],character_awakening:[`覚醒+${v}以上の武将を${n}種類育成`,'種類','character'],
 skill_count:[`スキルを累計${n}種類入手`,'種類','gacha'],ssr_skill_count:['SSRスキルを初入手','種類','gacha'],skill_lb:[`LB${v}以上のスキルを${n}種類育成`,'種類','character'],
 ssr_equipment_count:['SSR装備を初入手','種類','gacha'],equipment_level:[`Lv${v}以上の装備を${n}個育成`,'個','character'],equipment_lb:[`LB${v}以上の装備を${n}個育成`,'個','character'],
 quest_five_party:['5人編成で出陣を初クリア','回','quest'],quest_skill_slot2:['第2枠スキル装備で出陣初クリア','回','quest'],quest_skill_slot3:['第3枠スキル装備で出陣初クリア','回','quest'],
 encounter_battle:['共闘の個人戦結果を初確定','回','raid'],encounter_win:['共闘の個人戦で初勝利','回','raid'],encounter_other_win:['他者開催の共闘で個人戦初勝利','回','raid'],encounter_rescue:['自分の共闘で救援を初送信','回','raid'],encounter_qualified_defeat:[`共闘を資格付きで${n}開催討伐`,'開催','raid'],
 invasion_battle:['侵攻の個人戦結果を初確定','回','territory'],invasion_win:[`侵攻の個人戦で${n}回勝利`,'回','territory'],invasion_host:['領土侵攻を初主催','回','territory'],invasion_host_qualified_clear:['主催した侵攻を資格付き初制覇','回','territory'],
 normal_gacha:['ノーマル召喚を1回行う','回','gacha'],growth:['育成を1回行う','回','character'],daily_completed:[`デイリー任務を${n}件達成`,'件','missions']};
 if(labels[c.key])[title,unit,destination]=labels[c.key];
 else if(c.key.startsWith('invasion_')){destination='territory';unit='回';title=title.replace('のいずれかの関門を資格付きで初突破','：任意関門を資格付き初突破').replace('城主を資格付きで初討伐','：城主を資格付き初討伐')}
 }
 // Detail is needed only when shortening or adding missing context, not on every daily row.
 let detail=original===title?title:`${original}（${master?.description??m.description}）`;
 if(c?.type==='metric'&&c.key==='daily_completed')detail+='。戦闘挑戦・出陣勝利・ノーマル召喚・育成のデイリー達成が対象です。';
 if(c?.type==='metric'&&(c.key.includes('qualified')||/^invasion_.+_(gate|lord)$/.test(c.key)))detail+='。対象の討伐報酬資格が成立した開催を数えます。参加・個人戦勝利だけでは達成になりません。';
 return {title,detail,unit,destination,daily:c?.type==='metric'&&!!c.daily,known:!!master};
}
export function missionRewardImage(r:Reward):string|undefined{
 const growth=growthRewardImage(r);if(growth)return growth;
 if(r.kind==='soul'||r.kind==='character')return characterArt({id:r.id},'portrait');
 if(r.kind==='ticket')return `/items/${r.id?.toLowerCase()}.png`;
 return ({cash:'/ui/sengoku/13-coin.png',free_diamonds:'/ui/sengoku/16-diamond.png',skill_material:'/items/skill_manual.png',equipment_lb:'/items/equip_lb_part.png',unlock_item:'/creative/items/territory-invasion-ticket.png'} as Partial<Record<Reward['kind'],string>>)[r.kind];
}
