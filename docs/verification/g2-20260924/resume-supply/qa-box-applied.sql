do $fixture$
declare uid uuid:='4c888ed3-283e-4857-a596-4f4316efab26'; item text; qty integer;
begin
 if not exists(select 1 from public.users where id=uid and username='G2QA再検') then raise exception 'QA_OWNER_MISMATCH';end if;
 if exists(select 1 from public.presents where user_id=uid and source_metadata->>'qaFixture'='G2_BOX_RESUME_20260924') then raise exception 'QA_FIXTURE_ALREADY_EXISTS';end if;
 foreach item in array array['CHAR_EXP_M','ENERGY_DRINK','SOUL_SELECTOR_N'] loop
 qty:=case when item='CHAR_EXP_M' then 3 else 1 end;
 insert into public.presents(user_id,item_id,quantity,status,message,source_kind,source_metadata,expire_at)
 values(uid,item,qty,'UNCLAIMED','G2専用検証：正式素材の受取と育成・商店への反映を確認するプレゼント（長い名称の表示確認）','GAME04_QA',
 jsonb_build_object('game04RewardVersion','APPROVED_GROWTH_V1_20260921','funding','free','qaFixture','G2_BOX_RESUME_20260924'),now()+interval '7 days');
 end loop;
end $fixture$;
select id,item_id,quantity,status from public.presents where user_id='4c888ed3-283e-4857-a596-4f4316efab26' and source_metadata->>'qaFixture'='G2_BOX_RESUME_20260924';
