import type { BattleInput, BattleUnit, EnemyUnit, SkillMaster, SkillEffect, TargetRule } from './types.ts';
import type { BattleStatus, BattleUnitState, BattleFrame, BattleAnalysis, BattleResult, BattleOutcome } from './battle.ts';
import { commonBurstChance, commonSpGain, elementMultiplier, splitDisplayDamage } from './battleCommonV1.ts';
export const BALANCE_BATTLE_VERSION = 'balance-v2-20260920';
export const WAVE_SP_INPUT_VERSION = 'wave-sp-v1-20260921';
interface Unit extends BattleUnit {
    hp: number;
    sp: number;
    count: number;
    resetCount: number;
    initialCount: number;
    order: number;
    enemy: boolean;
    actions: number;
    statuses: BattleStatus[];
    phase: string | null;
    phaseIndex: number;
    phases?: EnemyUnit['phases'];
    dead: boolean;
    deaths: number;
    usedDeath: Set<number>;
    immune: boolean;
    passive: {
        atk: number;
        def: number;
    };
    hitSpGain: number;
    pendingSp: number;
    inBlock: boolean;
    revivedAt: number;
}
export function simulateBalanceBattle(input: BattleInput): BattleResult {
    const revisedInput = input.rules.inputVersion === WAVE_SP_INPUT_VERSION;
    if (input.rules.inputVersion !== undefined && !revisedInput) throw new Error('Unsupported battle input version');
    const config = input.rules.balanceV2;
    if (!config || config.status !== 'PREVIEW_PROVISIONAL') throw new Error('Explicit balance v2 configuration required');
    for(const key of ['damageBonusCap','healingBonusCap','shieldBonusCap','shieldHpCap','periodicCapMultiplier','lowHpThreshold','highHpThreshold'] as const) if(!Number.isFinite(config[key])||config[key]<0) throw new Error('Invalid balance v2 config: '+key);
    if(config.diversityFactors.length!==5||config.diversityFactors.some(v=>!Number.isFinite(v)||v<0)) throw new Error('Invalid diversity config');
    if (!input.party.length || input.party.length > 5 || !input.waves.length || input.waves.length > (revisedInput ? 6 : 5) || input.waves.some(w => !w.length || w.length > 3))
        throw new Error('Invalid battle formation');
    if (new Set(input.party.map(u => u.id)).size !== input.party.length)
        throw new Error('Duplicate party member');
    const validateCondition = (c: SkillMaster['condition']) => {
        if (!['always', 'hp_below', 'ally_hp_below', 'every_n_actions', 'enemy_count', 'ally_dead'].includes(c.type)) throw new Error('Unsupported skill condition');
        if (c.value !== undefined && !Number.isFinite(c.value)) throw new Error('Invalid condition value');
        if (['every_n_actions', 'enemy_count'].includes(c.type) && (c.value === undefined || !Number.isInteger(c.value) || c.value < 1)) throw new Error('Invalid condition count');
        if (['hp_below', 'ally_hp_below'].includes(c.type) && c.value !== undefined && (c.value < 0 || c.value > 1)) throw new Error('Invalid HP condition ratio');
    };
    const validateEffect = (e: SkillEffect) => {
        if (!['damage', 'heal', 'revive', 'atk_up', 'def_up', 'atk_down', 'def_down', 'stun', 'dot', 'hot', 'shield', 'taunt', 'counter', 'cleanse'].includes(e.type))
            throw new Error(`Unapproved common-v2 effect: ${e.type}`);
        if(e.type==='cleanse'&&(!['buff','protection','debuff','dot','stun'].includes(e.cleanseCategory??'')||!Number.isInteger(e.power)||e.power<1)) throw new Error('Explicit cleanse category and positive count required');
        if(e.bonusCondition && (!['debuff','dot','hp_below'].includes(e.bonusCondition)||!Number.isFinite(e.bonusPower)||e.bonusPower!<0)) throw new Error('Invalid conditional damage master');
        if(e.hpThreshold!==undefined && (!Number.isFinite(e.hpThreshold)||e.hpThreshold<0||e.hpThreshold>1)) throw new Error('Invalid damage HP threshold');
        if (e.duration !== undefined && (!Number.isInteger(e.duration) || e.duration < 1))
            throw new Error('Invalid effect duration');
        if (e.displayHits !== undefined && (!Number.isInteger(e.displayHits) || e.displayHits < 1 || e.displayHits > 100))
            throw new Error('Invalid display hit count');
        if (!Number.isFinite(e.power) || e.power < 0)
            throw new Error('Invalid effect power');
        if ((e.type === 'heal' || e.type === 'revive') && !['caster_atk_percent', 'target_max_hp_percent'].includes(e.healingFormula ?? ''))
            throw new Error('Explicit provisional healingFormula required');
        if (e.type === 'stun' && e.chance === undefined)
            throw new Error('Explicit provisional stun chance required');
        if (e.chance !== undefined && (!Number.isFinite(e.chance) || e.chance < 0 || e.chance > 1))
            throw new Error('Invalid effect chance');
    };
    for (const u of [...input.party, ...input.waves.flat()]) {
        for (const value of ['hp', 'sp', 'atk', 'def', 'luk'].map(k => u.stats[k as keyof typeof u.stats]))
            if (!Number.isFinite(value) || value < 0)
                throw new Error('Invalid battle stats');
        if (u.stats.hp <= 0)
            throw new Error('Invalid HP');
        for (const p of u.passives) {
            if(p.type&&!/^P(0[1-9]|1[0-6])$/.test(p.type))throw new Error('Unsupported passive type');
            if (p.condition) validateCondition(p.condition);
            if (!Number.isFinite(p.percent) || p.percent < 0)
                throw new Error('Invalid passive strength');
            if (!p.type && !['atk', 'def'].includes(p.stat))
                throw new Error(`Unapproved v2 passive stat: ${p.stat}`);
        }
        for (const s of [...u.skills, ...((u as EnemyUnit).phases ?? []).flatMap(p => p.skills ?? [])]) {
            validateCondition(s.condition);
            if (!Number.isFinite(s.spCost) || s.spCost < 0 || input.waves.flat().includes(u as EnemyUnit) && s.spCost < 1)
                throw new Error('Invalid active skill SP cost');

            s.effects.forEach(validateEffect);
        }
        u.deathEffects?.forEach(validateEffect);
    }
    for (const wave of input.waves) {
        if (new Set(wave.map(u => u.id)).size !== wave.length)
            throw new Error('Duplicate enemy id');
        for (const e of wave) {
            if (revisedInput && (!Number.isFinite(e.initialSp) || e.initialSp! < 0 || e.initialSp! > e.stats.sp))
                throw new Error('Explicit enemy initialSp within stats.sp cap required');
            if (e.initialCount !== undefined && (!Number.isInteger(e.initialCount) || e.initialCount < 1))
                throw new Error('Invalid enemy initial count');
            for (const p of e.phases ?? [])
                if (!Number.isFinite(p.hpBelow) || p.hpBelow < 0 || p.hpBelow > 1 || p.actionCount !== undefined && (!Number.isInteger(p.actionCount) || p.actionCount < 1) || p.maxSp !== undefined && (!Number.isFinite(p.maxSp) || p.maxSp < 0))
                    throw new Error('Invalid phase master');
            if (!Number.isFinite(e.hitSpGain) || e.hitSpGain! < 0 || !Number.isInteger(e.actionCount) || e.actionCount < 1)
                throw new Error('Explicit enemy hitSpGain and positive actionCount required');
        }
    }
    let seed = input.seed >>> 0;
    const random = () => { seed += 0x6D2B79F5; let t = seed; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const make = (u: BattleUnit, enemy: boolean): Unit => { const e = u as EnemyUnit; return { ...u, stats: { ...u.stats }, skills: [...u.skills], hp: u.stats.hp, sp: enemy ? (revisedInput ? e.initialSp! : u.stats.sp) : 0, count: enemy ? e.initialCount ?? e.actionCount : 0, resetCount: e.actionCount, initialCount: e.initialCount ?? e.actionCount, order: e.order ?? 0, enemy, actions: 0, statuses: [], phase: null, phaseIndex: -1, phases: e.phases, dead: false, deaths: 0, usedDeath: new Set(), immune: false, passive: { atk: 0, def: 0 }, hitSpGain: e.hitSpGain ?? 0, pendingSp: 0, inBlock: false, revivedAt: -1 }; };
    const party = input.party.map(u => make(u, false));
    let wave = 0, enemies = input.waves[0].map(u => make(u, true));
    let partySp = 0, gauge = 0, playerActions = 0, serial = 0, totalDamage = 0, wavesCleared = 0, burst = false, ended: 'win' | 'lose' | null = null, reason = '';
    const frames: BattleFrame[] = [];
    const analysis: BattleAnalysis[] = party.map(u => ({ id: u.id, name: u.name, damage: 0, healing: 0, spGenerated: 0, actions: 0, skills: 0, bursts: 0 }));
    const side = (u: Unit) => u.enemy ? enemies : party;
    const opposite = (u: Unit) => u.enemy ? party : enemies;
    const alive = (u: Unit) => u.hp > 0;
    const sum = (u: Unit, type: SkillEffect['type']) => u.statuses.filter(s => s.type === type).reduce((n, s) => n + s.power, 0);
    const stat = (u: Unit, key: 'atk' | 'def') => u.stats[key] * (1 + u.passive[key] / 100) * (1 + Math.min(sum(u, `${key}_up`), key === 'atk' ? 50 : 100) / 100 - Math.min(sum(u, `${key}_down`), key === 'atk' ? 30 : 50) / 100);
    const extraPassives = new WeakMap<Unit, Map<string, number>>();
    const snapshot = (u: Unit): BattleUnitState => ({ id: u.id, hp: u.hp, maxHp: u.stats.hp, sp: u.sp, maxSp: u.stats.sp, count: u.count, actions: u.actions, statuses: u.statuses.map(s => ({ ...s })), phase: u.phase, image: u.image, stunImmune: u.immune, dead: u.dead, effectiveAtk: stat(u, 'atk'), effectiveDef: stat(u, 'def'), skills: u.phase ? u.skills : undefined, passiveEffects: u.passives.map(p => ({id:p.id,type:p.type,percent:p.percent,targetElement:p.targetElement,active:alive(u) && (passiveConditions.get(u)?.get(p.id) ?? false)})) });
    const frame = (kind: BattleFrame['kind'], text: string, u?: Unit, skill?: SkillMaster, extra: Partial<BattleFrame> = {}) => frames.push({ index: frames.length, wave: wave + 1, kind, text, actorId: u?.id, skillId: skill?.id, partySp, maxSp: 400, burst, party: party.map(snapshot), enemies: enemies.map(snapshot), burstGauge: gauge, maxBurstGauge: 200, playerActions, remainingActions: 300 - playerActions, skillStates: Object.fromEntries([...party, ...enemies].map(unit => [unit.id, unit.skills.map(s => ({ skillId: s.id, cost: Math.ceil(s.spCost * (burst && !unit.enemy ? .5 : 1)), status: extra.event === 'action_start' && unit === u && s === skill ? 'active' : !alive(unit) || !usable(unit, s) ? 'condition_unmet' : Math.ceil(s.spCost * (burst && !unit.enemy ? .5 : 1)) > (unit.enemy ? unit.sp : partySp) ? 'insufficient_sp' : 'ready', reason: s.unsupportedReason ?? (!condition(unit,s.condition) ? 'condition_unmet' : !usable(unit,s) ? (s.effects.some(e => ['atk_up','def_up','atk_down','def_down','dot','hot','shield','taunt','counter','stun'].includes(e.type)) && [...party,...enemies].some(t => alive(t) && t.statuses.some(effect => effect.sourceSkillId === s.id)) ? 'reapply_unavailable' : 'condition_unmet') : undefined) }))])), ...extra });
    const condition = (u: Unit, c: SkillMaster['condition']): boolean => { const v = c.value ?? .5; switch (c.type) {
        case 'hp_below': return u.hp / u.stats.hp <= v;
        case 'ally_hp_below': return side(u).some(t => alive(t) && t.hp / t.stats.hp <= v);
        case 'ally_dead': return side(u).some(t => !alive(t));
        case 'enemy_count': return opposite(u).filter(alive).length >= v;
        case 'every_n_actions': return (u.actions + 1) % Math.max(1, v) === 0;
        default: return true;
    } };
    const passiveConditions = new WeakMap<Unit, Map<string, boolean>>();
    const diversitySnapshot = new WeakMap<Unit,number>();
    const targetConditions = new WeakMap<Unit, { debuff: boolean; dot: boolean }>();
    const passives = (reevaluate = true) => {
        if (reevaluate) for (const owner of [...party,...enemies]) {
            const living = side(owner).filter(alive);
            diversitySnapshot.set(owner,config.diversityFactors[Math.min(4,new Set(living.map(t=>t.element)).size-1)]??0);
            const others = new Set(living.filter(t=>t!==owner).map(t=>t.element)).size;
            passiveConditions.set(owner,new Map(owner.passives.map(p=>[p.id,
                (!p.condition || condition(owner,p.condition)) &&
                (p.type !== 'P04' || others >= 2) &&
                (p.type !== 'P14' || owner.hp/owner.stats.hp <= config.lowHpThreshold) &&
                (p.type !== 'P15' || owner.hp/owner.stats.hp >= config.highHpThreshold) &&
                (p.type !== 'P16' || owner.statuses.some(s=>s.type==='atk_up'))
            ])));
            targetConditions.set(owner,{debuff:owner.statuses.some(s=>s.type==='atk_down'||s.type==='def_down'),dot:owner.statuses.some(s=>s.type==='dot')});
        }
        for (const list of [party,enemies]) for (const target of list) {
            const best = new Map<string,{stat:string;percent:number}>();
            for (const owner of list.filter(alive)) for (const p of owner.passives) {
                if (!(passiveConditions.get(owner)?.get(p.id)??false)) continue;
                const type=p.type;
                if (type==='P01'||type==='P02') { if (target.element !== (p.targetElement??owner.element)) continue; }
                else if (type ? owner!==target : p.target!=='party' && owner!==target) continue;
                let percent=p.percent;
                if(type==='P03') percent *= diversitySnapshot.get(owner)??0;
                const key=type==='P01'||type==='P02'?`${type}:${p.targetElement??owner.element}`:type??p.id;
                const stat=type ? ['P01','P03','P14'].includes(type)?'atk':['P02','P04','P15','P16'].includes(type)?'def':type : p.stat;
                if(!best.has(key)||best.get(key)!.percent<percent) best.set(key,{stat,percent});
            }
            target.passive={atk:0,def:0}; const extra=new Map<string,number>();
            for(const p of best.values()) { if(p.stat==='atk'||p.stat==='def') target.passive[p.stat]+=p.percent; else extra.set(p.stat,(extra.get(p.stat)??0)+p.percent); }
            target.passive.atk=Math.min(50,target.passive.atk); target.passive.def=Math.min(50,target.passive.def); extraPassives.set(target,extra);
        }
    };
    const bonus = (u:Unit,key:string) => extraPassives.get(u)?.get(key)??0;
    const category = (s:BattleStatus) => ['atk_up','def_up'].includes(s.type)?'buff':['shield','hot','counter','taunt'].includes(s.type)?'protection':['atk_down','def_down'].includes(s.type)?'debuff':s.type;
    const periodicTotal = (values:number[]) => values.length ? Math.min(values.reduce((a,b)=>a+b,0),Math.max(...values)*config.periodicCapMultiplier):0;
    const periodicAmount = (t:Unit,s:BattleStatus) => (s.amount??0)*(s.type==='hot'?1+Math.min(config.healingBonusCap,(s.healingBonus??0)+bonus(t,'P11'))/100:1);
    let currentActor:Unit|undefined;
    let currentHasDamage=false;
    let applyingSkill = false;
    const applicable = (t: Unit, e: SkillEffect, skillId: string) => {
        if (e.type === 'cleanse') return alive(t) && t.statuses.some(s=>category(s)===e.cleanseCategory);
        if (e.type === 'revive')
            return !alive(t);
        if (!alive(t))
            return false;
        if (e.type === 'stun')
            return !t.immune && !t.statuses.some(s => s.type === 'stun');
        if (['atk_up', 'def_up', 'atk_down', 'def_down'].includes(e.type)) {
            const cap = e.type === 'atk_up' ? 50 : e.type === 'def_up' ? 100 : e.type === 'atk_down' ? 30 : 50;
            return !t.statuses.some(s => s.sourceSkillId === skillId && !(applyingSkill && s.appliedAction === serial && s.type !== e.type)) && sum(t, e.type) < cap;
        }
        if (['dot','hot','shield','taunt','counter'].includes(e.type)) {
            if(t.statuses.some(s=>s.sourceSkillId===skillId && !(applyingSkill && s.appliedAction===serial && s.type!==e.type))) return false;
            if(e.type==='shield') return t.statuses.filter(s=>s.type==='shield').reduce((a,s)=>a+(s.amount??0),0)<t.stats.hp*config.shieldHpCap;
            if((e.type==='dot'||e.type==='hot')&&currentActor&&!currentHasDamage) {
                const values=t.statuses.filter(s=>s.type===e.type).map(s=>periodicAmount(t,s));
                const amount=stat(currentActor,'atk')*e.power/100*(e.type==='hot'?1+Math.min(config.healingBonusCap,bonus(currentActor,'P10')+bonus(t,'P11'))/100:1);
                return periodicTotal([...values,amount])>periodicTotal(values);
            }
        }
        return true;
    };
    const select = (u: Unit, target: TargetRule, candidates?: Unit[], preview = false): Unit[] => {
        let list = candidates ?? (['self', 'lowest_ally', 'all_allies', 'dead_ally','first_ally','highest_atk_ally','counter_ally','dot_ally'].includes(target) ? side(u) : opposite(u)).filter(t => target === 'dead_ally' ? !alive(t) : alive(t));
        if (target === 'self')
            return list.includes(u) ? [u] : [];
        if (target === 'all_allies' || target === 'all_enemies')
            return list;
        if (target === 'last') list=[...list].reverse();
        if (target === 'highest_atk_ally') list=[...list].sort((a,b)=>b.stats.atk-a.stats.atk);
        if (target === 'highest_atk_enemy') list=[...list].sort((a,b)=>stat(b,'atk')-stat(a,'atk'));
        if (target === 'counter_ally') list=[...list].sort((a,b)=>Number(b.statuses.some(s=>s.type==='taunt'))-Number(a.statuses.some(s=>s.type==='taunt')));
        if (target === 'dot_ally') list=[...list].sort((a,b)=>Number(b.statuses.some(s=>s.type==='dot'))-Number(a.statuses.some(s=>s.type==='dot')));
        if (target === 'lowest_hp')
            list = [...list].sort((a, b) => a.hp - b.hp);
        if (target === 'highest_hp')
            list = [...list].sort((a, b) => b.hp - a.hp);
        if (target === 'lowest_ally' || target === 'lowest_hp_ratio')
            list = [...list].sort((a, b) => a.hp / a.stats.hp - b.hp / b.stats.hp);
        if (target === 'highest_hp_ratio')
            list = [...list].sort((a, b) => b.hp / b.stats.hp - a.hp / a.stats.hp);
        if (target === 'random' && list.length && !preview)
            return [list[Math.floor(random() * list.length)]];
        return list.slice(0, 1);
    };
    const effectTargets = (u: Unit, skill: SkillMaster, e: SkillEffect, selected?: Unit[], preview = false) => {
        currentActor=u;currentHasDamage=skill.effects.some(e=>e.type==='damage');
        const rule = e.target && e.target !== 'selected' ? e.target : skill.target;
        if(rule==='dot_ally' && (!selected || e.target && e.target!=='selected')) {
            const poison=side(u).filter(t=>alive(t)&&t.statuses.some(s=>s.type==='dot'));
            if(poison.length)return poison.slice(0,1);
            return select(u,'lowest_ally',side(u).filter(t=>alive(t)&&t.hp/t.stats.hp<=.5),preview);
        }
        if (e.type === 'heal') {
            if (selected && (!e.target || e.target === 'selected'))
                return selected.filter(alive);
            const living = side(u).filter(alive);
            if (rule === 'self')
                return alive(u) ? [u] : [];
            if (rule === 'all_allies')
                return living.filter(t => t.hp / t.stats.hp <= .6).length >= Math.ceil(living.length / 2) ? living : [];
            return select(u, 'lowest_ally', living.filter(t => t.hp / t.stats.hp <= .5), preview);
        }
        if (selected && (!e.target || e.target === 'selected'))
            return selected.filter(t => applicable(t, e, skill.id));
        if (e.type==='damage' && rule==='first' && !skill.fixedTarget) { const taunting=opposite(u).filter(t=>alive(t)&&t.statuses.some(s=>s.type==='taunt')); if(taunting.length) return taunting.slice(0,1); }
        const all = ['self', 'lowest_ally', 'all_allies', 'dead_ally','first_ally','highest_atk_ally','counter_ally','dot_ally'].includes(rule) ? side(u) : opposite(u);
        if(e.type==='hot' && rule==='all_allies' && !all.some(t=>t.hp<t.stats.hp && applicable(t,e,skill.id))) return [];
        if(e.type==='hot' && rule==='lowest_ally') return select(u,rule,all.filter(t=>t.hp<t.stats.hp && applicable(t,e,skill.id)),preview);
        return select(u, rule, all.filter(t => applicable(t, e, skill.id)), preview);
    };
    const usable = (u: Unit, s: SkillMaster) => !s.unsupportedReason && condition(u, s.condition) && s.effects.some(e => effectTargets(u, s, e, undefined, true).length > 0);
    const choose = (u: Unit, discount = 1) => u.skills.find(s => usable(u, s) && Math.ceil(s.spCost * discount) <= (u.enemy ? u.sp : partySp));
    const basic = (u: Unit): SkillMaster => ({ id: 'basic', name: '通常攻撃', image: '', rarity: 'N', element: u.element, spCost: 0, condition: { type: 'always' }, target: 'first', effects: [{ type: 'damage', power: 100 }], description: '' });
    let hitThisAction = new Set<Unit>();
    let directTargets = new Map<Unit,number>();
    let effectSequence = 0;
    let isCounter = false;
    const absorb = (t:Unit, amount:number, u:Unit, skill?:SkillMaster) => {
        let remaining=amount;
        const shields=t.statuses.filter(s=>s.type==='shield').sort((a,b)=>a.remaining-b.remaining||(a.sequence??0)-(b.sequence??0));
        for(const shield of shields) {const used=Math.min(remaining,shield.amount??0); shield.amount=(shield.amount??0)-used; remaining-=used; if(!remaining) break;}
        t.statuses=t.statuses.filter(s=>s.type!=='shield'||(s.amount??0)>0);
        if(remaining<amount) frame('action',`${t.name} シールド吸収 ${amount-remaining}`,u,skill,{event:'shield_absorbed',targetIds:[t.id]});
        t.hp=Math.max(0,t.hp-remaining); return remaining;
    };
    const damageBonus = (u:Unit,t:Unit,skill:SkillMaster) => {
        let value=isCounter?bonus(u,'P13'):skill.id==='basic'?bonus(u,'P05'):bonus(u,skill.target==='all_enemies'?'P07':'P06');
        if(targetConditions.get(t)?.debuff) value+=bonus(u,'P08');
        if(targetConditions.get(t)?.dot) value+=bonus(u,'P09');
        return Math.min(config.damageBonusCap,value);
    };
    const applyEffect = (u: Unit, targets: Unit[], e: SkillEffect, skill: SkillMaster) => {
        currentActor=u;currentHasDamage=skill.effects.some(e=>e.type==='damage');
        const plans = targets.filter(t => applicable(t, e, skill.id)).map(t => {
            const success = e.chance === undefined || random() < e.chance;
            let power=e.power;
            if(e.bonusCondition && ((e.bonusCondition==='debuff'&&t.statuses.some(s=>s.type==='atk_down'||s.type==='def_down')) || (e.bonusCondition==='dot'&&t.statuses.some(s=>s.type==='dot')) || (e.bonusCondition==='hp_below'&&u.hp/u.stats.hp<=(e.hpThreshold??config.lowHpThreshold)))) power=e.bonusPower??power;
            const amount = e.type==='damage' ? Math.max(1,Math.floor((stat(u,'atk')*power/100-stat(t,'def'))*elementMultiplier(skill.element,t.element,{...input.rules,advantageMultiplier:1.5,disadvantageMultiplier:.75})*(.9+random()*.2)*(1+damageBonus(u,t,skill)/100)))
                : e.type==='heal' ? Math.max(0,Math.floor((e.healingFormula==='target_max_hp_percent'?t.stats.hp:stat(u,'atk'))*power/100*(1+Math.min(config.healingBonusCap,bonus(u,'P10')+bonus(t,'P11'))/100)))
                : e.type==='revive' ? Math.max(1,Math.floor(t.stats.hp*power/100))
                : e.type==='shield' ? Math.max(0,Math.floor(stat(u,'atk')*power/100*(1+Math.min(config.shieldBonusCap,bonus(u,'P12'))/100)))
                : e.type==='dot'||e.type==='hot' ? stat(u,'atk')*power/100 : power;
            return {t,success,amount};
        });
        for(const {t,success,amount} of plans) {
            if(!success) {frame('action',`${t.name}：${e.type} 不成立`,u,skill,{event:'effect_miss',targetIds:[t.id]});continue;}
            if(e.type==='damage') {
                const hpDamage=absorb(t,amount,u,skill);
                if(!u.enemy&&t.enemy) {totalDamage+=hpDamage; const a=analysis.find(a=>a.id===u.id);if(a)a.damage+=hpDamage;}
                if(!isCounter&&!skill.id.startsWith('death:')) directTargets.set(t,t.deaths);
                if(t.enemy&&!hitThisAction.has(t)&&!skill.id.startsWith('death:')) {hitThisAction.add(t);if(t.inBlock)t.pendingSp+=t.hitSpGain;else t.sp=Math.min(t.stats.sp,t.sp+t.hitSpGain);}
                frame(u.enemy?'enemy':'action',`${t.name} −${hpDamage}`,u,skill,{event:isCounter?'counter':'damage',targetIds:[t.id],hits:splitDisplayDamage(hpDamage,e.displayHits??1)});
            } else if(e.type==='heal'||e.type==='revive') {
                const actual=Math.min(t.stats.hp-t.hp,amount);t.hp+=actual;
                if(e.type==='revive'&&t.hp>0){t.dead=false;if(t.enemy){t.sp=0;t.pendingSp=0;t.count=t.initialCount;t.revivedAt=serial;}}
                const a=analysis.find(a=>a.id===u.id);if(a)a.healing+=actual;
                frame('action',`${t.name} ${e.type==='revive'?'蘇生':'回復'} +${actual}`,u,skill,{event:e.type,targetIds:[t.id]});
            } else if(e.type==='cleanse') {
                const candidates=t.statuses.filter(s=>category(s)===e.cleanseCategory).sort((a,b)=>(b.appliedAction??0)-(a.appliedAction??0)||(a.sequence??0)-(b.sequence??0)).slice(0,Math.floor(e.power));
                t.statuses=t.statuses.filter(s=>!candidates.includes(s));if(candidates.some(s=>s.type==='stun'))t.immune=true;
                frame('action',`${t.name} ${e.cleanseCategory} ${candidates.length}件解除`,u,skill,{event:'cleanse',targetIds:[t.id],reason:e.cleanseCategory});
            } else {
                const stored=e.type==='shield'?Math.min(amount,Math.max(0,t.stats.hp*config.shieldHpCap-t.statuses.filter(s=>s.type==='shield').reduce((n,s)=>n+(s.amount??0),0))):amount;
                if(e.type==='shield'&&stored<=0)continue;
                t.statuses.push({type:e.type,power:e.power,remaining:e.type==='stun'?1:e.duration??3,carry:true,sourceId:u.id,sourceEnemy:u.enemy,sourceSkillId:skill.id,appliedAction:serial,amount:['dot','hot','shield'].includes(e.type)?stored:undefined,healingBonus:e.type==='hot'?bonus(u,'P10'):undefined,sequence:effectSequence++});
                frame('action',`${t.name}：${e.type} 付与`,u,skill,{event:'effect_applied',targetIds:[t.id]});
            }
        }
    };
    const deaths = (attacker: Unit) => {
        const queue: {
            u: Unit;
            effect: SkillEffect;
            index: number;
        }[] = [];
        const collect = (cause = attacker) => {
            for (const u of [...side(cause), ...opposite(cause)])
                if (u.hp <= 0 && !u.dead) {
                    u.dead = true;
                    u.deaths++;
                    u.statuses = [];
                    u.immune = false;
                    u.sp = 0;
                    u.pendingSp = 0;
                    u.count = 0;
                    frame('action', `${u.name} 戦闘不能`, u, undefined, { event: 'death' });
                    for (let index = 0; index < (u.deathEffects?.length ?? 0); index++)
                        if (!u.usedDeath.has(index)) {
                            u.usedDeath.add(index);
                            queue.push({ u, effect: u.deathEffects![index], index });
                        }
                }
        };
        collect();
        passives(false);
        while (queue.length) {
            const { u, effect, index } = queue.shift()!;
            const s = { ...basic(u), id: `death:${u.id}:${index}`, effects: [effect] };
            const targets = effect.target ? effectTargets(u, { ...s, target: effect.target === 'selected' ? 'first' : effect.target }, effect) : effect.type === 'revive' ? [u] : ['damage', 'atk_down', 'def_down', 'stun'].includes(effect.type) ? opposite(u) : side(u);
            applyEffect(u, targets, effect, s);
            collect(u);
            passives(false);
        }
    };
    const check = () => { if (!party.some(alive)) {
        ended = 'lose';
        reason = enemies.some(alive) ? 'party_defeated' : 'mutual_annihilation';
    }
    else if (!enemies.some(alive) && wave === input.waves.length - 1) {
        ended = 'win';
        reason = 'final_wave_defeated';
    } };
    const phases = () => { for (const u of enemies.filter(alive)) {
        const next = u.phaseIndex + 1, p = u.phases?.[next];
        if (p && u.hp / u.stats.hp <= p.hpBelow) {
            u.phaseIndex = next;
            u.phase = p.name;
            if (p.image)
                u.image = p.image;
            if (p.skills)
                u.skills = [...p.skills];
            if (p.actionCount !== undefined)
                u.resetCount = p.actionCount;
            if (p.maxSp !== undefined) {
                u.stats.sp = p.maxSp;
                u.sp = Math.min(u.sp, p.maxSp);
            }
            frame('phase', `${u.name}：${p.name}`, u, undefined, { event: 'phase' });
        }
    } };
    const act = (u: Unit, skill: SkillMaster, discount: number) => {
        serial++;
        if (serial > 100000)
            throw new Error('Battle execution safety guard exceeded');
        if (!u.enemy)
            playerActions++;
        const beforeSp = partySp, beforeGauge = gauge;
        const cost = Math.ceil(skill.spCost * discount);
        if (u.enemy)
            u.sp -= cost;
        else
            partySp -= cost;
        frame(u.enemy ? 'enemy' : 'action', `${u.name} · ${skill.name} SP −${cost}`, u, skill, { event: 'action_start' });
        // Lock the selected target group once; per-effect overrides retain their own group.
        const main = skill.effects.find(e => (!e.target || e.target === 'selected') && effectTargets(u, skill, e, undefined, true).length > 0);
        const selected = skill.target==='all_allies' ? side(u).filter(alive) : skill.target==='all_enemies' ? opposite(u).filter(alive) : main ? effectTargets(u, skill, main) : undefined;
        hitThisAction=new Set(); directTargets=new Map();
        applyingSkill = true;
        for (const e of skill.effects)
            applyEffect(u, effectTargets(u, skill, e, selected), e, skill);
        applyingSkill = false;
        deaths(u);
        const attacked=[...opposite(u)].filter(t=>directTargets.has(t));
        for(const t of attacked) {
            if(!alive(u)||!alive(t)||t.deaths!==directTargets.get(t)||stunned(t))continue;
            const counter=t.statuses.filter(s=>s.type==='counter').sort((a,b)=>b.power-a.power)[0];
            if(!counter)continue;
            isCounter=true;hitThisAction=new Set();
            const skillCounter={...basic(t),id:`counter:${counter.sourceSkillId}`,name:'反撃',effects:[{type:'damage' as const,power:counter.power}]};
            applyEffect(t,[u],skillCounter.effects[0],skillCounter); isCounter=false; deaths(t);
        }
        if(alive(u)) {
            const effects=u.statuses.filter(s=>s.type==='dot'&&s.appliedAction!==serial);
            if(effects.length) {
                const amount=Math.floor(periodicTotal(effects.map(s=>periodicAmount(u,s))));
                const hpDamage=absorb(u,amount,u,skill);
                if(u.enemy){totalDamage+=hpDamage;}
                frame('action',`${u.name} 継続ダメージ −${hpDamage}`,u,skill,{event:'dot',targetIds:[u.id]});deaths(u);
            }
        }
        if(alive(u)) {
            // Read current statuses after death/revival; never replay a removed queued HOT.
            const effects=u.statuses.filter(s=>s.type==='hot'&&s.appliedAction!==serial);
            if(effects.length) {
                const amount=Math.min(u.stats.hp-u.hp,Math.floor(periodicTotal(effects.map(s=>periodicAmount(u,s)))));u.hp+=amount;
                frame('action',`${u.name} 継続回復 +${amount}`,u,skill,{event:'hot',targetIds:[u.id]});
            }
        }
        u.actions++;
        for (const s of u.statuses)
            if (s.type !== 'stun' && s.appliedAction !== serial)
                s.remaining--;
        for (const s of u.statuses.filter(s => s.remaining <= 0))
            frame('action', `${u.name}：${s.type} 終了`, u, skill, { event: 'effect_expired' });
        u.statuses = u.statuses.filter(s => s.remaining > 0);
        u.immune = false;
        if (!u.enemy) {
            const a = analysis.find(a => a.id === u.id)!;
            a.actions++;
            a.skills += Number(skill.id !== 'basic');
            if (!burst) {
                const gain = commonSpGain(u.stats.luk, skill.id === 'basic');
                partySp = Math.min(400, partySp + gain);
                gauge = Math.min(200, gauge + gain);
                a.spGenerated += gain;
            }
        }
        passives();
        check();
        if(!ended && playerActions>=300) {ended='lose';reason='action_limit';}
        if(!ended && enemies.some(alive)) phases();
        frame(u.enemy ? 'enemy' : 'action', `${u.name} 行動完了`, u, skill, { event: 'action_end', spDelta: partySp - beforeSp, gaugeDelta: gauge - beforeGauge });
    };
    const stunned = (u: Unit) => u.statuses.some(s => s.type === 'stun');
    const skip = (u: Unit) => { serial++; if (!u.enemy)
        playerActions++; u.statuses = u.statuses.filter(s => s.type !== 'stun'); u.immune = true; frame(u.enemy ? 'enemy' : 'action', `${u.name} 行動不能：スキップ・再付与耐性`, u, undefined, { event: 'stun_skip' }); };
    const interrupts = () => {
        for (const e of enemies.filter(alive))
            if (e.revivedAt !== serial)
                e.count--;
        frame('enemy', '敵の行動カウント更新', undefined, undefined, { event: 'counts' });
        const due = enemies.filter(e => alive(e) && e.count <= 0).sort((a, b) => a.order - b.order).map(e => ({ e, deaths: e.deaths }));
        for (const entry of due) {
            const u = entry.e;
            if (!alive(u) || u.deaths !== entry.deaths || ended || !enemies.some(alive))
                continue;
            frame('enemy', `${u.name} 割込み`, u, undefined, { event: 'interrupt_start' });
            if (stunned(u))
                skip(u);
            else {
                u.inBlock = true;
                const blockDeaths = u.deaths;
                let skill = choose(u);
                if (!skill)
                    act(u, basic(u), 1);
                while (skill && alive(u) && u.deaths === blockDeaths && !ended && enemies.some(alive)) {
                    if (stunned(u)) {
                        skip(u);
                        break;
                    }
                    act(u, skill, 1);
                    if (!alive(u) || ended || stunned(u)) {
                        if (alive(u) && stunned(u) && !ended)
                            skip(u);
                        break;
                    }
                    skill = choose(u);
                }
                u.inBlock = false;
                if (alive(u))
                    u.sp = Math.min(u.stats.sp, u.sp + u.pendingSp);
                u.pendingSp = 0;
            }
            if (alive(u) && u.revivedAt !== serial)
                u.count = u.resetCount;
            frame('enemy', `${u.name} 割込み終了`, u, undefined, { event: 'interrupt_end' });
        }
    };
    passives();
    frame('start', '合戦開始：共通SP 0/400・バーストゲージ 0/200', undefined, undefined, { event: 'start' });
    let cursor = 0;
    while (!ended) {
        const u = party[cursor % party.length];
        cursor++;
        if (!alive(u))
            continue;
        let skipped = false;
        if (stunned(u)) {
            skip(u);
            skipped = true;
        }
        else {
            if (gauge >= 200) {
                gauge = 0;
                burst = random() < commonBurstChance(u.stats.luk);
                if (burst)
                    analysis.find(a => a.id === u.id)!.bursts++;
                frame('burst', burst ? `${u.name} BURST：最大5行動` : `${u.name} BURST抽選失敗`, u, undefined, { event: burst ? 'burst_start' : 'burst_failed' });
            }
            const deathCount = u.deaths, count = burst ? 5 : 1;
            for (let n = 0; n < count; n++) {
                if (stunned(u)) {
                    skip(u);
                    skipped = true;
                    frame('burst', '行動不能でBURST中断', u, undefined, { event: 'burst_interrupted' });
                    break;
                }
                act(u, choose(u, burst ? .5 : 1) ?? basic(u), burst ? .5 : 1);
                if (ended || !enemies.some(alive) || playerActions >= 300)
                    break;
                interrupts();
                if (ended || !alive(u) || u.deaths !== deathCount || !enemies.some(alive))
                    break;
                if (burst && n < count - 1)
                    frame('burst', `${u.name} BURST再開`, u, undefined, { event: 'burst_resume' });
            }
        }
        if (burst) {
            burst = false;
            frame('burst', 'BURST終了', u, undefined, { event: 'burst_end' });
        }
        check();
        if (!ended && playerActions >= 300) {
            ended = 'lose';
            reason = 'action_limit';
        }
        if (ended)
            break;
        if (!enemies.some(alive)) {
            wavesCleared++;
            wave++;
            enemies = input.waves[wave].map(u => make(u, true));
            passives();
            frame('wave', `WAVE ${wave + 1}：HP・SP・ゲージ・状態を引継ぎ`, undefined, undefined, { event: 'wave' });
        }
        // An initial or BURST stun skip still advances enemy counts once.
        else if (skipped)
            interrupts();
    }
    if (!enemies.some(alive))
        wavesCleared++;
    frame('end', (ended as BattleOutcome | null) === 'win' ? '勝利' : reason === 'action_limit' ? '300行動上限：敗北' : '敗北', undefined, undefined, { event: 'end', reason });
    return { seed: input.seed, outcome: ended!, totalDamage, playerActions, wavesCleared, party: input.party, waves: input.waves, frames, analysis, rulesVersion: BALANCE_BATTLE_VERSION, ...(revisedInput ? { inputVersion: WAVE_SP_INPUT_VERSION, masterVersion: config.version } : {}), reason };
}

