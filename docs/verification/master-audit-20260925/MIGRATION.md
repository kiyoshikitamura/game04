# G5統合・M本番移行時の照合手順

## 基準の扱い

本監査はPR30 `29b1515` とv31/devに対するもの。`approved-values.json`はID/各値を保持する比較正本であり、現在のDB全体を承認したdumpではない。runtimeには実APIから確認できた正式値、localOnlyにはログボ/販売/交換/旧アイテム等のローカル定義、tutorialGrantにはPR34の最終付与契約を分けている。新しい承認がない限り比較の期待値を実測値へ自動更新してはいけない。

`observed/`は取得時点の証拠。現状はSTOPが正常。namedAssetSkillIds不足とinvasionMasters旧定義、G4/G3/Pの未受入を隠さない。差分450はJSON位置単位であり、450件のマスタ欠落という意味ではない。

## G5候補で一度行うこと

1. 作業SHA、G2/G3/G4/Pの採用SHA、配信対象project、API version/管理hash/本文SHA256、取得日時を記録する。G2通常bundleを単独配信しない。G3正式sourceに必要なG2差分を統合して再生成する。
2. `git diff --name-status 29b1515f677bb475cb22b956c9802b88f51c2411 <candidate>` と `node scripts/master-audit/verify-source.cjs` で監査後の変更を抽出。146ファイルのhash差を全件再調査に戻さず、影響するmaster・経路・SQLだけ再照合する。新規ファイル/削除/参照先変更もgit diffで確認する。
3. `node scripts/master-audit/runtime.cjs /tmp/game04-candidate-runtime.json` でローカル実定義を採取する。正式ガチャ定義がnullならG3未統合。compare.cjsでapproved-valuesの対象項目と比較し、無断のID削除/数値変更を止める。
4. MA01をG2/G4で統合：初期R3体/技能3件・Lv1/覚醒LB0・装備なし・承認どおりの段階付与/自動編成・重複なし。G4演出の模擬戦固定値を通常戦闘へ移さない。初回Homeログボ抑制と2回目以後の実付与をDBの自動login処理へ接続する。既存player_stateの初期化・削除・黙示換算はしない。
5. MA02/03 SQL候補はG2/G3の共有更新枠が成立した担当だけが適用する。ファイルはBEGIN/COMMITを含み、取得旧JSON一致が崩れれば例外停止。既に別担当が修正した場合も自動再試行せず新旧差分を確認して不要候補を撤回する。新環境への初期投入用SQLではない。過去migration一括再適用は禁止。
6. 適用後に正式技能1件の新規付与→event→stateと、侵攻新規開催snapshotのdamagePolicy/実HP基礎を対象限定で受入。旧開催snapshot・既存ユーザー資産の差分がないことを確認する。ユーザー資産修正が必要ならmaster変更と分離して報告する。
7. G3の券/通貨/ポイント/交換の同一候補受入結果、P担当の120日期限/派生lot/VIP実ジョブ結果を採用する。未配信候補のローカルPASSをlive受入へ置き換えない。

## M実環境の値を採取する

- `readback.sql`のSELECTを対象projectを明示して実行し、`[{key,status,data,...}]`を`masters.json`、billing結果を`products.json`へ保存する。秘密鍵・ユーザー行は取得しない。
- `node scripts/master-audit/normalize-db.cjs masters.json products.json evidence/database.json` を実行。空/不足keyは停止。正規化で画像を除外するのはDB quest65のimageだけで、実API表示値は別途そのまま比較する。
- `supabase get_edge_function`相当の管理読取で実際の配信本文とversion/hashを取得する。**repositoryのbundleをlive証拠としてコピーしない。** v31は次で値抽出できる：

```sh
node scripts/master-audit/live-v31.cjs captured-index.ts evidence/runtime.json
```

- v31以外ではこのadapterはhash不一致で止まる。G5で採用した新bundle用に、同じdomain定義・純粋関数を参照する抽出adapterを作り、旧v31と変化した項目だけ対応を確認する。hashチェックを削除してminify変数を推測してはいけない。新規ガチャ/侵攻等の保存inputについてはG3/G2の実接続証拠を再利用する。
- `metadata.json`にsourceSha、verifiedSourceSha、apiVersion、apiSha256、databaseProject、capturedAtとintegration各項目の受入結果を記録する。booleanの書換えだけで合格にしない。対応する担当PR・証拠SHA・限定受入記録を添える。
- 現在のAPIはdev projectを固定している。本番/分離DBへの接続差分はP/G3担当の環境別設定として照合し、dev用bundleをそのまま本番で使わない。今回は本番projectへアクセスしていない。

```sh
node scripts/master-audit/verify-authority.cjs
node scripts/master-audit/verify-candidates.cjs
node scripts/master-audit/test-compare.cjs
node scripts/master-audit/verify-tutorial-grant.cjs post-tutorial-state.json
node scripts/master-audit/verify-snapshot.cjs evidence
```

`verify-snapshot`は期待runtime/DBの各ID・各値を比較し、差分JSONと終了値1を返す。未取得の値をローカル期待値で埋めて通してはいけない。RPCはobserved/rpc.jsonと変更差分比較し、トリガー定義・player EXP100行・canonical18アイテムの意味値も対象項目が変更されたときに再照合する。変更のない項目の再調査・全戦闘再試験は不要。

## 停止条件

- 取得project/API版/hash/SHAが不明・不一致、採取中に版が変更され同一候補と証明できない。
- 期待table/key/ID/効果/参照先が欠落、重複、空、旧IDへ置換、数値が異なる。同件数でも停止。
- 正式72技能/60武将/160装備/65面/356敵/197任務/292ガチャ行を満たしても、IDまたは値差があれば停止。
- 新規正式経路で旧release_manifest/旧gacha pool/空missions/UNCONFIGURED EXP/仮初期付与が優先される。
- 新規侵攻が実HP方式でない、同時主催2/3枠へ復帰、DM005以外への日次令復帰、JST/結果日ルール変更。
- 初期付与/ログボ/G3/Pの統合受入が未確認。監査済みbaseから変わったファイル・RPC・seedの影響が未確認。
- 既存所持・育成・進行・開催snapshotを変える差分がmaster修正に混ざる。
- SQL候補の旧値前提不一致、またはschema/権限/適用順未確認。旧値を強制上書きして進めない。

全てのSTOPが根拠付きで解消された候補のみメインへ提出する。本手順自体は本番変更・mainマージ・一般公開の指示ではない。

`verify-tutorial-grant`は専用統合アカウントのチュートリアル終了直後・ログボ/出陣前のサーバー保存stateを入力する。個人stateはGitへ保存せず比較結果だけ保持する。後続の報酬取得後stateとの比較は行わない。
