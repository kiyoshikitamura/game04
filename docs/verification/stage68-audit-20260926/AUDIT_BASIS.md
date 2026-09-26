# 監査基準・適用経路

対象は kiyoshikitamura/game04 の全68面。開始時の台帳 b958bbf9e0da58e72e5d396662b035aaae4effb4、ユーザー報告配信67e4ffcを引き継ぎ、作業中にPR #37の d804d2a7a2573e554d4227720d701b675c5abf00 へ追従した。専用ブランチ `work/game04-stage68-audit-20260926`。main・本番・GAME03・共通Preview・ユーザー状態への書込みなし。

## 出典と優先順位

1. 現行の承認済み追加方針: エリア1/2各5面、初期加入と技配布、エリア任務300無償輝石、attack-free-v1-20260926 BURST。実装根拠は `docs/verification/early-retention-20260926/HANDOFF.md`、既存 `GAME04_DEVICE_DEBUG.md` のDBG-035承認記録。
2. `src/domain/redesign/data/quest65.json` は旧名のまま68面。version `game04-quest68-early-retention-20260926`、counts 5/5/5/5/6/6/8/8/10/10。
3. 旧正式正本 `GAME04_MASTER_AUTHORITY_LATEST_2026-09-21.md`、戦闘/育成正本、round17承認記録、`round17_effective62.json`、`endgame_approved_handoff.md`。3-1以降58面の敵設定は画像を除き旧承認表と完全一致。最初の10面は新承認上書きであり、旧65面表と一致させて戻してはいけない。初期上書きの独立した数値原票は本監査で新しく捏造せず、実装・承認ハンドオフを出典とする。
4. 元攻略ガイドは15dcbe1基準、敵Lvからの育成目安で実戦未検証と記載されていた。全文を `evidence/guide-before.md` に保持。これを過去の合格証拠として扱わない。

## 実際の配信

- 共通Preview: https://game04-git-work-game04-common-preview-20260925-kiyoshi-kitamura.vercel.app/
- 公開識別情報: commit `19c8f285b53c634a954f6f721ef2eaa6b04ab933`、deployment `dpl_3Dsf2ZNLBJsqiG1PJFh1HdfUL3E6`。記録は `evidence/live-deployment.json`。
- PR最新d804d2aとの差分は台帳。b958bbfからの差分に正式数値・戦闘計算の変更はなかった。
- Supabaseプロジェクト `znakrkaazliexzwihxge`、API `game04-redesign-api` v8。実際の配信バンドルを読取り保存。SHA256 `4d4da4b6cc847df8b9833c79b2afec19631ae8ee93edf603d2ac4a20733cebe1`、配信バンドル先頭のsource hash `54d3e0e5d000cd9064d4eb25894df16f1839e4d1851b658b7eb677d93b3b0266`。リポジトリ内の保存済みindex.tsとはバイト不一致。保存index.tsをそのまま再配信する運用は不可。
- 配信バイトをVMで実行し、認証・状態取得・保存通信をメモリ内で代替、保存直前に停止。68面の入力を現行 `createQuestBattleInput + buildBattleParty` と完全比較して全件一致。戦闘入力・固定報酬・プレイヤーEXP・スキル/条件/パッシブ・全派・状態/形態設定・ルールを含む。APIへ実戦を書き込んでいない。
- 表示は `QuestView.tsx → QUEST_AREAS/QUEST_STAGES → FORMAL_QUEST_STAGES` の共用経路。画像だけ明示バインドで解決される。68面のiPhone表示や演出を実機で全件確認したという意味ではない。
- `quest_battle` は正式バンドルのステージを取得し、現行ルールと入力snapshotを保存。既存戦闘は保存inputを再利用。勝利報酬は保存snapshotと `questVictoryRewards` で計算。初回0、初回失敗後再挑戦1、クリア後は各面設定の行動力を使用。

## 配信事故と区別する不一致

DB `game04_redesign_master.quest65` は旧65面・round17版のまま。missions行もFORMAL_MASTER_PENDING、release_manifestも旧表記。SELECT結果は `evidence/read-only-basis.json`。現在のクエスト戦闘はこの旧行を参照しない。任務も `source.ts: missionConfig()` が `FORMAL_MISSION_CONFIG` を返す。したがって「DB65だからAPIも65」「DBG-047は古い敵が配信された」は誤り。

限定対応として本監査の適用経路・保存ハッシュを追加した。共有DBの保存行や配信生成物を無断同期しない。統合担当は次回の承認済み配信時に、最新sourceからbundleを再生成しハッシュを保存、保存行がアーカイブか配信用かを明記する。未確認の旧index.tsを正本扱いしない。

## 検証の限界と判定

各面の固定編成を現行エンジンで60または200seed実行し、不安定だった7-8/8-3は別200seedを追加。探索seedと採用後評価seedを分離。結果全体のSHA256を保存し、固定seedを再実行して完全一致を検査。最低育成値の全探索ではない。

観測勝率95%以上を本監査の「安定目安」とする。ただし入手保証・真の勝率・全編成での成立を保証しない。技の除外比較は複数支援を同時に外す比較、属性比較はLBも変わるため、単一要因の因果検証ではない。

到達条件はその面より前の確定加入/配布、通常ガチャ抽選可否、魂保証周期、育成費、前面周回を分離。現在面の初回報酬を費用原資に含めない。育成費はLv1から当該編成までの総額で、連続プレイ全履歴の消費台帳ではない。列挙した固定供給との差は最低不足額ではなく、日次任務等の未計上収入・過去消費で変わる。抽選依存品が未所持なら「攻略成立済み」と案内しない。
