import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
export async function GET(request:Request){
 if(process.env.NODE_ENV!=='development')return new Response(null,{status:404});
 const id=new URL(request.url).searchParams.get('case')??'9-6-primary';
 if(!/^(9-6|10-8)-(primary|low|old-stall)$/.test(id))return new Response(null,{status:400});
 return new Response(gunzipSync(fs.readFileSync(path.join(process.cwd(),'docs/verification/stage68-implementation-20260927/playback-fixtures',id+'.json.gz'))).toString(),{headers:{'content-type':'application/json','cache-control':'no-store'}});
}
