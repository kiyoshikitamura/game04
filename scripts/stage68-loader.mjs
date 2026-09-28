import {registerHooks} from 'node:module';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
registerHooks({
 resolve(spec,context,next){
  if(spec.startsWith('.')&&!/\.[a-z]+$/i.test(spec)){
   for(const ext of ['.ts','.tsx','.json','/index.ts']){const u=new URL(spec+ext,context.parentURL);if(existsSync(fileURLToPath(u)))return next(u.href,context);}
  }
  return next(spec,context);
 },
 load(url,context,next){if(url.endsWith('.json'))return {format:'module',source:'export default '+readFileSync(fileURLToPath(url),'utf8'),shortCircuit:true};return next(url,context);}
});
