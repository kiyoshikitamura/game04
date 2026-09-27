"""Build the first GAME04 production schema without QA users or fixtures."""
from pathlib import Path
import hashlib, json, re

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'supabase/production/20260927'
OUT.mkdir(parents=True, exist_ok=True)
g3 = 'supabase/isolated/g3/'
integ = 'supabase/isolated/integration/'
sources = [g3+'00_schema.sql', g3+'01_core_seed.sql',
 'supabase/manual/game04_g3_formal_gacha_pool.sql',
 'supabase/migrations/20260919123634_game04_redesign_runtime.sql',
 'supabase/migrations/20260921023857_game04_growth_v1_runtime.sql',
 g3+'10_live_runtime_additions.sql',g3+'11_auth_and_fixture_generator.sql',g3+'13_g3_player_initialization.sql',
 *[g3+n for n in ['14_g3_room_read_projection.sql','15_g3_initial_read_runtime.sql','16_g3_current_territory_master.sql','17_g3_territory_validator_reconciliation.sql']],
 *['supabase/manual/'+n for n in ['game04_g3_gacha_atomic_commit.sql','game04_g2_kpi_gameplay.sql','game04_g2_kpi_supply.sql','game04_g2_kpi_observations.sql','game04_g3_gacha_kpi_connection.sql']],
 *[integ+n for n in ['20_tutorial.sql','22_runtime.sql','23_territory_triggers.sql','24_masters.sql','25_community_schema.sql','26_chat_functions.sql','21_activity.sql']],
 'supabase/candidates/game04_community_public_profiles.sql',
 *[integ+n for n in ['27_territory_master.sql','28_approved_quest_names.sql','29_approved_raid_supply.sql','30_present_claim.sql','31_paid_expiry.sql','33_billing_runtime.sql','34_billing_catalog.sql','35_authentication_reward.sql','37_shop_purchase_read.sql']],
 *['supabase/manual/'+n for n in ['game04_g2_commit_deck_with_context.sql','game04_g2_raid_rooms_with_owners.sql','game04_early_retention_mission_rewards.sql']],
 *[str(p.relative_to(ROOT)) for p in sorted((ROOT/'supabase/migrations').glob('20260926*.sql'))],
 *[str(p.relative_to(ROOT)) for p in sorted((ROOT/'supabase/migrations').glob('20260927*.sql'))],
]
manifest=[]
for i,path in enumerate(sources):
    original=(ROOT/path).read_text()
    sql=original
    if path.endswith('11_auth_and_fixture_generator.sql'):
        sql=sql.split('create or replace function public.game04_prepare_isolated_g3_qa')[0]
    if path.endswith('13_g3_player_initialization.sql'):
        sql=sql.replace("select v_subject,'qa',clock_timestamp(),'GAME04 G3 isolated browser acceptance'", "select v_subject,'normal',clock_timestamp(),'GAME04 production registration'")
    if path.endswith('01_core_seed.sql'):
        sql=sql.replace('GAME04_G3_ISOLATED_ACCEPTANCE','GAME04_PRODUCTION').replace('"fixtureVersion":1,','')
    if path.endswith('31_paid_expiry.sql'):
        start=sql.index('-- Preview schedule is explicitly allowlisted')
        end=sql.index('CREATE OR REPLACE FUNCTION public.game04_get_state',start)
        sql=sql[:start]+sql[end:]
    if path.endswith('33_billing_runtime.sql'):
        sql=sql.replace("is distinct from 'sandbox'", "is distinct from 'live'").replace("check(billing_mode='sandbox')", "check(billing_mode='live')").replace('TEST_MODE_REQUIRED','LIVE_MODE_REQUIRED')
    if path.endswith('00_schema.sql'):
        sql=sql.replace("billing_mode text not null default 'sandbox'", "billing_mode text not null default 'live'")
    if path.endswith('21_activity.sql'):
        sql=sql.replace("order by e.created_at desc,e.id desc limit", "and not exists(select 1 from auth.users au where au.id=e.actor_user_id and lower(au.email)='kiyoshi.kitamura@scopenext.jp' and au.email_confirmed_at is not null)\n order by e.created_at desc,e.id desc limit")
    # These guards refer to our explicit production marker, never the dev marker.
    sql=sql.replace('znakrkaazliexzwihxge','soiksqgtmcnspfedmanr').replace("'isolated_environment'","'production_environment'")
    # Keep one atomic transaction around the reviewed bundle at application time.
    sql=re.sub(r'(?im)^\s*(begin|commit);\s*$', '', sql)
    dest=f'{i:02d}_{Path(path).name}'
    (OUT/dest).write_text(sql+'\n')
    manifest.append({'source':path,'sourceSha256':hashlib.sha256(original.encode()).hexdigest(),'file':dest,'sha256':hashlib.sha256((sql+'\n').encode()).hexdigest()})
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Built {len(manifest)} ordered SQL parts; no QA fixture or Preview cron installed.')
