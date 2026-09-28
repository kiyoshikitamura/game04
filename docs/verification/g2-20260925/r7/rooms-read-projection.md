# rooms所有者投影の1往復化候補

2026-09-25。親が保存性能追加改善として承認。実装候補のみ、DB/API配信は親が管理。

## 変更

- `supabase/manual/game04_g2_raid_rooms_with_owners.sql`: 新規STABLE SECURITY INVOKER RPC。service_role専用、PUBLIC/anon/authenticatedはREVOKE。既存rooms_for_userの抽出条件を再実装せず、その結果をWITH ORDINALITYで保持してLEFT JOIN。返す追加情報はowner usernameとleader characterIdのみ。
- G2 `source.ts` のroomsForを同RPCへ接続。owner画像変換、username null fallback、非owner参加者、期限のJS判定は従来同じ。
- G2 `index.ts` はesbuild 0.25.12（bundle/platform neutral/format esm/target es2022/minify）でsourceから再生成済み。共有API配信には使用禁止。
- live API v29を取得し `shared-api/live-v29-original.ts.txt` に保存。`live-v29-rooms.ts.txt` はJ0（roomsFor相当）だけ1hunk変更。G3とG2並列読取・auth・CAS・再送・保存/抽選本体を保持。
- 候補SHA256: `b6348a7d5879b6c56d2e9db7ac5a12371887b3afd35a1400fc26000c147929bf`。
- G2 source/indexはG3を含まないため、それ自体を共有APIへ配信しない。配信候補はlive基準写し。配信直前の新版確認が必要。

`game04_territory_context` はprogress初期INSERTを含むVOLATILE関数なので変更せず、statePromise後の従来順序を維持する。

## 限定確認

- `node scripts/verify_g2_rooms_projection.cjs` PASS。旧/新J0をそのままVMで実行し、room順序/version・空集合・欠損owner・空名・未知leader・他参加者保持・expiryを同値比較。従来3 HTTP→新1 HTTP（空集合は従来も1）。
- `G2_API_BUNDLE=1 G2_G3_CONTRACT=1 G2_API_SOURCE=docs/verification/g2-20260925/r7/shared-api/live-v29-rooms.ts.txt node scripts/verify_g2_r6_parallel_read.cjs` PASS。既存mockへ新RPCの空配列応答のみ追加した。
- live DB read-only CTEでQA-Bの既存rooms5点をJOIN候補投影し、旧別SELECTのusername/leader値・rooms順序と全て一致。欠損owner名0、欠損leader0。ユーザー名や所持詳細は証拠に保存しない。
- DB検証はまだ新RPC適用前のSELECT同値試験。適用後RPC/権限照合・実保存性能20回は別途必要。改善量を事前合格にしない。

副作用/権限/原子性の独立レビューをapi_recovery担当へ依頼済み。

## v30再基準化（配信候補の更新）

親の配信直前確認でG3がlive v30へ進行。v29候補は配信しない。親が取得した `shared-api/live-v30.ts.txt`（SHA256 `c5e397fb8f33014647032a258be23779bdda361ee4e6a1d342655cd2e8722fc2`）を再整形し、rooms関数taの1hunkだけを変更した。

- 新候補 `shared-api/live-v30-rooms.ts.txt`
- SHA256 `59e497ae9278ba1108ed3a31f510bd4d266eac6535c815bc5f26692f29eac215`
- patch `shared-api/live-v30-rooms.patch`
- G3新券user_items接続等v30後続を保持。関数名の変化（rooms ta / DB _e / portrait su）に対応。
- `G2_ROOMS_BASE=live-v30.pretty.ts.txt G2_ROOMS_CANDIDATE=live-v30-rooms.ts.txt node scripts/verify_g2_rooms_projection.cjs` PASS。元コードの関数を動的抽出して同値比較。
- 親がDB新RPCを適用後、実RPC SELECTでQA-Bの5roomsと旧RPC順序/状態/version、owner名、leader全一致。EXECUTE権限はanon=false、authenticated=false、service_role=true。
- v30原本→整形とG3保持、最新API層mock adapterを含む独立確認をapi_recoveryへ再依頼。旧v29 mockの識別子をv30へそのまま流用しない。

APIは本担当から未配信。配信・実性能は親の最終記録を参照。
