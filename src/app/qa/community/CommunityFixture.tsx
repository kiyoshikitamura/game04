'use client';
import { useState } from 'react';
import { GameContext } from '@/app/context/GameContext';
import { CommunityBadges } from '@/app/components/redesign/CommunityIdentity';
import CommunityAuthenticationReminder from '@/app/components/redesign/CommunityAuthenticationReminder';
import { authenticationReminderKey } from '@/domain/redesign/community';
import '@/app/components/redesign/redesign.css';
import '@/app/components/redesign/ShellChrome.css';
/** Offline display fixture: no GameProvider, RPC, authentication or purchase writes. */
export default function CommunityFixture() {
 const [anonymous,setAnonymous]=useState(true);
 const [login,setLogin]=useState(true);
 const [generation,setGeneration]=useState(0);
 const now=Date.parse('2026-09-25T00:00:00Z');
 const owner='qa-community-local';
 return <GameContext.Provider value={{playCyberSe() {},session:{user:{id:owner,is_anonymous:anonymous}},showLoginBonusModal:login}}>
  <main className="rd-shell" style={{maxWidth:390,minHeight:'100dvh',margin:'auto',padding:16}}>
   <h1>コミュニティ表示確認</h1><p>表示用サンプル・ゲームデータ保存なし</p>
   <section className="rd-panel"><h2>認証・VIP</h2>
    <p>認証済みの城主 <CommunityBadges authenticated vipExpiresAt="2026-09-26T00:00:00Z" now={now}/></p>
    <p>期限切れの城主 <CommunityBadges authenticated vipExpiresAt="2026-09-25T00:00:00Z" now={now}/></p>
    <p>未認証の城主 <CommunityBadges authenticated={false} now={now}/></p>
   </section>
   <section className="rd-panel"><h2>日次注意</h2><p>{anonymous?'未認証':'認証済み'}・{login?'ログイン表示待ち':'本陣'}</p>
    <button className="rd-button" onClick={()=>setLogin(false)}>ログイン表示を閉じる</button>
    <button className="rd-button" onClick={()=>setAnonymous(v=>!v)}>認証状態を切替</button>
    <button className="rd-button" onClick={()=>{localStorage.removeItem(authenticationReminderKey(owner));setGeneration(n=>n+1);setAnonymous(true);setLogin(false);}}>当日記録を消して再確認</button>
   </section>
   <CommunityAuthenticationReminder key={generation} owner={owner} eligible />
  </main>
 </GameContext.Provider>;
}
