import fs from 'node:fs';
import{simulateBalanceBattle}from './battleBalanceV2.ts';import{rules,unit,skill}from './model.mjs';
const read=p=>JSON.parse(fs.readFileSync(p)),copy=structuredClone;
const ledger=read('outputs/GAME04_62面_一括監査判定台帳.json').ledger.filter(x=>x.disposition==='修正方針の判断必要'),base=read('battle-check/round16-results.json').results,fx=read('outputs/GAME04_ACCEPTANCE_FIXTURES_V1.json').fixtures;
const eq=read('battle-check/formal-loadout10.json').equipment;
const round=(v)=>Math.max(1,Math.round(v/10)*10),mean=(r,k)=>r.reduce((s,x)=>s+x[k],0)/r.length;
function swap(p,i,name){const old=p[i],aw=Math.max(0,Math.ceil((old.level-50)/10)),b=unit(old.name,old.level,aw),u=unit(name,old.level,aw);for(const k of ['hp','atk','def','luk'])u.stats[k]+=old.stats[k]-b.stats[k];u.skills=copy(old.skills);p[i]=u;}
function evaluate(party,waves,start,n){const runs=[];for(let seed=start;seed<start+n;seed++){const r=simulateBalanceBattle({rules,seed,party,waves}),l=r.frames.at(-1);let casts={},enemyCasts={},effects={},skips=0,enemySkips=0;for(const f of r.frames){const ally=party.some(p=>p.id===f.actorId);if(f.event==='action_start'){const d=ally?casts:enemyCasts;d[f.skillId]=(d[f.skillId]??0)+1;}if(ally&&['cleanse','effect_applied','heal','counter','shield_absorbed','revive'].includes(f.event))effects[f.skillId+':'+f.event]=(effects[f.skillId+':'+f.event]??0)+1;if(f.event==='stun_skip'){if(ally)skips++;else enemySkips++;}}runs.push({seed,win:r.outcome==='win',actions:r.playerActions,hp:l.party.reduce((s,u)=>s+u.hp,0)/l.party.reduce((s,u)=>s+u.maxHp,0),alive:l.party.filter(u=>u.hp>0&&!u.dead).length,skips,enemySkips,casts,enemyCasts,effects});}return runs;}
const sum=r=>({wins:r.filter(x=>x.win).length,n:r.length,actions:mean(r,'actions'),hp:mean(r,'hp'),alive:mean(r,'alive'),skips:mean(r,'skips')});
function design(b,t){const id=b.id,area=+id.split('-')[0],f=fx.find(x=>x.id===b.fixture),lb=f.members[0].skills[0]?.lb??0,p=copy(b.cases[0].party),w=copy(b.waves);let focus=copy(b.focus),notes=[];
 const set=(i,ids)=>p[i].skills=ids.map(x=>skill(x.startsWith('SKD')?x:'SKD'+x,lb));
 if(id==='1-3'){set(0,['003']);set(1,['007']);}
 if(id==='2-1'){set(1,['008']);set(4,[]);focus=['SKD008'];notes.push('前後に火力を分散せず先頭へ集中する比較');}
 if(['2-2','8-3','9-2'].includes(id)){const i=p.findIndex(u=>u.skills.some(s=>s.id==='SKD022'));set(i,['022']);for(let j=0;j<p.length;j++)if(j!==i)p[j].skills=p[j].skills.filter(s=>!s.effects.some(e=>e.type==='damage'));notes.push('全体攻撃と単体攻撃の比較から別攻撃枠のSP競合を除く');}
 if(['2-3','9-3','10-1'].includes(id)){for(const u of p)u.skills=u.skills.filter(s=>s.id!=='SKD034');}
 if(['3-1','3-2','3-5','9-4'].includes(id)){for(const u of p)u.skills=u.skills.filter(s=>s.id!=='SKD034');if(['3-2','3-5','9-4'].includes(id)){for(const u of p)u.skills=u.skills.filter(s=>!s.effects.some(e=>e.type==='damage'));focus=['SKD035'];}notes.push('支援後の通常攻撃へSPを残す検証編成');}
 if(['3-3','6-5'].includes(id)){for(const u of p)u.skills=u.skills.filter(s=>s.id!=='SKD034');focus=['SKD029','SKD030'];}
 if(['4-1','4-4'].includes(id)){for(const u of p)u.skills=u.skills.filter(s=>!['SKD034','SKD008'].includes(s.id));if(id==='4-4')focus=['SKD045'];}
 if(['4-2','9-7'].includes(id)){const i=id==='4-2'?1:3;[p[0],p[i]]=[p[i],p[0]];for(const u of p)u.skills=u.skills.filter(s=>!['SKD049','SKD036','SKD034'].includes(s.id));set(0,['049']);focus=['SKD049'];notes.push('攻撃力のある受け役へ反撃を配置');}
 if(['4-3','4-5'].includes(id)){let h=p.findIndex(u=>u.skills.some(s=>s.id==='SKD041'));let last=p.length-1;[p[h].skills,p[last].skills]=[p[last].skills,p[h].skills];for(const u of p)u.skills=u.skills.filter(s=>!['SKD036','SKD049'].includes(s.id));}
 if(id==='5-2'){swap(p,p.findIndex(u=>u.name==='上杉謙信'),'徳川家康');swap(p,p.findIndex(u=>u.name==='雑賀孫市'),'柴田勝家');focus=['SKD036'];notes.push('土主体3人の実在編成。完全単色5人は前提にしない');}
 if(['6-1','6-2'].includes(id)){for(const u of p)u.skills=u.skills.filter(s=>!['SKD034','SKD008'].includes(s.id));if(id==='6-2'){[p[0],p[1]]=[p[1],p[0]];}notes.push('解除の対象と実際の受け役を合わせ、攻撃スキルとのSP競合を軽減');}
 if(id==='6-4'){for(const u of p)u.skills=u.skills.filter(s=>!['SKD045','SKD008'].includes(s.id));}
 if(id==='6-6'){for(const u of p)u.skills=u.skills.filter(s=>!['SKD053','SKD055','SKD008'].includes(s.id));focus=['SKD070'];notes.push('3対策必須を避けてDOT対策1枚を主軸にする');}
 if(id==='7-1'){for(const u of p)u.skills=u.skills.filter(s=>!['SKD034','SKD008'].includes(s.id));}
 if(['7-6','7-7','7-8'].includes(id)){for(const u of p)u.skills=u.skills.filter(s=>!['SKD034','SKD008'].includes(s.id));if(id==='7-7'){for(const u of p)u.skills=u.skills.map(s=>s.id==='SKD051'?skill('SKD052',lb):s);focus=['SKD052'];notes.push('盾解除は破護052に訂正');}}
 if(['8-1','8-5','8-7','8-8','9-10'].includes(id)){for(const u of p)u.skills=u.skills.filter(s=>!['SKD034','SKD008'].includes(s.id));}
 if(id==='8-4'){for(const u of p)u.skills=u.skills.filter(s=>!['SKD034','SKD008'].includes(s.id));}
 if(id==='8-2'){for(const u of p)u.skills=u.skills.filter(s=>s.id!=='SKD034');}
 if(id==='9-1'){for(const u of p)u.skills=u.skills.filter(s=>!['SKD034','SKD038'].includes(s.id));}
 if(id==='9-9'){for(const u of p)u.skills=u.skills.filter(s=>!['SKD034','SKD008'].includes(s.id));set(1,['055']);focus=['SKD032','SKD055'];}
 const maxAtk=Math.max(...p.map(u=>u.stats.atk)),avgAtk=p.reduce((s,u)=>s+u.stats.atk,0)/p.length,front=p[0],avgHp=p.reduce((s,u)=>s+u.stats.hp,0)/p.length,avgDef=p.reduce((s,u)=>s+u.stats.def,0)/p.length;
 const M=t===0?0:[0,.65,1,1.35,1.7][t],pressure=(e,ratio=.12)=>{e.stats.atk=round(avgDef+avgHp*ratio*M);},setup=(e,ids,count=3,reset=7)=>{e.skills=ids.map(s=>skill(s,lb));e.initialCount=count;e.actionCount=reset;e.initialSp=Math.max(...e.skills.map(s=>s.spCost));e.stats.sp=Math.max(e.stats.sp,e.initialSp);};
 if(t>0){
  if(id==='1-3'){const e=w.at(-1)[0];e.stats.hp=round(e.stats.hp*(1+.25*M));e.initialCount=4;e.actionCount=6;pressure(e,.08);}
  if(id==='2-1'){for(const wave of w){wave[0].stats.hp=round(maxAtk*(1.2+.25*M));wave[0].initialCount=4;wave[0].actionCount=5;pressure(wave[0],.13);if(wave[1])wave[1].stats.hp=round(wave[1].stats.hp*(1+.25*M));}}
  if(['2-2','8-3','9-2'].includes(id)){for(const wave of w)if(wave.length>=3){for(const e of wave){e.stats.def=round(avgAtk*.03);e.stats.hp=round(maxAtk*(1.8+M));e.initialCount=6;e.actionCount=6;pressure(e,.08);}}}
  if(['2-3','9-3','10-1'].includes(id)){for(const wave of w)if(wave.length>=2){const frontE=wave[0],rear=wave.at(-1);frontE.stats.def=round(maxAtk*(.5+.25*M));frontE.stats.hp=round(maxAtk*(5+2*M));rear.stats.hp=round(maxAtk*(1.4+.4*M));rear.stats.atk=round(avgAtk*(1.2+M));setup(rear,[rear.skills.some(s=>s.effects.some(e=>e.type==='shield'))?'SKD046':'SKD040'],3,5);rear.initialSp=180;rear.stats.sp=Math.max(rear.stats.sp,180);}}
  if(['3-1','3-2','3-5','9-4'].includes(id)){for(const wave of w){const e=wave[0];e.stats.def=round(maxAtk*(.65+.27*M));e.stats.hp=round(maxAtk*(4+M*2));e.initialCount=6;e.actionCount=7;pressure(e,.045);}}
  if(['3-3','6-5'].includes(id)){const e=w.at(-1)[0];e.stats.def=round(maxAtk*(1+.25*M));e.stats.hp=round(maxAtk*(2+.7*M));e.initialCount=3;e.actionCount=3;pressure(e,.055);}
  if(id==='4-1'){for(const wave of w){const e=wave[0];e.stats.hp=round(e.stats.hp*(1+.25*M));e.stats.atk=round(front.stats.def+front.stats.hp*.12*M);e.initialCount=5;e.actionCount=4;}}
  if(['4-2','9-7'].includes(id)){for(const wave of w)for(const e of wave){e.stats.def=round(avgAtk*.03);e.stats.hp=round(e.stats.hp*(1+.3*M));e.skills=[];e.initialSp=0;e.initialCount=3;e.actionCount=3; e.stats.atk=round(front.stats.def*.75+front.stats.hp*.028*M);}}
  if(['4-3','4-5'].includes(id)){for(const wave of w){const e=wave[0];e.stats.hp=round(e.stats.hp*(.8+.4*M));pressure(e,.23);setup(e,['SKD022'],5,6);e.initialSp=75;e.stats.sp=100;}}
  if(id==='4-4'){const e=w.at(-1)[0];e.stats.hp=round(maxAtk*(4+M));e.stats.atk=round(front.stats.def+front.stats.hp*.22*M);e.initialCount=8;e.actionCount=8;}
  if(id==='5-2'){for(const wave of w)for(const e of wave){pressure(e,.1);e.stats.hp=round(e.stats.hp*(1+.2*M));}}
  if(id==='5-5'){for(const wave of w){const e=wave[0];pressure(e,.14);e.initialCount=4;e.actionCount=5;}}
  if(['6-1','6-6'].includes(id)){for(const wave of w){const e=wave.find(e=>e.skills.some(s=>s.effects.some(e=>e.type==='dot')));if(e){setup(e,['SKD058'],4,9);e.stats.atk=round(avgHp*(.32+.15*M));e.stats.hp=round(e.stats.hp*(1+.3*M));}}}
  if(id==='6-2'){for(const wave of w){const e=wave[0];e.stats.hp=round(e.stats.hp*(1+.3*M));e.stats.atk=round(front.stats.def+front.stats.hp*.09*M);setup(e,['SKD038','SKD007'],3,7);e.initialSp=100;e.stats.sp=Math.max(e.stats.sp,100);}}
  if(id==='6-4'){for(const wave of w){const e=wave[0];e.stats.hp=round(e.stats.hp*(1+.1*M));e.stats.atk=round(front.stats.def+front.stats.hp*.2*M);e.initialCount=6;e.actionCount=9;}}
  if(id==='7-1'){for(const wave of w){const e=wave[0];setup(e,['SKD033','SKD007'],3,8);e.initialSp=80;e.stats.sp=100;e.stats.atk=round(front.stats.def+front.stats.hp*.12*M);e.stats.hp=round(e.stats.hp*(1+.4*M));}}
  if(['7-6','7-7','7-8'].includes(id)){for(const wave of w){const e=wave[0];setup(e,[id==='7-6'?'SKD048':id==='7-7'?'SKD045':'SKD049'],3,9);e.stats.atk=round(avgAtk*(2+M*2));e.stats.hp=round(e.stats.hp*(.65+.2*M));e.stats.def=round(avgAtk*.2);if(wave[1]){wave[1].stats.hp=round(maxAtk*2);pressure(wave[1],.1);}}}
  if(['8-1','8-5','8-7','9-10'].includes(id)){for(const wave of w){const e=wave[0];e.stats.hp=round(e.stats.hp*(.8+.3*M));pressure(e,.22);setup(e,[id==='8-5'?'SKD026':'SKD022'],4,8);e.initialSp=75;e.stats.sp=100;}}
  if(id==='8-2'){for(const wave of w)if(wave.length===1){const e=wave[0];e.stats.def=round(maxAtk*(.75+.3*M));e.stats.hp=round(maxAtk*(3+M));e.actionCount=9;}else for(const e of wave){e.stats.def=round(maxAtk*.15);e.stats.hp=round(maxAtk*(1.7+.3*M));}}
  if(id==='8-4'){for(let j=0;j<w.length-1;j++){const e=w[j].at(-1);setup(e,['SKD058'],8,12);e.stats.atk=round(avgHp*(.3+.15*M));e.stats.hp=round(maxAtk*(3+.5*M));}w.at(-1)[0].initialCount=3;}
  if(id==='9-1'){const e=w.at(-1)[0];e.stats.def=round(maxAtk*(.8+.3*M));e.stats.hp=round(maxAtk*(3+M));pressure(e,.07);e.actionCount=8;}
  if(id==='9-9'){for(const wave of w){const e=wave[0];setup(e,['SKD032','SKD013'],4,9);e.initialSp=215;e.stats.sp=215;e.stats.atk=round(front.stats.def+front.stats.hp*.14*M);e.stats.hp=round(e.stats.hp*(1+.3*M));}}
  if(id==='10-5'){for(const wave of w){const e=wave[0];pressure(e,.14);e.stats.hp=round(e.stats.hp*(.8+.3*M));}}
  if(id==='10-7'){for(const wave of w){const e=wave[0];e.stats.def=round(maxAtk*(.7+.35*M));e.stats.hp=round(e.stats.hp*(.45+.1*M));}w[0][0].stats.atk=round(front.stats.def+front.stats.hp*.16);w[0][0].initialCount=3;w[0][0].actionCount=8;}
 }
 let control=copy(p),direct=copy(p);for(const u of control)u.skills=u.skills.filter(s=>!focus.includes(s.id));for(const u of direct)u.skills=u.skills.map(s=>focus.includes(s.id)?skill(({fire:'SKD007',water:'SKD008',earth:'SKD009',wind:'SKD010',light:'SKD011',dark:'SKD012'})[s.element],lb):s);
 let controlNote='焦点スキル除去',directNote='焦点を同属性の標準攻撃へ置換';
 if(id==='1-3'){for(const u of control)u.skills=u.skills.map(s=>s.id==='SKD003'?skill('SKD005',lb):s);control=copy(p);for(const u of control)u.skills=u.skills.map(s=>s.id==='SKD007'?skill('SKD008',lb):s);direct=copy(control);controlNote=directNote='同レア同SPで火攻撃から水攻撃へ変更';}
 if(id==='2-1'){control=copy(p);for(const u of control)u.skills=u.skills.map(s=>s.id==='SKD008'?skill('SKD026',lb):s);direct=copy(control);controlNote=directNote='先頭集中から後衛攻撃へ変更';}
 if(id==='5-2'){control=copy(p);swap(control,0,'井伊直虎');direct=copy(control);controlNote=directNote='同レア守備型の受け属性を土から水へ変更。固有値・パッシブ差も含む';}
 if(id==='5-5'){control=copy(p);swap(control,0,'黒田官兵衛');direct=copy(control);controlNote=directNote='光を受ける前衛を土守備から闇攻撃へ。実キャラの複合差';}
 if(id==='10-5'){control=copy(p);let i=control.findIndex(u=>u.name==='上杉謙信');swap(control,i,'前田慶次');direct=copy(control);controlNote=directNote='水主砲を風攻守へ交換し風主軸を強める。完全単色は前提にしない';}
 const alt=copy(p),srcAlt=b.cases.find(c=>c.mode==='alternative').party;let ix=p.findIndex(u=>!srcAlt.some(a=>a.name===u.name));let candidate=srcAlt.find(u=>!p.some(a=>a.name===u.name));if(ix>=0&&candidate)swap(alt,ix,candidate.name);else {let i=p.findIndex(u=>u.name==='お市の方');if(i>=0&&!p.some(u=>u.name==='本願寺顕如'))swap(alt,i,'本願寺顕如');}
 return{id,concept:b.concept,tier:t,focus,notes,controlNote,directNote,fixture:b.fixture,waves:w,parties:{main:p,control,direct,alternative:alt},lb};
}
function judge(cases){const a=sum(cases.main),o=sum(cases.control),d=sum(cases.direct);const effects=[o,d].map(b=>({win:a.wins/a.n-b.wins/b.n,actions:b.actions-a.actions,hp:a.hp-b.hp,alive:a.alive-b.alive,skips:b.skips-a.skips}));const useful=e=>e.win>=.15||e.actions>=Math.max(3,a.actions*.08)||e.hp>=.1||e.alive>=.4||e.skips>=1;
 const good=a.wins===a.n&&effects.every(useful);let score=effects.map(e=>Math.max(e.win*100,e.actions/Math.max(3,a.actions*.08),e.hp/.1,e.alive/.4,e.skips)).reduce((a,b)=>Math.min(a,b),Infinity);if(a.wins<a.n)score-=20*(1-a.wins/a.n);return{qualifiedScreen:good,score,main:a,control:o,direct:d,deltas:effects};}
const results=[];for(const item of ledger){const b=base.find(x=>x.id===item.stage),variants=[];for(let t=0;t<=4;t++){const c=design(b,t),cases={};for(const mode of ['main','control','direct'])cases[mode]=evaluate(c.parties[mode],c.waves,16001,8);const j=judge(cases);variants.push({...c,screen:cases,judgment:j});}
 const ranked=[...variants].sort((a,b)=>Number(b.judgment.qualifiedScreen)-Number(a.judgment.qualifiedScreen)||b.judgment.score-a.judgment.score);const selected=ranked[0];results.push({id:item.stage,group:item.group,selectedTier:selected.tier,variants});console.log(item.stage,selected.tier,selected.judgment.qualifiedScreen,selected.judgment.score.toFixed(2));fs.writeFileSync('battle-check/repair17-checkpoint.json',JSON.stringify({results}));}
fs.writeFileSync('battle-check/repair17-screen.json',JSON.stringify({status:'CANDIDATE_NOT_FIXED',basis:fs.readFileSync('/tmp/round17-head.txt','utf8').trim(),screeningThresholds:'Exploratory selection only: main all wins; concrete benefit vs both omission and ordinary-attack replacement. Not newly approved acceptance thresholds.',rules,results}));
export {design,evaluate,judge,sum,swap};
