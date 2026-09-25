import { createRequire } from 'node:module';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
const root=process.cwd(), temp=join(root,'tests/community/.tmp');
const require=createRequire(join(process.env.COMMUNITY_BUILD_RUNTIME_DIR || root,'package.json'));
const {build}=require('esbuild');
await mkdir(temp,{recursive:true});
try {
 await build({entryPoints:['tests/community/community.test.tsx'],outfile:join(temp,'test.cjs'),bundle:true,platform:'node',format:'cjs',jsx:'automatic',packages:'external',loader:{'.css':'empty'},plugins:[{name:'isolated-community',setup(build){
  build.onResolve({filter:/GameContext$/},()=>({path:'game',namespace:'fixture'}));
  build.onResolve({filter:/^@\/utils\/supabase$/},()=>({path:'supabase',namespace:'fixture'}));
  build.onResolve({filter:/CharacterImageReadiness$/},()=>({path:'images',namespace:'fixture'}));
  build.onResolve({filter:/HomeEffect$/},()=>({path:'effect',namespace:'fixture'}));
  build.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path==='game'?`import {game} from '${root}/tests/community/fixtures.ts'; export function useGame(){return game;}`:args.path==='supabase'?`import {rpc} from '${root}/tests/community/fixtures.ts'; export const supabase={rpc(name,args){return {abortSignal(){return rpc(name,args)}}}};`:args.path==='images'?'export const useCharacterImageReadiness=()=>({ready:true,failed:false,retry(){}});':'export default function HomeEffect(){return null}',loader:'ts',resolveDir:root}));
 }}]});
 await writeFile(join(temp,'setup.cjs'),`const {JSDOM}=require('jsdom');const dom=new JSDOM('<html><body></body></html>',{url:'http://localhost'});for(const key of ['window','document','HTMLElement','Node','MutationObserver','getComputedStyle','localStorage','sessionStorage'])globalThis[key]=dom.window[key];Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.IS_REACT_ACT_ENVIRONMENT=true;globalThis.requestAnimationFrame=fn=>setTimeout(fn,0);globalThis.cancelAnimationFrame=clearTimeout;`);
 const result=spawnSync(process.execPath,['--require',join(temp,'setup.cjs'),'--test','--test-force-exit',join(temp,'test.cjs')],{stdio:'inherit'});process.exitCode=result.status??1;
}finally{await rm(temp,{recursive:true,force:true});}
