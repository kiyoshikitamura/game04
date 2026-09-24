-- G2 U08/U09 catalog candidate. Authoritative 2026-09-21 master, not applied.
-- Do not reset purchase counts, orders, prior snapshots or delete legacy product IDs.
-- Empty VIP items intentionally delegates ALL grants to U09; 120 is only legacy billing snapshot schema.
begin;
insert into public.billing_products(id,title,amount_jpy,price_dia,items,purchase_limit,validity_days) values
('beginner_pack_01','初回パック',100,0,'[{"itemId":"SPECIAL_TICKET_CHARACTER","quantity":1},{"itemId":"SPECIAL_TICKET_SKILL","quantity":3},{"itemId":"SPECIAL_TICKET_EQUIPMENT","quantity":1},{"itemId":"ENERGY_DRINK","quantity":2},{"itemId":"CASH","quantity":10000}]'::jsonb,1,120),
('ticket_pack_01','ガチャパック',1500,0,'[{"itemId":"SPECIAL_TICKET_CHARACTER","quantity":5},{"itemId":"SPECIAL_TICKET_SKILL","quantity":5},{"itemId":"SPECIAL_TICKET_EQUIPMENT","quantity":5}]'::jsonb,3,120),
('growth_pack_01','育成パック',500,0,'[{"itemId":"CHAR_EXP_XL","quantity":5},{"itemId":"EQUIP_EXP_XL","quantity":15},{"itemId":"CASH","quantity":100000}]'::jsonb,3,120),
('awakening_pack_01','覚醒・LBパック',1000,0,'[{"itemId":"SOUL_SELECTOR_SSR","quantity":3},{"itemId":"SKILL_LB_PART","quantity":100},{"itemId":"EQUIP_LB_PART","quantity":150},{"itemId":"CASH","quantity":50000}]'::jsonb,3,120),
('diamond_300','有償輝石 300個',300,0,'[{"itemId":"DIAMOND","quantity":300,"validity_days":120}]'::jsonb,0,120),
('diamond_500','有償輝石 500個',500,0,'[{"itemId":"DIAMOND","quantity":500,"validity_days":120}]'::jsonb,0,120),
('diamond_1000','有償輝石 1000個',1000,0,'[{"itemId":"DIAMOND","quantity":1000,"validity_days":120}]'::jsonb,0,120),
('diamond_3000','有償輝石 3000個',3000,0,'[{"itemId":"DIAMOND","quantity":3000,"validity_days":120}]'::jsonb,0,120),
('diamond_5000','有償輝石 5000個',5000,0,'[{"itemId":"DIAMOND","quantity":5000,"validity_days":120}]'::jsonb,0,120),
('diamond_10000','有償輝石 10000個',10000,0,'[{"itemId":"DIAMOND","quantity":10000,"validity_days":120}]'::jsonb,0,120),
('game04_vip_30d','VIPパス（30日）',480,0,'[]'::jsonb,0,120)
on conflict(id) do update set title=excluded.title,amount_jpy=excluded.amount_jpy,price_dia=excluded.price_dia,items=excluded.items,purchase_limit=excluded.purchase_limit,validity_days=excluded.validity_days;
commit;
