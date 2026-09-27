# GAME04 provider setup follow-up — 2026-09-27 15:25 JST

User created Stripe GAME04 and supplied Google project game04-509906.
- Stripe GAME04 sandbox verified, account acct_1UKBPEK2y3LQd7hQ, test keys already exist; no secret captured or stored in Git.
- Created only GAME04 sandbox webhook we_1UKBUtK2y3LQd7hQeFucYxE7, active, API version2026-08-26.dahlia, snapshot style, this account only.
- Endpoint https://game04-git-work-game04-auth-billing-clo-927d89-kiyoshi-kitamura.vercel.app/api/billing/webhook .
- Events checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired.
- Deliveries0: registration is not successful delivery evidence. Stripe/API key + signing secret and current Supabase service-role key still need exact-branch Vercel configuration; sales remain closed.
- Stripe onboarding shows production payments activation not started. No production activation or financial operation performed. No GAME03 writes.
- Google attached screenshot explicitly shows no OAuth2 clients. Project provided game04-509906. Exact user URL still renders Site Unavailable in cloud browser. Browser cannot perform Google Cloud client creation; manual user setup required.
- Create separate Web OAuth clients GAME04-dev / GAME04-prod. Authorized redirect URI respectively https://znakrkaazliexzwihxge.supabase.co/auth/v1/callback and https://soiksqgtmcnspfedmanr.supabase.co/auth/v1/callback .
- Dev authorized JavaScript origins: https://game04-git-work-game04-common-preview-20260925-kiyoshi-kitamura.vercel.app and https://game04-git-work-game04-auth-billing-clo-927d89-kiyoshi-kitamura.vercel.app .
- Production origin https://sengoku-hime-ennbu.com .
- Use external audience/testing and designated tester Google account; scopes onlyopenid/email/profile. Do not publish application or game. Do not send Client Secret in chat or Git. Enter client ID/secret directly in matching GAME04 Supabase Google provider; dev provider/manual linking needed for real identity-link test. Production public/signup controls remain unchanged pending P06.
- PR37 latest ae587a7 remains already integrated; PR41 latest before this record ef070ed7, last independently verified code deployment b6cac2d. No shared UI/API bundle modifications.
