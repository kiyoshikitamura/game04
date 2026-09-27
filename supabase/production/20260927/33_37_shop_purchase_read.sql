-- Existing GAME04 bootstrap reads only its own aggregate purchase counts.
-- No order, payment, grant, or other player's data is exposed.

grant select on public.user_shop_purchases to authenticated;
create policy game04_shop_purchase_counts_self on public.user_shop_purchases
for select to authenticated using (user_id = (select auth.uid()));

