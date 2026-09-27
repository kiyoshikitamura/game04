-- No user rows, sessions, credentials, secrets, Stripe products, webhook or Cron jobs.

insert into public.game04_redesign_master(key,status,data) values
 ('runtime','PREVIEW_PROVISIONAL','{"energyMax":50,"energyRecoverySeconds":180,"vipDays":30,"commercialEnabled":false}'),
 ('acquisition_conversion','APPROVED_GROWTH_V1_20260921','{"characterDuplicateSouls":20,"skillDuplicateMaterials":{"N":1,"R":2,"SR":5,"SSR":20},"characterAtCap":"convert","skillAtCap":"convert"}'),
 ('quest_player_exp','UNCONFIGURED','{"version":"QUEST_PLAYER_EXP_UNCONFIGURED_20260921","stages":{}}'),
 ('missions','FORMAL_MASTER_PENDING','{"enabled":false,"missions":[]}'),
 ('production_environment','GAME04_PRODUCTION','{"scope":"GAME04_PRODUCTION","projectRef":"soiksqgtmcnspfedmanr","stripe":false,"webhook":false,"cron":false}')
on conflict(key) do update set status=excluded.status,data=excluded.data,updated_at=now();

