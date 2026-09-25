# G3 R8受領・v31保持差分統合

記録日: 2026-09-25 JST。G3未受入。今回の共有API/DB書込みは0。

## 受領と統合範囲

- G2受領SHA: `29b1515f677bb475cb22b956c9802b88f51c2411` / PR #30。
- G3 remote基準: `2d280db6104bbdcf1e6a06e9c6bab752312df24a` / Draft PR #33。
- 正本: G2 `docs/verification/g2-20260925/r8/CONTINUATION_RESULT.md`、`g3-v31-rooms.patch`、`g3-v31-rooms-source.ts.txt`。
- R7のv31配信本文保存・稼働一致の回収結果を受領。従来の「v31ソース未保存待ち」は解消。
- G2 b41までの統合済み本体を保持し、R8から必要なroomsFor 1差分を選択適用。R8通常source/bundle全体は取り込まない。
- `game04_raid_rooms_for_user` + owner profiles/stateの3読取を、既存read-only `game04_raid_rooms_with_owners` 1 RPCへ変更。owner名、先頭武将、既存visibility/order/expiry処理を維持。
- G3の正式プール、券user_items原子消費、台帳維持、JSONB再送、永続pending、JST、背景共通処理、計測候補は保持。
- `GAME04_SAVE_CONTEXT_RPC`、`game04_commit_deck_with_context`、context付きsave_deck処理・SQL・検証は本G3候補に含めない。G2の既定OFF性能候補はG3終了後にG2が扱う。

## 再現用hash

| 対象 | SHA-256 |
|---|---|
| R8 rooms patch | `cc3e796429c0f4ffe0d7ff9e61560ec3b6b014dc6116f1ca74f81f38c178c2fa` |
| 統合source / R8参照source（完全一致） | `d2a2b0adce5945df7c939e6c2f09c050e9e9239f6451647c89724f52c6850678` |
| 再生成index.ts | `a8aa1a9c88dc902121beae280db76a24e1fdf96e52930501ee5b0f271b30e92e` |
| rooms read-only SQL | `03c9af63134f42d5300c628408b3cee6da89a2f5175f1d84411440f7acbe0856` |

bundle: esbuild 0.25.12 / bundle / neutral / ESM、source hash banner付き。配信はしていない。
rooms RPCは既存devに適用済みであることをread-only確認。STABLE / SECURITY INVOKER、service_roleのみ実行、定義MD5 `79a06749b200a8e99db10c160213c7ad`。
同じSQLを分離環境の依存定義としてGit保存したが、既存devへ再適用していない。

## 限定検証

- R8参照sourceと現在source: byte/SHA完全一致。
- G2 default-OFF性能候補の識別子: source/bundleに不在。
- 正式domain、adverse、static98/98、measurement、pending helper、UI recovery、TypeScript: PASS。
- 実handlerのG2 parallel-read検査・G2_G3_CONTRACT: PASS。HTTP mockであり実接続受入ではない。
- `NEXT_PUBLIC_USE_MOCK_DB=true NEXT_PUBLIC_ENABLE_QA_TOOLS=true npm run build`: PASS、28 static pages。ローカルコンパイル検証でありAuth/DB受入ではない。
- 旧性能未達、JST実境界、本体再ログイン、離脱復旧、最終Previewの実接続受入は未解消。

## 前回remote保存不備の修正

前回 `2d280db6` へのblob転送で、単一base64出力の上限により次の3ファイルが各786,444 bytesに切り詰められていた。local完全原本は保持されていた。前回のremote保存完全性の主張を訂正する。

| ファイル | 正しい原本のGit blob |
|---|---|
| gate-background.png (1,429,781 bytes) | `6d5f381931182a0ee10d717a633b074986da5bf7` |
| gold-rays.png (1,572,751 bytes) | `5d32ccf3a84637c38f8f10bdd5dee80b8aec4c50` |
| index.ts | 今回rooms差分適用後の再生成版を使用 |

残る46ファイルは前回local原本とremote blobが一致。今回は393,216 bytes単位で転送し、create_blob応答のSHAとlocal Git blobの一致、最終remote treeの全差分blob一致を保存条件にする。配信API本文の破損を示すものではない。今回のAPI配信は0。

## 共有環境の確認と配信枠

- 今回のread-only確認: live `game04-redesign-api` version31、管理hash `70c20710ef9a7a36b103630cd67548da2fa62f314efa2d0797a482db11fb9c6f`。latest PR30=29b1515、PR33基準=2d280db6。
- R8記録が旧実行・子実行の終了不明と明記。コメント送信・稼働version不変・非idle query0を排他成立の証明にはしない。
- 受領・保持差分・排他未成立をPR33コメント `5829439777` に記録。
- **共有配信枠は未開始、終了・G2への書込み権引渡しも未発生。** G3は今回API/DB/stateへ書き込んでいない。
- 旧ブラウザー復旧・停止確認polling・同じ照会の反復は行わない。ユーザー指示に従い、DBも分離した環境案を具体化した。
- 分離案: [ISOLATED_ENVIRONMENT_PROPOSAL.md](./ISOLATED_ENVIRONMENT_PROPOSAL.md)。新設は有料リソースと組織の承認が必要なため未作成。

## 次の配信手順

1. 排他成立の記録を得るか、分離環境案の承認を得る。
2. 開始対象ref・担当・開始時刻をPR33へ記録。直前のversion/hash/PR30・PR33最新SHAを照合。
3. 対象の現DB定義との差分だけを適用。G3 KPI SQLと対応APIを同一候補として切替。G2保存性能候補と旧migration一括再適用を含めない。
4. 専用PreviewのSupabase ref・実装SHAを固定し、本体→認証API→DB→再ログイン、券/再送/交換/背景/KPI・性能を受入。
5. 終了時刻・最終API/hash/DB差分・証拠SHA・残件をPR33へ記録してG2へ引継ぎ。G3最終受入判断はメイン進行チャット。
