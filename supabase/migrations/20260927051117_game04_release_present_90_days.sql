-- User approved 2026-09-27: BOX claim deadline is 90 days after each grant.
-- Distribution still disabled until the formal release start is configured.
update public.game04_release_campaigns set claim_days=90,claim_policy_approved=true where id='game04-release-2026';
