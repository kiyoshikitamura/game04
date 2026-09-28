import fs from 'node:fs';import{design,evaluate,judge,sum,swap}from './repair17-helper.mjs';import{skill,unit}from './model.mjs';
const read=p=>JSON.parse(fs.readFileSync(p)),copy=structuredClone,base=read('battle-check/round16-results.json').results,screen=read('battle-check/repair17-screen.json');
const round=v=>Math.max(1,Math.round(v/10)*10),results=[];
for(const b of screen.results.filter(b=>!b.variants.some(v=>v.judgment.qualifiedScreen))){let variants=[];for(let tier=1;tier<=5;tier++){
 const c=design(base.find(x=>x.id===b.id),0),p=c.parties.main,w=c.waves,id=b.id,lb=c.lb,M=[0,.7,1,1.3,1.6,2][tier],A=Math.max(...p.map(u=>u.stats.atk)),H=p.reduce((s,u)=>s+u.stats.hp,0)/5,D=p.reduce((s,u)=>s+u.stats.def,0)/5;
 const set=(i,ids)=>p[i].skills=ids.map(x=>skill('SKD'+x,lb)),focus=c.focus;
 const setup=(e,ids,init=4,reset=9)=>{e.skills=ids.map(x=>skill('SKD'+x,lb));e.initialSp=e.skills.reduce((s,k)=>s+k.spCost,0);e.stats.sp=Math.max(e.stats.sp,e.initialSp);e.initialCount=init;e.actionCount=reset;};
 if(id==='1-3'){set(1,['008']);c.focus=['SKD008'];w.at(-1)[0].stats.hp=round(A*(5+3*M));w.at(-1)[0].initialCount=5;}
 if(id==='2-1'){let idx=p.findIndex(u=>u.skills.some(s=>s.id==='SKD008'));const caster=p.splice(idx,1)[0];p.push(caster);for(const u of p)u.skills=u.skills.filter(s=>s.id!=='SKD034');for(const wave of w){const e=wave[0];e.stats.hp=round(A*(3+M));e.initialCount=5;e.actionCount=8;e.stats.atk=round(D+H*.16);}}
 if(['2-2','8-3','9-2'].includes(id)){let ix=p.findIndex(u=>u.skills.some(s=>s.id==='SKD022'));let caster=p.splice(ix,1)[0];p.push(caster);for(const u of p)u.skills=[];set(p.length-1,['020']);c.focus=['SKD020'];for(const wave of w)if(wave.length>=3)for(const e of wave){e.stats.hp=round(A*(4+2*M));e.stats.def=round(A*.015);e.initialCount=7;e.actionCount=8;e.stats.atk=round(D+H*.04);}}
 if(id==='2-3'){for(const wave of w){const e=wave[0],rear=wave.at(-1);e.stats.def=round(A*(.3+.2*M));e.stats.hp=round(A*(9+2*M));rear.stats.hp=round(A*(1.8+.3*M));rear.stats.atk=round(A*(2+M));setup(rear,['040'],4,4);rear.initialSp=270;rear.stats.sp=270;}}
 if(['3-5','9-4'].includes(id)){for(const u of p)u.skills=u.skills.filter(s=>s.id!=='SKD034');const buff=p.findIndex(u=>u.skills.some(s=>s.id==='SKD035'));if(buff>=0){const q=p.splice(buff,1)[0];p.push(q);}for(const wave of w){const e=wave[0];e.stats.def=round(A*(.85+.11*M));e.stats.hp=round(A*(5+M));e.stats.atk=round(D+H*.035);e.actionCount=8;}if(id==='9-4'){// Reserve shared SP for recovery while the normal-attack main finishes armored fronts.
 for(const u of p)u.skills=u.skills.filter(s=>s.id!=='SKD040');set(1,['041']);for(const wave of w){setup(wave[0],['022'],5,7);wave[0].stats.atk=round(D+H*.25);}}
 }
 if(['4-1','4-4'].includes(id)){[p[0],p[3]]=[p[3],p[0]];for(const u of p)u.skills=[];set(0,id==='4-4'?['045']:[]);set(2,id==='4-1'?['037']:[]);set(4,['039']);for(const wave of w){const e=wave[0];e.stats.hp=round(A*(10+5*M));e.stats.atk=round(p[0].stats.def+p[0].stats.hp*(.055+.02*M));e.initialCount=6;e.actionCount=3;e.skills=[];}}
 if(['4-2','9-7'].includes(id)){for(const u of p)u.skills=u.skills.filter(s=>!s.effects.some(e=>e.type==='damage'));for(const wave of w)for(const e of wave){e.stats.def=round(A*.02);e.stats.hp=round(e.stats.hp*(1+.4*M));e.stats.atk=round(p[0].stats.def*.65+p[0].stats.hp*.025*M);e.skills=[];e.initialSp=0;e.initialCount=3;e.actionCount=2;}}
 if(id==='4-5'){for(const u of p)u.skills=u.skills.filter(s=>!['SKD041','SKD008'].includes(s.id));set(3,['041']);c.focus=['SKD041'];for(const wave of w){const e=wave[0];e.stats.hp=round(e.stats.hp*(.9+.2*M));setup(e,['022'],5,8);e.stats.atk=round(D+H*(.16+.04*M));}}
 if(id==='6-1'){for(const wave of w){const e=wave[0];setup(e,['029'],4,12);e.stats.atk=round(p[0].stats.def+p[0].stats.hp*(.18+.12*M));e.stats.hp=round(e.stats.hp*(1+.5*M));}}
 if(id==='6-2'){for(const wave of w){const e=wave[0];setup(e,['038','007'],4,8);e.stats.atk=round(p[0].stats.def+p[0].stats.hp*(.07+.03*M));e.stats.hp=round(e.stats.hp*(1+.5*M));}set(4,['039']);}
 if(['6-4','9-9'].includes(id)){for(const wave of w){const e=wave[0];setup(e,['022'],6,10);e.stats.atk=round(D+H*(.35+.1*M));e.stats.hp=round(e.stats.hp*(1+.15*M));}}
 if(['7-6','7-7'].includes(id)){for(const wave of w){const e=wave[0];setup(e,[id==='7-7'?'045':'048'],3,8);e.stats.atk=round(A*(1.1+.25*M));e.stats.hp=round(A*(2.4+.4*M));e.stats.def=round(A*.08);if(wave.length>1){const rear=wave.at(-1);setup(rear,['040'],4,7);rear.stats.atk=round(A*.85);rear.stats.hp=round(A*2.2);}}}
 if(id==='8-4'){for(let j=0;j<w.length-1;j++){const e=w[j].at(-1);setup(e,['058'],6,14);e.stats.atk=round(H*(.8+.4*M));e.stats.hp=round(A*(4+M));}set(4,['039']);}
 if(id==='8-5'){const ix=p.findIndex(u=>u.name==='豊臣秀吉');swap(p,ix,'濃姫');for(const wave of w){const e=wave[0];setup(e,['026'],5,7);e.stats.atk=round(D+H*(.15+.04*M));e.stats.hp=round(e.stats.hp*(1+.3*M));}c.notes.push('SR回復役を使う初回編成も比較。SSR回復所持を前提にしない');}
 if(id==='8-7'){for(const wave of w){const e=wave[0];setup(e,['022'],4,7);e.stats.atk=round(D+H*(.12+.03*M));e.stats.hp=round(e.stats.hp*(1+.4*M));}}
 if(id==='10-7'){for(const wave of w){const e=wave[0];e.stats.def=round(A*(.9+.23*M));e.stats.hp=round(e.stats.hp*.55);}w[0][0].stats.atk=round(p[0].stats.def+p[0].stats.hp*.2);w[0][0].initialCount=3;w[0][0].actionCount=8;}
 c.parties.control=copy(p);c.parties.direct=copy(p);
 for(const u of c.parties.control)u.skills=u.skills.filter(s=>!c.focus.includes(s.id));for(const u of c.parties.direct)u.skills=u.skills.map(s=>c.focus.includes(s.id)?skill(({fire:'SKD007',water:'SKD008',earth:'SKD009',wind:'SKD010',light:'SKD011',dark:'SKD012'})[s.element],lb):s);
 if(id==='1-3'){for(const mode of ['control','direct']){c.parties[mode]=copy(p);for(const u of c.parties[mode])u.skills=u.skills.map(s=>s.id==='SKD008'?skill('SKD007',lb):s);}c.controlNote=c.directNote='初期火攻撃から水攻撃へ変更する比較';}
 if(id==='2-1'){for(const mode of ['control','direct']){c.parties[mode]=copy(p);for(const u of c.parties[mode])u.skills=u.skills.map(s=>s.id==='SKD008'?skill('SKD026',lb):s);}}
 // Alternative is regenerated from the updated main, preserving skill allocation and real equipment deltas.
 c.parties.alternative=copy(p);const src=base.find(x=>x.id===id).cases.find(x=>x.mode==='alternative').party;let ix=p.findIndex(u=>!src.some(s=>s.name===u.name)),nu=src.find(u=>!p.some(s=>s.name===u.name));if(ix>=0&&nu)swap(c.parties.alternative,ix,nu.name);
 c.tier='refine-'+tier;c.notes.push('問題別の第2候補群。味方・スキル倍率は変更しない');let cases={};for(const mode of ['main','control','direct'])cases[mode]=evaluate(c.parties[mode],w,17001,8);variants.push({...c,screen:cases,judgment:judge(cases)});
 }
 const combined=[...b.variants,...variants],ranked=[...combined].sort((a,b)=>Number(b.judgment.qualifiedScreen)-Number(a.judgment.qualifiedScreen)||b.judgment.score-a.judgment.score),best=ranked[0];results.push({id:b.id,variants,selectedTier:best.tier});console.log(b.id,best.tier,best.judgment.qualifiedScreen,best.judgment.score.toFixed(2));fs.writeFileSync('battle-check/refine17-checkpoint.json',JSON.stringify({results}));
}
fs.writeFileSync('battle-check/refine17-screen.json',JSON.stringify({status:'CANDIDATE_NOT_FIXED',results}));
