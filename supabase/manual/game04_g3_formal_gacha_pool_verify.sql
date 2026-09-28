-- Read-only postflight for the GAME04 G3 formal pool.
select gacha_id,rarity,count(*) item_count,min(weight) min_weight,max(weight) max_weight
from public.gacha_items_master
where gacha_id in ('CHAR_NORMAL','SKILL_NORMAL','EQUIP_NORMAL','CHAR_SPECIAL','SKILL_SPECIAL','EQUIP_SPECIAL')
group by gacha_id,rarity order by gacha_id,case rarity when 'N' then 1 when 'R' then 2 when 'SR' then 3 else 4 end;

select count(*) total_rows,count(distinct gacha_id||':'||item_id) distinct_ids,
 md5(string_agg(gacha_id||'|'||item_type||'|'||item_id||'|'||rarity,E'\n' order by gacha_id,item_type,item_id,rarity)) id_checksum
from public.gacha_items_master
where gacha_id in ('CHAR_NORMAL','SKILL_NORMAL','EQUIP_NORMAL','CHAR_SPECIAL','SKILL_SPECIAL','EQUIP_SPECIAL');

select status,data->>'version' manifest_version,jsonb_array_length(data->'rows') manifest_item_count
from public.game04_redesign_master where key='formal_gacha';
