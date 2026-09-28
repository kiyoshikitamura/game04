/** TEST_ONLY: intentionally artificial values, never production/balance masters. */
export const rules = { version:'common-v2-20260920', advantageMultiplier:1.5, disadvantageMultiplier:.75, spRecoveryDivisor:200, burstLukDivisor:100, enemySpRecoveryDivisor:10, maxPlayerActions:300, initialSpRatio:0, defenseFactor:1 };
export const skill = (id, spCost=1, extra={}) => ({id,name:id,image:'',rarity:'N',element:'fire',spCost,condition:{type:'always'},target:'first',effects:[{type:'damage',power:100}],description:'TEST_ONLY / 未承認の検証用',...extra});
export const unit = (id, extra={}) => ({id,name:id,image:'',level:1,element:'fire',stats:{hp:100000,sp:1,atk:100,def:0,luk:0},skills:[],passives:[],...extra});
export const enemy = (id='e', extra={}) => unit(id,{actionCount:10000,initialCount:10000,order:0,hitSpGain:0,...extra});
export const input = (extra={}) => ({seed:42,party:Array.from({length:5},(_,i)=>unit(`p${i}`)),waves:[[enemy()]],rules:{...rules},...extra});
export const actions = result => result.frames.filter(f=>f.kind==='action' && f.event==='action_end');
export const enemyActions = result => result.frames.filter(f=>f.kind==='enemy' && f.event==='action_end');
