// Exercise the real RedesignApp refresh callback after simulated session changes.
// No real sign-in, browser or database calls; this does not certify OAuth acceptance.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const src = fs.readFileSync('src/app/components/redesign/RedesignApp.tsx', 'utf8');
const start = src.indexOf('const refresh = useCallback(');
const end = src.indexOf('  }, [owner]);', start) + '  }, [owner]);'.length;
const code = ts.transpileModule(src.slice(start, end), {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
function deferred() { let resolve, reject; const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject}; }
function mount(owner, initial=null) {
  const request=deferred(), ownerRef={current:owner}; let data=initial,error=''; const generation={current:0};
  const refresh=new Function('useCallback','owner','lock','refreshing','requestGeneration','ownerRef','redesignRequest','setData','setError',code+';return refresh;')(
    f=>f, owner, {current:false}, {current:null}, generation, ownerRef, ()=>request.promise,
    value=>{data=typeof value==='function'?value(data):value;},value=>{error=value;});
  return {refresh,request,ownerRef,generation,get data(){return data;},get error(){return error;}};
}
(async()=>{
 const saved={state:{userId:'A',version:11,homeBackgroundId:'ssr:char_koharu_01',unlockedHomeBackgroundIds:['ssr:char_koharu_01']}};
 const resumed=mount('A'); const pending=resumed.refresh(); resumed.request.resolve(structuredClone(saved));await pending;
 assert.deepEqual(resumed.data,saved,'new session reads selected/unlocked fields from authoritative response');
 const signedOut=mount('A');const out=signedOut.refresh();signedOut.ownerRef.current=undefined;signedOut.request.resolve(saved);await out;assert.equal(signedOut.data,null,'in-flight response cannot repopulate signed-out state');
 const switched=mount('A');const other=switched.refresh();switched.ownerRef.current='B';switched.request.resolve(saved);await other;assert.equal(switched.data,null,'previous owner response cannot overwrite new account');
 const stale=mount('A',saved);const older=stale.refresh();stale.request.resolve({...saved,state:{...saved.state,version:10,homeBackgroundId:'castle-town'}});await older;assert.equal(stale.data.state.homeBackgroundId,saved.state.homeBackgroundId);
 const failure=mount('A',saved);const failed=failure.refresh();failure.request.reject(Error('unavailable'));await failed;assert.equal(failure.data,saved);assert.equal(failure.error,'unavailable');
 const dedup=mount('A');const one=dedup.refresh(),two=dedup.refresh();assert.equal(one,two);dedup.request.resolve(saved);await one;
 console.log(JSON.stringify({status:'PASS',checks:6,scope:'actual refresh callback; simulated session changes only; not browser logout/login',liveWrites:0}));
})().catch(e=>{console.error(e);process.exitCode=1;});
