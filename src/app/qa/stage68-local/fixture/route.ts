import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
export async function GET(request:Request){
 if(process.env.NODE_ENV!=='development')return new Response(null,{status:404});
 const id=new URL(request.url).searchParams.get('case')??'9-6-primary';
 const duration=/^duration-\d{1,2}-\d{1,2}-(before|after|risk)$/.test(id);
 const resolution=/^resolution-\d{1,2}-\d{1,2}-(before|after|primary|long|final|final-long)$/.test(id);
 if(!duration&&!resolution&&!/^(9-6|10-8)-(primary|low|old-stall)$/.test(id))return new Response(null,{status:400});
 const directory=duration?'stage68-duration-20260927':resolution?'stage68-resolution-20260927':'stage68-implementation-20260927';
 const file=path.join(process.cwd(),'docs/verification',directory,'playback-fixtures',id+'.json.gz');
 if(!fs.existsSync(file))return new Response(null,{status:404});
 return new Response(gunzipSync(fs.readFileSync(file)).toString(),{headers:{'content-type':'application/json','cache-control':'no-store'}});
}
