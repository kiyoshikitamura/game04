# GAME04 G3 isolated candidate build

実行日時: 2026-09-25 18:25 JST（09:25 UTC）
Git作業基準: `81fc717ff635e9720cda5565b24b9ab8462b3cc2`（未コミットのG3隔離ref差分を含む）
対象Supabase ref: `znakrkaazliexzwihxge`

## 結果

隔離refの有効なmodern publishable keyをSupabase管理APIから取得し、鍵本文を保存・出力せず、次の環境でproduction buildを1回だけ実行した。

- `NEXT_PUBLIC_SUPABASE_URL=https://znakrkaazliexzwihxge.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<enabled publishable key; not recorded>`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=''`
- `NEXT_PUBLIC_USE_MOCK_DB=false`
- `NEXT_PUBLIC_ENABLE_QA_TOOLS=true`
- `NEXT_PUBLIC_APP_ENV=preview`
- `VERCEL_ENV=preview`

実行コマンド: `npm run build`
Next.js: `16.2.10`
結果: **PASS**。optimized production build、TypeScript、page data収集、静的ページ28件生成、最終最適化が完了した。

これはローカルcompile/buildの証拠である。Vercel deploy、Supabase Edge deploy、DB schema/fixture適用、認証付きHTTP、抽選、保存、再読込、ブラウザ再ログインは実施しておらず、**実接続受入ではない**。

## ガードと限定検証

build前に、G2既定OFF保存性能候補がG3 API source/bundleから除外されていることを確認した。以下はすべて出現0件。

- `GAME04_SAVE_CONTEXT_RPC`
- `game04_commit_deck_with_context`
- `projectRooms`
- `SaveResponseContext`

隔離ref準備中に実行した限定検証:

| 検証 | コマンド | 結果 |
|---|---|---|
| production build | `npm run build`（上記隔離環境変数） | PASS、静的28ページ |
| TypeScript | `npm run typecheck` | PASS |
| API bundle一致 | `node scripts/verify_game04_redesign_api_bundle.mjs` | PASS |
| G3正式domain | `node scripts/verify_game04_g3_formal_gacha.cjs` | PASS |
| G3 adverse | `node scripts/verify_game04_g3_adverse.cjs` | PASS |
| G3 static | `node scripts/verify_game04_g3_static.cjs` | PASS、98/98 |
| G3 measurement | `node scripts/verify_game04_g3_measurement.cjs` | PASS |
| URL分離契約 | `node --experimental-strip-types scripts/verify_game04_acquisition.mjs` | PASS |
| isolated live script構文 | `node --check scripts/verify_game04_g3_live.mjs` | PASS |
| 旧dev拒否 | isolated scriptを旧dev ref指定でpreflight | PASS（接続前に拒否、HTTP/DB書込み0） |
| whitespace | `git diff --check` | PASS |

## 候補hash

| 対象 | SHA-256 |
|---|---|
| `supabase/functions/game04-redesign-api/source.ts` | `35d31759e93e729aae8e27a95fedd9f917de4e9c4368f47389f9756f10ae3f4f` |
| `supabase/functions/game04-redesign-api/index.ts` | `e43232bfeb3eb2019c1c96ff707af60716bde3b3d8447ed136f7dfc6555cac8b` |
| `scripts/verify_game04_g3_live.mjs` | `2cf47f36554afca593bdc8ddc2a9a62501702d58326cd11cd7993a473aa27702` |
| `src/utils/supabaseUrl.ts` | `f4eb5b5ea585d5f5cc9a587b8995df094977f1c035d76c4a60d3f8c08c83df10` |
| `src/app/api/auth/game04-binding/route.ts` | `086948c582fd44a496d46188654e97d2fe3ab4ce15e7b8d40a769c3a6fb8af9a` |

API sourceとbundleは `source-sha256:35d31759e93e729aae8e27a95fedd9f917de4e9c4368f47389f9756f10ae3f4f` で一致する。API本体、クライアントURL validator、認証binding、隔離受入scriptはいずれも隔離refを明示し、旧devへのfallbackを持たない。

## 次の受入条件

隔離DB snapshot/runtime関数、G3 SQL、QA分類、専用paid-lot fixture、Edge APIを同一候補として適用後、`scripts/verify_game04_g3_live.mjs` のbootstrap/acceptance/reloginを順に実行する。publishable sessionは`/tmp`のmode 0600、fixture attestationはQA分類の直前readbackと対象user/ref/tagを必要とする。結果JSONへtoken/keyは保存しない。
