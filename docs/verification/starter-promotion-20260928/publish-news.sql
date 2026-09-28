-- Explicitly requested by the user; execute only after the production release is live.
begin;
select pg_advisory_xact_lock(hashtextextended('game04-starter-pack-renewal-20260928-news',0));
insert into public.news(category,title,content,start_at,is_published,release_key)
select 'UPDATE','【初陣応援パック】100円で姫武将召喚札10枚＋輝石500！',
$content$初陣応援パックの内容をリニューアルしました！

【パック内容】
・特選・姫武将召喚札 ×10
・輝石 ×500

価格：100円（税込）
購入回数：1アカウントにつき1回限り

「商店」の「特選商店」から購入できます。
新たな姫武将を迎えて、次の戦へ挑みましょう！

※購入にはアカウント連携が必要です。
※初陣応援パックを購入済みの方は再購入できません。
※購入アイテムの有効期限は付与から120日です。プレゼントの受取による期限延長はありません。$content$,
statement_timestamp(),true,'game04-starter-pack-renewal-20260928'
where not exists(select 1 from public.news where release_key='game04-starter-pack-renewal-20260928');
commit;
select id,title,is_published,start_at at time zone 'Asia/Tokyo' as published_jst
from public.news where release_key='game04-starter-pack-renewal-20260928';
