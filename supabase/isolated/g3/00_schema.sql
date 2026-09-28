-- GAME04 G3 isolated acceptance schema snapshot.
-- Source catalog: game04-dev-clean (lrgyllgzcdcphlbmkknc), read-only, 2026-09-25.
-- Deliberately excludes GAME03 history, Stripe/webhook objects, Cron, performance candidates and user data.
begin;

create extension if not exists pgcrypto with schema extensions;

create table public.users (
 id uuid primary key default extensions.gen_random_uuid(), username text not null default '半グレの首領',
 bio text default '', avatar_url text default '/reiji_transparent_asset.png', current_base_id text default 'shinjuku',
 level integer default 1, xp integer default 0, cash bigint default 2600, neon_diamonds integer default 200,
 vitality integer default 50, pvp_points integer not null default 5, pvp_points_last_recovered_at timestamptz not null default now(),
 favorite_character_id text, title_equipped text default '半グレの首領', equipped_background text default '/bg/bg_base_neontower.png',
 equipped_front_effect text default 'none', selected_bg_mode text default 'NEON_TOWER', interior_item text default 'none',
 last_guild_left_at timestamptz, gift_code text unique, daily_cash_skips_count integer default 0,
 sound_settings jsonb default '{"se":true,"bgm":true}', created_at timestamptz default now(),
 raid_attempts_today integer default 0, raid_attempts_reset_at timestamptz default now(), has_shown_guild_dialog boolean default false,
 last_active_at timestamptz, last_username_changed_on date, last_bio_changed_on date, guild_id uuid,
 diamonds integer not null default 0, vitality_last_recovered_at timestamptz not null default now(), last_login_date date,
 updated_at timestamptz not null default now(), daily_cash_skips_reset_date date,
 raid_points integer not null default 5 check(raid_points between 0 and 5), raid_points_last_recovered_at timestamptz not null default now(),
 raid_free_entry_consumed boolean not null default false, quest_free_skips_count integer not null default 0,
 quest_paid_skips_count integer not null default 0, quest_skips_reset_date date,
 constraint users_username_length_check check(char_length(username) between 1 and 8) not valid,
 constraint users_level_positive_check check(level between 1 and 100) not valid,
 constraint users_xp_nonnegative_check check(xp>=0) not valid
);
comment on column public.users.guild_id is 'Compatibility column only; guild/GAME03 schema is intentionally absent in isolated G3.';

create table public.user_items (
 id uuid primary key default extensions.gen_random_uuid(), user_id uuid references public.users(id) on delete cascade,
 item_id text not null, quantity integer default 0, updated_at timestamptz default now(), unique(user_id,item_id)
);
create table public.user_login_bonuses (
 id uuid primary key default extensions.gen_random_uuid(), user_id uuid unique references public.users(id) on delete cascade,
 current_day integer default 1 check(current_day between 1 and 30), last_claimed_at timestamptz default now(),
 total_logins integer not null default 0 check(total_logins>=0)
);
create table public.user_account_auth_methods (
 user_id uuid primary key references public.users(id) on delete cascade,
 auth_method text not null check(auth_method in ('EMAIL','GOOGLE')),authenticated_at timestamptz not null default now()
);
create table public.presents (
 id uuid primary key default extensions.gen_random_uuid(), user_id uuid references public.users(id) on delete cascade,
 item_id text not null, quantity integer default 1, message text, status text default 'UNCLAIMED', expire_at timestamptz,
 created_at timestamptz default now(), sent_at timestamptz not null default now(), claimed_at timestamptz,
 source_kind text, source_key text, source_metadata jsonb not null default '{}'
);

create table public.game04_player_state (
 user_id uuid primary key references public.users(id), version bigint not null default 0,
 state jsonb not null, updated_at timestamptz not null default now()
);
create table public.game04_requests (
 user_id uuid not null references public.users(id), request_id uuid not null, result jsonb not null,
 created_at timestamptz not null default now(), primary key(user_id,request_id)
);
create table public.game04_battles (
 id uuid primary key, user_id uuid not null references public.users(id), kind text not null, target_id text not null,
 seed bigint not null, input jsonb not null, result jsonb, status text not null check(status in ('started','settled')),
 created_at timestamptz not null default now(), settled_at timestamptz
);
create table public.game04_raid_rooms (
 id uuid primary key, version bigint not null default 0, state jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.game04_social_events (
 id uuid primary key default gen_random_uuid(), room_id uuid not null references public.game04_raid_rooms(id),
 author_id uuid not null references public.users(id), kind text not null, body jsonb not null, created_at timestamptz not null default now()
);
create table public.game04_redesign_master (
 key text primary key, status text not null default 'PREVIEW_PROVISIONAL', data jsonb not null, updated_at timestamptz not null default now()
);
create table public.game04_acquisition_events (
 id text primary key, user_id uuid not null references public.users(id), payload jsonb not null,
 created_at timestamptz not null default clock_timestamp()
);
create table public.game04_vip_entitlements (user_id uuid primary key references public.users(id),expires_at timestamptz not null);
create table public.game04_vip_grants (
 order_id text primary key,user_id uuid not null references public.users(id),days integer not null check(days=30),created_at timestamptz not null default now()
);
create table public.game04_vip_deliveries (
 order_id text not null references public.game04_vip_grants(order_id), user_id uuid not null references public.users(id),
 ordinal integer not null check(ordinal between 1 and 30),due_at timestamptz not null,delivered_at timestamptz,
 amount integer not null default 100 check(amount=100),primary key(order_id,ordinal)
);
create table public.game04_login_deliveries (
 user_id uuid not null references public.users(id),login_date date not null,total_logins integer not null check(total_logins>0),
 day_number integer not null check(day_number between 1 and 30),delivered_at timestamptz not null,
 master_version text not null check(master_version='game04-login-30-v1-20260921'),primary key(user_id,login_date),unique(user_id,total_logins)
);
create table public.game04_state_restore_observations (
 user_id uuid not null references public.users(id),request_id uuid not null,observed_version bigint not null check(observed_version>=0),
 observed_at timestamptz not null default now(),primary key(user_id,request_id)
);

create table public.gacha_masters (
 id text primary key,name text not null,cost_cash integer default 0,cost_diamond integer default 0,banner_img text,
 gacha_type text not null default 'CHARACTER'
);
create table public.gacha_rarity_rates (
 gacha_id text not null references public.gacha_masters(id) on delete cascade,rarity text not null check(rarity in ('N','R','SR','SSR')),
 weight integer not null check(weight>0),primary key(gacha_id,rarity)
);
create table public.gacha_items_master (
 id text primary key,gacha_id text references public.gacha_masters(id) on delete cascade,item_type text not null,item_id text not null,
 rarity text not null,weight integer default 10,is_pickup boolean not null default false
);

-- Paid-lot authority is retained, but no checkout/webhook/Stripe secret is installed.
create table public.billing_products (
 id text primary key,title text not null,amount_jpy integer,price_dia integer,items jsonb not null,purchase_limit integer not null default 0,
 validity_days integer check(validity_days>0),check((amount_jpy>0 and price_dia is null) or (price_dia>0 and amount_jpy is null)),
 check(jsonb_typeof(items)='array')
);
create table public.billing_orders (
 id uuid primary key default extensions.gen_random_uuid(),user_id uuid not null references public.users(id),request_id uuid not null,
 product_id text not null references public.billing_products(id),amount_jpy integer not null,product_snapshot jsonb not null,
 stripe_session_id text unique,status text not null default 'PENDING' check(status in ('PENDING','GRANTED','EXPIRED')),
 created_at timestamptz not null default now(),granted_at timestamptz,billing_mode text not null default 'sandbox' check(billing_mode in ('sandbox','live')),
 unique(user_id,request_id)
);
create table public.billing_asset_lots (
 id uuid primary key default extensions.gen_random_uuid(),order_id uuid not null references public.billing_orders(id),
 user_id uuid not null references public.users(id),present_id uuid not null unique references public.presents(id),item_id text not null,
 issued_quantity integer not null check(issued_quantity>0),remaining_quantity integer not null check(remaining_quantity>=0),
 issued_at timestamptz not null,expires_at timestamptz not null check(expires_at>issued_at),claimed_at timestamptz,
 expired_quantity integer not null default 0 check(expired_quantity>=0),source_lot_id uuid references public.billing_asset_lots(id),
 check(remaining_quantity+expired_quantity<=issued_quantity)
);

-- Minimal G2 classification authority required to prove isolated QA is excluded.
create table public.kpi_subjects (
 subject_id uuid primary key default extensions.gen_random_uuid(),source_user_id uuid unique,registered_at timestamptz not null,
 registration_type text not null check(registration_type in ('anonymous','authenticated','unknown')),first_authenticated_at timestamptz,
 detached_at timestamptz,deletion_reason text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(detached_at is null or source_user_id is null)
);
create table public.kpi_account_classification_periods (
 id bigint generated always as identity primary key,subject_id uuid not null references public.kpi_subjects(subject_id) on delete restrict,
 classification text not null check(classification in ('normal','admin','qa','test','fraud_suspended')),valid_from timestamptz not null,
 valid_to timestamptz,reason text not null,changed_by uuid,created_at timestamptz not null default now(),
 check(valid_to is null or valid_to>valid_from)
);
create table public.kpi_acquisition_journeys (
 journey_id uuid primary key default extensions.gen_random_uuid(),journey_token_hash text not null unique check(journey_token_hash~'^[a-f0-9]{64}$'),
 started_at timestamptz not null default clock_timestamp(),source text not null check(source in ('web_v1','server_v1','qa_v1')),
 schema_version integer not null default 1 check(schema_version=1),created_at timestamptz not null default clock_timestamp(),
 first_arrived_at timestamptz,metadata jsonb not null default '{}'
);
create table public.kpi_acquisition_subject_bindings (
 journey_id uuid primary key references public.kpi_acquisition_journeys(journey_id) on delete restrict,
 subject_id uuid not null references public.kpi_subjects(subject_id) on delete restrict,bound_at timestamptz not null default clock_timestamp(),
 source text not null check(source in ('web_v1','server_v1','qa_v1')),schema_version integer not null default 1 check(schema_version=1),
 first_touch_source text,first_touch_fixed_at timestamptz,first_touch_rule_version text
);

-- New-project Data API defaults no longer imply exposure: grants are explicit.
alter table public.users enable row level security;
alter table public.user_items enable row level security;
alter table public.user_login_bonuses enable row level security;
alter table public.user_account_auth_methods enable row level security;
alter table public.presents enable row level security;
alter table public.game04_player_state enable row level security;
alter table public.game04_requests enable row level security;
alter table public.game04_battles enable row level security;
alter table public.game04_raid_rooms enable row level security;
alter table public.game04_social_events enable row level security;
alter table public.game04_redesign_master enable row level security;
alter table public.game04_acquisition_events enable row level security;
alter table public.game04_vip_entitlements enable row level security;
alter table public.game04_vip_grants enable row level security;
alter table public.game04_vip_deliveries enable row level security;
alter table public.game04_login_deliveries enable row level security;
alter table public.game04_state_restore_observations enable row level security;
alter table public.gacha_masters enable row level security;
alter table public.gacha_rarity_rates enable row level security;
alter table public.gacha_items_master enable row level security;
alter table public.billing_products enable row level security;
alter table public.billing_orders enable row level security;
alter table public.billing_asset_lots enable row level security;
alter table public.kpi_subjects enable row level security;
alter table public.kpi_account_classification_periods enable row level security;
alter table public.kpi_acquisition_journeys enable row level security;
alter table public.kpi_acquisition_subject_bindings enable row level security;

create policy users_owner_read on public.users for select to authenticated using((select auth.uid())=id);
create policy user_items_owner_read on public.user_items for select to authenticated using((select auth.uid())=user_id);
create policy user_login_bonuses_owner_read on public.user_login_bonuses for select to authenticated using((select auth.uid())=user_id);
create policy presents_owner_read on public.presents for select to authenticated using((select auth.uid())=user_id);
create policy gacha_masters_read on public.gacha_masters for select to anon,authenticated using(true);
create policy gacha_rates_read on public.gacha_rarity_rates for select to authenticated using(true);
create policy gacha_items_read on public.gacha_items_master for select to anon,authenticated using(true);
create policy billing_orders_owner_read on public.billing_orders for select to authenticated using((select auth.uid())=user_id);
create policy billing_lots_owner_read on public.billing_asset_lots for select to authenticated using((select auth.uid())=user_id);

revoke all on all tables in schema public from anon,authenticated;
grant select on public.users,public.user_items,public.user_login_bonuses,public.presents,
 public.gacha_masters,public.gacha_rarity_rates,public.gacha_items_master,
 public.billing_orders,public.billing_asset_lots to authenticated;
grant select on public.gacha_masters,public.gacha_items_master to anon;
grant all on all tables in schema public to service_role;
grant usage,select on all sequences in schema public to service_role;
commit;
