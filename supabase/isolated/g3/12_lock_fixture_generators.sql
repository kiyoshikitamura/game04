-- Run immediately after prepare/finalize succeed. Acceptance runtime must not retain seed writers.
revoke all on function public.game04_prepare_isolated_g3_qa(uuid,uuid),public.game04_finalize_isolated_g3_qa(uuid,text)
 from public,anon,authenticated,service_role;
drop function public.game04_prepare_isolated_g3_qa(uuid,uuid);
drop function public.game04_finalize_isolated_g3_qa(uuid,text);
