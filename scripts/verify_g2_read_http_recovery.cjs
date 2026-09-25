/** R05: real supabase-js/PostgREST transport against loopback fault server.
 * Executes the production read effects; does not claim Preview/RLS/real-device acceptance.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const ts = require('typescript');
const { createClient } = require('@supabase/supabase-js');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const routes = new Map();
const calls = [];
const server = http.createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const mode = routes.get(path) || 'success';
  const call = { path, method: req.method, mode, closed: false };
  calls.push(call); res.on('close', () => { call.closed = true; });
  if (mode === 'stall') return;
  if (mode === 'disconnect') { req.socket.destroy(); return; }
  res.setHeader('Content-Type', 'application/json');
  if (mode === 'failure') { res.statusCode = 503; res.end(JSON.stringify({message: 'R05 controlled service unavailable', code:'R05'})); return; }
  const data = path.endsWith('/news') ? [{ id: 5, title:'R05 confirmed news', start_at:'2026-09-25T00:00:00Z' }]
    : path.endsWith('/get_public_profiles') ? [] : [{id:'R05-feed', actor_user_id:'R05-actor', activity_type:'QUEST_CLEAR'}];
  res.end(JSON.stringify(data));
});
const extract = (path, start, end) => {
  const source = fs.readFileSync(path, 'utf8'); const a = source.indexOf(start); const b = source.indexOf(end, a);
  assert.ok(a >= 0 && b > a, `${path} effect boundaries`);
  return ts.transpile(source.slice(a, b), {target: ts.ScriptTarget.ES2020});
};
const newsCode = extract('src/app/components/InboxPanel.tsx', '  useEffect(() => {', '\n\n  if (!showInboxPanel)');
const homeCode = extract('src/app/components/redesign/HomeView.tsx', '  useEffect(() => {\n    if (previewOnly) return;\n    let cancelled = false;', '  const profileUserIds =');
const profileCode = extract('src/app/components/redesign/HomeView.tsx', '  useEffect(() => {\n    if (previewOnly || !profileUserIds)', '  useEffect(() => { const timer =');
function run(kind, client, initial = [{id:'retained'}]) {
  const result = {list:initial, loading:false, error:false, timeout:0}; let cleanup;
  const window = {setTimeout(fn, ms) { assert.equal(ms,12000); result.timeout=ms; return setTimeout(fn,ms); }, clearTimeout};
  const setters = [v=>result.loading=v, v=>result.error=v, v=>result.list=v];
  const useEffect = fn=>{cleanup=fn();};
  if(kind==='news') new Function('useEffect','showInboxPanel','inboxPanelTab','newsRetry','supabase','setNewsLoading','setNewsError','setNewsList','window','NEWS_READ_TIMEOUT_MS',newsCode)(useEffect,true,'news',1,client,...setters,window,12000);
  else new Function('useEffect','previewOnly','state','activityAttempt','supabase','setActivityLoading','setActivityError','setActivities','window','HOME_ACTIVITY_READ_TIMEOUT_MS',homeCode)(useEffect,false,{userId:'R05-test'},1,client,...setters,window,12000);
  return {result,cleanup,initial};
}
async function settled(task, limit=16000) { const start=Date.now(); while(task.result.loading && Date.now()-start<limit) await delay(10); assert.equal(task.result.loading,false,'read settles'); return Date.now()-start; }
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const client = createClient(`http://127.0.0.1:${server.address().port}`, 'R05-local-public-fixture', {auth:{persistSession:false,autoRefreshToken:false}});
  const endpoints={news:'/rest/v1/news',home:'/rest/v1/rpc/get_recent_social_activity_feed'};
  const report=[];
  try {
    for(const mode of ['failure','disconnect','stall']) {
      Object.values(endpoints).forEach(path=>routes.set(path,mode));
      const tasks=Object.keys(endpoints).map(kind=>({kind,...run(kind,client)}));
      const times=await Promise.all(tasks.map(task=>settled(task)));
      for(let i=0;i<tasks.length;i++) {
        const task=tasks[i]; assert.ok(task.result.error); assert.equal(task.result.list,task.initial,'confirmed list retained');
        if(mode==='stall') assert.ok(times[i]>=11900 && times[i]<16000,'real 12s timeout');
        task.cleanup(); report.push({kind:task.kind,mode,elapsedMs:times[i],retained:true});
      }
      await delay(50);
      if(mode==='stall') assert.ok(calls.filter(c=>c.mode==='stall').every(c=>c.closed),'abort closes HTTP reads');
      Object.values(endpoints).forEach(path=>routes.set(path,'success'));
      for(const kind of Object.keys(endpoints)) {
        const retry=run(kind,client); await settled(retry); assert.ok(!retry.result.error); assert.equal(retry.result.list[0].id,kind==='news'?'5':'R05-feed'); retry.cleanup();
      }
    }
    // Optional profile HTTP may remain pending while the independent feed read succeeds.
    routes.set('/rest/v1/rpc/get_public_profiles','stall');
    let profileCleanup;
    new Function('useEffect','previewOnly','profileUserIds','state','supabase','CHARACTER_MASTERS','characterArt','setProfileFaces','setProfileNames', profileCode)(fn=>profileCleanup=fn(),false,'R05-actor',{userId:'R05-test'},client,[],()=>null,()=>{},()=>{});
    const feed=run('home',client); await settled(feed);
    assert.ok(!feed.result.error); assert.equal(feed.result.list[0].id,'R05-feed');
    assert.ok(calls.some(c=>c.path.endsWith('get_public_profiles')&&!c.closed),'profile pending independently');
    profileCleanup(); feed.cleanup();
    console.log(JSON.stringify({result:'PASS',scope:'production read effects + real SDK + loopback HTTP faults; not live Preview/RLS',cases:report,retrySuccesses:6,profileDoesNotBlock:true,httpCalls:calls.length},null,2));
  } finally { server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); }
})().catch(error=>{console.error(error);process.exitCode=1;server.closeAllConnections();server.close();});
