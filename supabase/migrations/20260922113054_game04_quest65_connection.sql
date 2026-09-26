-- GAME04 development only: lrgyllgzcdcphlbmkknc. Apply explicitly to that project.
-- Preserve gameplay/economy functions. Ticket delivery shares the existing state CAS transaction.
create or replace function public.game04_deliver_quest_tickets()
returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
declare ticket text; before_amount bigint; after_amount bigint;
begin
 for ticket in select jsonb_object_keys(coalesce(new.state->'questTicketGrants','{}'::jsonb) || coalesce(old.state->'questTicketGrants','{}'::jsonb)) loop
  if ticket not in ('SPECIAL_TICKET_CHARACTER','SPECIAL_TICKET_SKILL','SPECIAL_TICKET_EQUIPMENT') then raise exception 'INVALID_QUEST_TICKET'; end if;
  if coalesce(new.state#>>array['questTicketGrants',ticket],'0') !~ '^[0-9]+$' then raise exception 'INVALID_QUEST_TICKET_AMOUNT'; end if;
  before_amount:=coalesce((old.state#>>array['questTicketGrants',ticket])::bigint,0);
  after_amount:=coalesce((new.state#>>array['questTicketGrants',ticket])::bigint,0);
  if after_amount<before_amount or after_amount>2147483647 then raise exception 'INVALID_QUEST_TICKET_AMOUNT'; end if;
  if after_amount>before_amount then
   insert into public.user_items(user_id,item_id,quantity) values(new.user_id,ticket,(after_amount-before_amount)::integer)
   on conflict(user_id,item_id) do update set quantity=user_items.quantity+excluded.quantity,updated_at=now();
  end if;
 end loop;
 return new;
end $$;
revoke all on function public.game04_deliver_quest_tickets() from public,anon,authenticated;
grant execute on function public.game04_deliver_quest_tickets() to service_role;
drop trigger if exists game04_deliver_quest_tickets on public.game04_player_state;
create trigger game04_deliver_quest_tickets after update of state on public.game04_player_state
for each row execute function public.game04_deliver_quest_tickets();

-- Observed history only. No progress deletion, speculative clears, currency conversion, or retroactive reward.
update public.game04_player_state p set state=p.state || jsonb_build_object(
 'questAttempts',coalesce((select jsonb_object_agg(target_id,n) from (select target_id,count(*) n from public.game04_battles where user_id=p.user_id and kind='quest' group by target_id) q),'{}'::jsonb),
 'questClearCounts',coalesce((select jsonb_object_agg(target_id,n) from (select target_id,count(*) n from public.game04_battles where user_id=p.user_id and kind='quest' and result#>>'{battle,outcome}'='win' group by target_id) q),'{}'::jsonb),
 'questProgressVersion','APPROVED_QUEST65_ROUND17_20260922'),version=version+1,updated_at=now()
where not (p.state ? 'questProgressVersion');
