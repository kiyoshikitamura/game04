import localSkills from '@/theme/local-skills.json';
import ElementBadge from '@/app/components/redesign/ElementBadge';
import { notFound } from 'next/navigation';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';
import characters from '@/theme/local-characters.json';
import assets from '../../../../config/game04-local-other-assets.json';
import CreativeCharacter from '@/app/components/redesign/CreativeCharacter';
import { CHARACTER_MASTERS } from '@/domain/redesign/masters';
import HomeEffect from '@/app/components/redesign/HomeEffect';
import backgrounds from '@/theme/local-backgrounds.json';
import '@/app/components/redesign/redesign.css';

export const dynamic = 'force-dynamic';
export default function CreativeAssetsPage() {
  if (process.env.VERCEL_ENV === 'production' || !isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV, process.env.NODE_ENV)) notFound();
  return <main aria-label="素材表示確認" tabIndex={0} style={{background:'#171014',color:'#f7ecd8',padding:20,boxSizing:'border-box',height:'100dvh',minHeight:0,overflowY:'scroll',overflowX:'hidden',scrollbarGutter:'stable',scrollbarColor:'#b38a59 #21171b',WebkitOverflowScrolling:'touch'}}>
    <h1>GAME04 素材表示確認</h1><p>既存素材の接続確認。不足・新規・差し替えの最終判定は実画面確認後です。</p>
    <nav style={{display:'flex',gap:14,flexWrap:'wrap'}}>{['home','quest','character','battle','raid','territory'].map(view => <a key={view} href={`/qa/redesign?view=${view}`}>{view}</a>)}</nav>
    <h2>キャラクター60体</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16}}>{characters.map(c => <section key={c.id}><h3>{c.name}</h3><CreativeCharacter character={CHARACTER_MASTERS.find(m=>m.id===c.id)!}/><details><summary>全身・汎用・バトル</summary>{(['full','portrait','battle'] as const).map(key => <div key={key}><p>{key}</p>{key in c ? <img loading="lazy" src={(c as unknown as Record<string,string>)[key]} alt={`${c.name} ${key}`} style={{width:'100%',height:220,objectFit:'contain'}}/>:<p>対応未確定・未接続</p>}</div>)}</details></section>)}</div>
    <h2>背景・既存演出</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>{backgrounds.map(b=><section key={b.characterId}><h3>{b.name}</h3><div style={{position:'relative',height:360,backgroundImage:`url(${b.image})`,backgroundSize:'cover',overflow:'hidden'}}><img src={characters.find(c=>c.id===b.characterId)?.full} alt="" style={{width:'100%',height:'100%',objectFit:'contain'}}/><HomeEffect characterId={b.characterId}/></div></section>)}</div>
    <section><h2>スキル72件・既存50画像の割り当て</h2><p>属性違い・類似効果では画像を共通利用しています。</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:16}}>{localSkills.map(s=><figure key={s.designId} style={{margin:0}}><img loading="lazy" src={s.path} alt={s.name} style={{width:'100%',height:140,objectFit:'contain'}}/><figcaption><strong>{s.designId} {s.name}</strong><br/><ElementBadge element={s.element}/><small style={{display:'block'}}>使用素材：{s.sourceId} {s.sourceName}</small></figcaption></figure>)}</div></section>
    {['Equipment','Item','Frame','Element','KV'].map(category=><section key={category}><h2>{category}</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:12}}>{assets.assets.filter(a=>a.category===category).map(a=><figure key={a.path} style={{margin:0}}><img loading="lazy" src={a.path} alt={a.id} style={{width:'100%',height:130,objectFit:'contain'}}/><figcaption style={{fontSize:12,overflowWrap:'anywhere'}}>{a.id}</figcaption></figure>)}</div></section>)}
  </main>;
}
