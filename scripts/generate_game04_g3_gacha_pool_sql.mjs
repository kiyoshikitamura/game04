import fs from 'node:fs';
import crypto from 'node:crypto';
const source=JSON.parse(fs.readFileSync(new URL('../src/domain/redesign/data/formalGachaMaster.json',import.meta.url),'utf8'));
const id={character:{normal:'CHAR_NORMAL',special:'CHAR_SPECIAL'},skill:{normal:'SKILL_NORMAL',special:'SKILL_SPECIAL'},equipment:{normal:'EQUIP_NORMAL',special:'EQUIP_SPECIAL'}};
const type={character:'CHARACTER',skill:'SKILL',equipment:'EQUIPMENT'};
const rows=[];
for(const row of source.rows){
 if(row.normal)rows.push({gacha:id[row.category].normal,itemType:type[row.category],itemId:row.itemId,rarity:row.rarity});
 if(row.special)rows.push({gacha:id[row.category].special,itemType:type[row.category],itemId:row.itemId,rarity:row.rarity});
}
rows.sort((a,b)=>`${a.gacha}|${a.itemType}|${a.itemId}|${a.rarity}`.localeCompare(`${b.gacha}|${b.itemType}|${b.itemId}|${b.rarity}`));
if(rows.length!==525||new Set(rows.map(r=>`${r.gacha}:${r.itemId}`)).size!==525)throw Error('formal pool row mismatch');
const checksum=crypto.createHash('md5').update(rows.map(r=>`${r.gacha}|${r.itemType}|${r.itemId}|${r.rarity}`).join('\n')).digest('hex');
const q=value=>`'${String(value).replaceAll("'","''")}'`;
const values=rows.map(r=>` (${q(`${r.gacha}:${r.itemId}`)},${q(r.gacha)},${q(r.itemType)},${q(r.itemId)},${q(r.rarity)},1,false)`).join(',\n');
const manifest=JSON.stringify(source).replaceAll("'","''");
const sql=`-- Generated from formalGachaMaster.json ${source.version}. GAME04 development only.
-- Scoped replacement: the six legacy gacha pool IDs; no other pool or API bundle.
begin;

insert into public.gacha_masters(id,name,gacha_type,cost_cash,cost_diamond,banner_img) values
 ('CHAR_NORMAL','通常召喚（武将母集団）','CHARACTER',1000,0,null),
 ('SKILL_NORMAL','通常召喚（技能母集団）','SKILL',1000,0,null),
 ('EQUIP_NORMAL','通常召喚（装備母集団）','EQUIPMENT',1000,0,null),
 ('CHAR_SPECIAL','特選武将召喚','CHARACTER',0,300,null),
 ('SKILL_SPECIAL','特選技能召喚','SKILL',0,300,null),
 ('EQUIP_SPECIAL','特選装備召喚','EQUIPMENT',0,200,null)
on conflict(id) do update set name=excluded.name,gacha_type=excluded.gacha_type,cost_cash=excluded.cost_cash,cost_diamond=excluded.cost_diamond,banner_img=excluded.banner_img;

delete from public.gacha_rarity_rates where gacha_id in ('CHAR_NORMAL','SKILL_NORMAL','EQUIP_NORMAL','CHAR_SPECIAL','SKILL_SPECIAL','EQUIP_SPECIAL');
insert into public.gacha_rarity_rates(gacha_id,rarity,weight) values
 ('CHAR_NORMAL','N',49),('CHAR_NORMAL','R',40),('CHAR_NORMAL','SR',10),('CHAR_NORMAL','SSR',1),
 ('SKILL_NORMAL','N',49),('SKILL_NORMAL','R',40),('SKILL_NORMAL','SR',10),('SKILL_NORMAL','SSR',1),
 ('EQUIP_NORMAL','N',49),('EQUIP_NORMAL','R',40),('EQUIP_NORMAL','SR',10),('EQUIP_NORMAL','SSR',1),
 ('CHAR_SPECIAL','R',65),('CHAR_SPECIAL','SR',32),('CHAR_SPECIAL','SSR',3),
 ('SKILL_SPECIAL','R',60),('SKILL_SPECIAL','SR',35),('SKILL_SPECIAL','SSR',5),
 ('EQUIP_SPECIAL','R',50),('EQUIP_SPECIAL','SR',40),('EQUIP_SPECIAL','SSR',10);

delete from public.gacha_items_master where gacha_id in ('CHAR_NORMAL','SKILL_NORMAL','EQUIP_NORMAL','CHAR_SPECIAL','SKILL_SPECIAL','EQUIP_SPECIAL');
insert into public.gacha_items_master(id,gacha_id,item_type,item_id,rarity,weight,is_pickup) values
${values};

insert into public.game04_redesign_master(key,status,data) values('formal_gacha','${source.version}','${manifest}'::jsonb)
on conflict(key) do update set status=excluded.status,data=excluded.data,updated_at=clock_timestamp();

do $$ declare actual_count integer; actual_checksum text; begin
 select count(*),md5(string_agg(gacha_id||'|'||item_type||'|'||item_id||'|'||rarity,E'\\n' order by gacha_id,item_type,item_id,rarity)) into actual_count,actual_checksum
 from public.gacha_items_master where gacha_id in ('CHAR_NORMAL','SKILL_NORMAL','EQUIP_NORMAL','CHAR_SPECIAL','SKILL_SPECIAL','EQUIP_SPECIAL');
 if actual_count<>525 then raise exception 'GAME04_G3_POOL_COUNT_MISMATCH:%',actual_count; end if;
 if actual_checksum<>'${checksum}' then raise exception 'GAME04_G3_POOL_CHECKSUM_MISMATCH:%',actual_checksum; end if;
end $$;
commit;
notify pgrst,'reload schema';
`;
fs.writeFileSync(new URL('../supabase/manual/game04_g3_formal_gacha_pool.sql',import.meta.url),sql);
console.log(JSON.stringify({rows:rows.length,checksum,output:'supabase/manual/game04_g3_formal_gacha_pool.sql'}));
