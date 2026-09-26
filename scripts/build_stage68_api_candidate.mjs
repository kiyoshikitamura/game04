import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const out='docs/verification/stage68-implementation-20260927',source='supabase/functions/game04-redesign-api/source.ts',bundle='supabase/functions/game04-redesign-api/index.ts';
const args=['--yes','esbuild@0.25.12',source,'--bundle','--format=esm','--platform=neutral','--target=es2022','--minify',`--outfile=${bundle}`,`--metafile=${out}/api-bundle-metafile.json`];
// Fixed local build command; no deployment, environment fetch, or DB access.
if(process.platform==='win32')execFileSync('cmd.exe',['/d','/s','/c','npx '+args.join(' ')],{stdio:'inherit'});else execFileSync('npx',args,{stdio:'inherit'});
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n')).digest('hex');
fs.writeFileSync(bundle,`// game04-redesign-api source-sha256:${sha(source)}\n`+fs.readFileSync(bundle,'utf8'));
const inputs=Object.keys(JSON.parse(fs.readFileSync(`${out}/api-bundle-metafile.json`)).inputs);
fs.writeFileSync(`${out}/api-bundle-manifest.json`,JSON.stringify({status:'LOCAL_CANDIDATE_NOT_DEPLOYED',esbuild:'0.25.12',sourceHash:sha(source),bundleHash:sha(bundle),masterHash:sha('src/domain/redesign/data/quest65.json'),inputs:inputs.map(path=>({path,sha256:sha(path)})),integration:'Rebuild after merging concurrent source changes. Do not replace a shared bundle with this isolated artifact.'},null,2)+'\n');
