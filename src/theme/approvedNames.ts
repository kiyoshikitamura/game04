/** User-approved display names. IDs, stored snapshots and gameplay rules stay unchanged. */
export const PASSIVE_NAMES: Readonly<Record<string,string>> = {
 P01:'同心の攻陣',P02:'同心の守陣',P03:'彩陣の武威',P04:'彩陣の守勢',P05:'武の心得',P06:'一閃の心得',P07:'薙ぎの心得',P08:'崩し討ち',P09:'追い討ち',P10:'慈愛の手',P11:'癒しの器',P12:'守護の衣',P13:'返しの刃',P14:'背水の武勇',P15:'万全の守勢',P16:'攻守一体'
};
export function passiveDisplayName(passive: {type?:string;name:string}) {return PASSIVE_NAMES[passive.type??'']??passive.name;}
export const LB_MATERIAL_NAMES = {SKILL_MANUAL:'戦技秘伝書',SKILL_LB_PART:'戦技秘伝書',EQUIP_LB_PART:'武具鍛錬石'} as const;
export const LB_MATERIAL_TYPE = '限界突破素材';
export function approvedMaterialName(id:string):string|undefined{return (LB_MATERIAL_NAMES as Readonly<Record<string,string>>)[id];}
export function approvedMaterialDescription(id:string):string|undefined {return approvedMaterialName(id)?LB_MATERIAL_TYPE+'：'+(id==='EQUIP_LB_PART'?'装備':'スキル')+'の限界突破に使用':undefined;}
/** Legacy server diagnostics only; do not run on user-authored text. */
export function materialDiagnostic(message:string){return message.replaceAll('スキルLB素材',LB_MATERIAL_NAMES.SKILL_MANUAL).replaceAll('装備LB素材',LB_MATERIAL_NAMES.EQUIP_LB_PART);}
