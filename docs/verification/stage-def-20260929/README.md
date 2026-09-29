# Stage 3-1 / 3-5 DEF adjustment — 2026-09-29

User approved proposed values and Production deployment with an in-game notice at 14:29 JST.

## Baseline and scope
- Production frontend: f2b13dd4b7225766362cbe80087b08e65738469d / dpl_Bsjb4kGpKQrmHjCTiBfUbo99Z2wc.
- Main was not used as the release baseline.
- Production API v11 body exactly matched the baseline repository index.ts before changing it.
- Existing event, promotion, artwork and other baseline changes retained.
- 3-1: 鍛冶師 and 直江兼続 DEF 1140 -> 850.
- 3-5: 鍛冶師, 戦巫女 and 織田信長 DEF 1640 -> 1300.
- All 68 stage JSON records compared: exactly five DEF values changed. HP, ATK, skills, drops and other enemies unchanged.
- Existing saved battle snapshots retain their initial values; subsequent battles use the updated master.

## Validation
- npx tsc --noEmit: passed.
- API bundle rebuilt with esbuild 0.25.10 and dependency integrity check passed (63 inputs).
- Resolved getQuestStage data confirmed the five new values and unchanged supporting enemies.
- Repository files changed: quest65.json, generated API index.ts and bundle-manifest.json.
- No claim of full-repository lint or live player win-rate testing.

## Release
- Code: 8af27588dc665b5a0d142da95571490405915de8.
- Branch: work/game04-stage-def-20260929.
- Preview receiver: dpl_Ea1igeYSJwh8ymjkXroNSjd1Z8tY; build successful.
- Production Supabase soiksqgtmcnspfedmanr: game04-redesign-api v12, verify_jwt=true. Retrieved deployed body exactly matches the saved release bundle.
- Bundle SHA256: 3c463b981d8a2cfa36c9c5849b5c833df1c5cbe984e108c6a5e63590b01d0a3f.

- Production frontend: dpl_7ebtaKZrWeuUXtt3sHesmVvYy59k, Ready on 2026-09-29 14:40:50 JST.
- Rebuilt with Production environment and build cache disabled. Domain sengoku-hime-ennbu.com assigned; public title renders after reload.
- In-game news id 20260929142928 published at 14:40 JST; authenticated role SELECT verified.
- Existing announcements retained.

## Published notice
【アップデート情報】
いつも『戦国姫艶舞』を遊んで頂きありがとうございます。
以下のアップデートを行いましたのでお知らせします。

・ステージ3-1／3-5のエネミーのDEFを下方修正
