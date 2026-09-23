import data from './data/formal-character-stats.json';
import type { Element, Rarity, Stats } from './types';

export const FORMAL_CHARACTER_STATS_VERSION=data.version;
const elements:Record<string,Element>={火:'fire',水:'water',土:'earth',風:'wind',光:'light',闇:'dark'};
export const FORMAL_CHARACTER_ASSIGNMENTS=data.characters.map(row=>({...row,rarity:row.rarity as Rarity,element:elements[row.element]}));
/** Preserve fractional values through interpolation, role and individual coefficients. */
function interpolate(level:number,values:number[]):number {
 for(let i=1;i<data.levels.length;i++)if(level<=data.levels[i])return values[i-1]+(values[i]-values[i-1])*(level-data.levels[i-1])/(data.levels[i]-data.levels[i-1]);
 return values[values.length-1];
}
/** Body only. Equipment/passives are added by the existing caller; awakening unlocks levels only. */
export function getFormalCharacterStats(characterId:string,level:number,baseSp:number):Stats {
 if(!Number.isInteger(level)||level<1||level>100)throw Error('武将Lvは1〜100で指定してください。');
 const character=data.characters.find(row=>row.id===characterId);if(!character)throw Error(`正式武将能力がありません: ${characterId}`);
 const anchors=data.anchors[character.rarity as keyof typeof data.anchors];
 const role=data.roles[character.role as keyof typeof data.roles],profile=data.profiles[character.profile as keyof typeof data.profiles];
 const body=(key:'hp'|'atk'|'def')=>interpolate(level,anchors[key])*role[key]*profile[key];
 const luk=(level<=50?10+10*(level-1)/49:20+10*(level-50)/50)+profile.luk;
 return {hp:body('hp'),atk:body('atk'),def:body('def'),luk,sp:baseSp};
}
