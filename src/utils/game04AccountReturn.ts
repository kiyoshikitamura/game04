const KEY = 'game04_account_entry';
const TABS = ['home','quest','character','raid','gacha','territory','shop','bag'];
/** Same-tab navigation hint only; never stores player data or credentials. */
export function openGame04Account(tab?: string) {
  try { sessionStorage.setItem(KEY, JSON.stringify({tab:TABS.includes(tab||'')?tab:'home', returning:false})); } catch { /* Navigation still works if storage is unavailable. */ }
  window.location.assign('/auth/game04');
}
export function returnToGame04() {
  try { const entry=JSON.parse(sessionStorage.getItem(KEY)||'{}');sessionStorage.setItem(KEY,JSON.stringify({tab:TABS.includes(entry.tab)?entry.tab:'home',returning:true})); } catch { /* Safe root fallback. */ }
  window.location.assign('/');
}
export function restoredGame04Tab(fallback:string) {
  if(typeof window==='undefined')return fallback;
  try {const entry=JSON.parse(sessionStorage.getItem(KEY)||'null');return entry?.returning&&TABS.includes(entry.tab)?entry.tab:fallback;}catch{return fallback;}
}
export function clearGame04Return(){try{sessionStorage.removeItem(KEY);}catch{/* Optional hint. */}}
