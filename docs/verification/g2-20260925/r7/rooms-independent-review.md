# rooms投影 独立レビュー

対象: `game04_g2_raid_rooms_with_owners.sql` と実API v29へのJ0単一hunk差分。

判定: 限定レビュー阻害なし。DB/API適用・性能判定は別工程。

- SQLは既存 `game04_raid_rooms_for_user` の結果だけを入力にし、可視条件を拡張しない。WITH ORDINALITYと集約ORDER BYで順序維持、state/versionをそのまま返す。
- users.id / player_state.user_idの一意キーへのLEFT JOIN。owner不在でもroomを落とさない。ownerName nullは旧participant名へfallback、空文字は旧どおり保持。leader不在/未知IDは旧どおりportrait undefined。
- STABLE SECURITY INVOKER、PUBLIC/anon/authenticated実行REVOKE、service_roleのみGRANT。更新文やauth迂回なし。既存rooms_for_userも保存migration上SQL STABLE INVOKER。
- API差分はJ0内の依存読取集約のみ。auth、stateFor、再送確認、commit、G3抽選、territoryContext順序は未変更。状態更新を並列化していない。
- `verify_g2_rooms_projection.cjs` を独立再実行: PASS。旧/新実J0のroom順序、version、空配列、owner欠損、空名、未知leader、他participant、expiryを同値比較。
- `verify_g2_r6_parallel_read.cjs` をlive-v29-rooms API層で独立再実行: PASS。保存、再送、auth失敗、読取失敗、CAS、G3 status/replay payload契約を保持。
- candidate hash確認: `b6348a7d5879b6c56d2e9db7ac5a12371887b3afd35a1400fc26000c147929bf`。

旧rooms取得→owner2読取のHTTP依存1段が減る。画像、保存原子性、権限を緩和する変更はない。実測の改善量・1秒/1.5秒適合はここから推定しない。適用後のRPC・ACL確認と同条件20回測定を親へ委譲。

## v30へ基準更新した再レビュー

G3の後続API v30が検出されたためv29候補の配信は中止。v30の正式券`user_items`読取、payload正規化等の後続成果を保持してroomsだけ再適用した。

- 原本v30→整形の全AST（識別子/リテラル/構造、構文括弧を除外）一致。共通hash `c77160865fd220d86018e6c20773ef3a636a7ba64ce5613169a64e38f165b95d`。
- 整形v30と候補でta（rooms投影）以外の全文byte一致を独立確認。
- v30候補hash: `59e497ae9278ba1108ed3a31f510bd4d266eac6535c815bc5f26692f29eac215`。
- `G2_ROOMS_BASE=live-v30.pretty.ts.txt G2_ROOMS_CANDIDATE=live-v30-rooms.ts.txt node scripts/verify_g2_rooms_projection.cjs` PASS。
- `G2_API_BUNDLE_VERSION=30 G2_API_BUNDLE=1 G2_G3_CONTRACT=1 G2_API_SOURCE=docs/verification/g2-20260925/r7/shared-api/live-v30-rooms.ts.txt node scripts/verify_g2_r6_parallel_read.cjs` PASS。minify後の最新domain関数名を試験doubleへ対応、実APIの新券user_items読取はHTTP空配列fixtureで通した。候補へmockを混入していない。

v30再基準化にも独立レビュー阻害なし。実配信前の稼働版確認は引き続き必須。
