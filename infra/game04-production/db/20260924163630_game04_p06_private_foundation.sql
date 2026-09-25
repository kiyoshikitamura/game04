create schema if not exists game04_ops;
revoke all on schema game04_ops from public, anon, authenticated;
create table game04_ops.deployment_state (
 id boolean primary key default true check (id),
 project_ref text not null check (project_ref = 'soiksqgtmcnspfedmanr'),
 environment text not null default 'production' check (environment = 'production'),
 schema_version text not null,
 maintenance boolean not null default true,
 public_enabled boolean not null default false,
 payments_enabled boolean not null default false,
 jobs_enabled boolean not null default false,
 g5_candidate_sha text,
 updated_at timestamptz not null default now()
);
alter table game04_ops.deployment_state enable row level security;
revoke all on game04_ops.deployment_state from public, anon, authenticated;
grant usage on schema game04_ops to service_role;
grant select on game04_ops.deployment_state to service_role;
insert into game04_ops.deployment_state(id, project_ref, schema_version)
values (true, 'soiksqgtmcnspfedmanr','p06-v1');
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('game04-assets','game04-assets',false,52428800,array['image/png','image/jpeg','image/webp','image/gif','audio/mpeg','audio/ogg','audio/wav']),
 ('game04-ops-backups','game04-ops-backups',false,1073741824,null);
