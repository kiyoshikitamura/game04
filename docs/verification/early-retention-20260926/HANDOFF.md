# GAME04 初期継続導線・承認済み実装引渡し（2026-09-26）

## 保存範囲と担当

- Repository: kiyoshikitamura/game04 / 統合PR #37。
- 開始時のリモート統合HEAD: `4e34bd88815dbf28c4f3ae5c773a7318d8bcbee4`。調査基準から巻戻しなし。
- 専用ブランチ: `work/game04-early-retention-20260926`。
- B03開始時: `f651539` + BattleView/RecordedBattleResult/recordedBattleMvpの未コミット作業。既存worktreeへ書込みなし。
- 引渡し前に確認したB03最新: `6740b25`。B03担当から QuestView/CSS、BattleView/module.css、RecordedBattleResult、recordedBattleMvp の担当を確認。API source.ts/DBを編集しない旨も確認済み。
- 本タスク: 初期マスタ・独立ガイド・状態・初期編成・戦闘補助・任務・API/DB候補差分。
- 共有画面/共有source.tsはGit保存時に変更しない。下記パッチを専用worktreeへ一時適用して検証し、戻した。B03 DESIGN.mdを変更しない。
- main、本番、GAME03、共有API/DB、共通Previewは変更/配信していない。

## 変更表

|対象|変更|
|---|---|
|ステージ|三河5・尾張5、全68面。既存ID/後続エリア数値保持。追加 mikawa-4 / mikawa-5 / owari-5|
|敵|承認数値を反映。再構成1-2〜1-5/新規2-5は通常攻撃のみ、passiveなし、初期SP0/上限100/被弾10/LUK0。正式武将属性・素材binding。指定ボスを明示|
|追加名|影走る古道／三河の勝鬨／桶狭間への道。表示Lv7/9/20。戦闘能力は承認固定値で、プレイヤー能力を加算しない|
|報酬|既存報酬を保持した追加初回報酬。竹中のみ1-2→1-3、所有済みは二重獲得/魂変換を行わない。通常報酬・EXP・券抽選・遭遇率は同エリア設定。新たな魂抽選なし|
|BURST|新規エリア1開始inputに版付きassistを保存。通常/skill行動獲得2倍・成功80%。上限400/200・BURST中獲得なし・5行動・半額を保持|
|編成|5枠は1-3へ。共有初期ロジックで推奨5スキル・所持装備を同時保存。育成済み別武将を優先保持。素材消費なし|
|ガイド|1-1加入/1-2装備を部品内保存、1-3/1-4は保留可。結果表示中は非表示。保存失敗で完了にしない|
|任務|NM066〜075へ各300無償輝石。新規 NM184=1-4、185=1-5、186=2-5、187=Lv5以上5人。既存ID/報酬/重複条件保持|
|DB|専用任務RPCで残高・通常付与履歴・受取状態を単一トランザクションに保存。補填専用台帳やバッチなし|
|既存進行|初回読込時に旧65面の解放・エリア達成・5枠を保存。追加IDと同名の古い履歴も削除せず、新追加面のclear/attemptを別記録|
|旧敗北案内|サーバー移行/戦闘決済でdefeatPending解除。画面削除は共有接続パッチに含む|

正式データファイル `quest65.json` の名前は参照互換のため維持し、中身の版/件数を68へ更新。旧生成スクリプトを無条件再実行して旧65面マスタへ戻さない。sourceHashesは元の監査資料の来歴。

## API/DB適用順（統合担当のみ）

1. B03最新成果を保持した統合ブランチへ本タスクの保存コミットを取り込む。共有画面は統合担当が編集する。
2. `supabase/manual/game04_early_retention_mission_rewards.sql` を対象の共有開発DBへ適用。service_role限定、RLS有効。既存growth RPC群を前提とする。新テーブルは通常の任務無償付与履歴であり補填台帳ではない。
3. `api-source.patch` の各hunkを共有 `supabase/functions/game04-redesign-api/source.ts` へ適用。競合時にファイル全置換しない。
4. source.tsと**更新済みdomain/master**からAPI index.tsを再bundleしsource hashを更新。古いbundleは本タスクで変更していない。DB→API→クライアントの順で揃える。
5. 共有画面に下記props/eventsを接続し、未受取テストユーザーで限定通し検証。既受取ユーザーへの遡及付与はしない。
6. 統合担当がB03のMVP/戦績/報酬開閉/バナーを375・390pxで確認した後、共通Previewへ配信する。本タスクから配信しない。

`api-source.patch`: 初回読込migration、正式保存input、旧snapshotの版対応、ガイド状態と報酬の同時commit、敗北pending解除、early_*操作、任務専用RPC。
`shared-call-sites.patch`: baselineに対する小さな呼出し差分。QuestViewのfree_diamondsラベルはB03が既に追加済みなので二重適用しない。B03画面に対しては必要なhunkを手で併合する。

## 共有画面への接続契約

### `EarlyRetentionGuide`

配置: RedesignAppのnotifications、ただしB03結果が閉じられた後だけ。

- `state`: APIが返した確定state。
- `battlePlaying`: QuestViewの再生中 + 共通battleの表示中。
- `resultOpen`: **B03リザルト確認中もtrue**。再生終了だけでfalseにしない。
- `save(action,payload)`: 既存 `action` を渡し、保存成功時にアプリ全体stateを置換。失敗はreject。画面を閉じるだけでは報酬を付与しない。
- `navigate('characters', options)`: `char_yuki_01`加入時は任意の武将/編成画面。火の薙ぎは `{characterId:'char_daimon_01',earlyLoadout:true}` を受け、下記共通planの確認/保存部品を表示する。汎用の高SPおすすめは使わない。
- `navigate('missions',{tab:'normal'})`: 既存任務パネルを開きノーマル任務を選択。特殊任務画面を新設しない。

B03 `QuestView` の `playing && settlement` は結果表示を含む。`次のステージ` / `ステージ一覧` がリザルトを閉じる際、先にresultOpenをfalseにし、その後ガイドを表示する。必要なら選択した次ステージIDだけ保持し、ガイド終了後に既存prepareへ進める。新規結果画面なし。

`early_guide` payload:

|guide|choice|処理|
|---|---|---|
|join-maeda|save|前田を現在部隊へ追加、4人編成を保存|
|equip-iwadan|save|前田にSKD009を装備・保存|
|join-takenaka|characters / later|完了して任意遷移 / deferred保存|
|equip-fire|characters / later|完了して井伊編成へ任意遷移 / deferred保存|
|missions|missions|遷移待ちを保存し通常任務へ。完了はまだ記録しない|

**必須任務遷移:** 通常任務パネルが実際に表示されノーマルタブが選択された後に `save('early_missions_opened',{})` を呼ぶ。再読み込みで `state.earlyProgress.missionNavigationPending` がtrueなら通常任務を再度開く。このack成功後にguideがcompleted。途中の通信失敗では完了扱いにしない。任務が既に表示中の間はguideを重ねずackのエラーを通常パネルで再試行できるようにする。

### `EarlySortiePreparation`

1-5の既存出撃準備内に `{state,save}` で配置。既存の出撃CTAは残し、利用を強制しない。火の薙ぎの遷移先でも同じ部品/`earlyLoadoutPlan`を使用する。選択内容を表示して `early_auto_loadout` 1回でサーバー再計算・保存。編成変更だけでguideの獲得報酬は動かさない。

スクロール所有者: guideはbody部分のみ縦スクロール、footerは固定。出撃準備部品は親の既存CanonicalDialog本文スクロールを使用し、出撃CTAを別footerに保持。

### 進行・既存表示

- `isQuestStageUnlocked` / `nextQuestStage` へ `state.earlyProgress` を追加で渡す。
- clear表示は `hasQuestClear(id,state.clearedStages,state.earlyProgress)`。旧履歴に同名追加IDが存在しても新面は未クリア表示。
- area攻略済は `earlyProgress.completedAreas.includes(areaId) || area.stages.every(hasQuestClear...)`。既存エリア達成表示を戻さない。
- HomeViewの背景選択にもearlyProgressを渡す。旧解放済み後続エリアの背景選択を閉じない。
- ボス・件数は最新 `QUEST_AREAS` から。三河最終は柴田勝家、尾張最終は今川義元。B03へ固定件数を追加しない。
- Reward.kind拡張のため、共有QuestViewラベル接続前の**単独ブランチ全体tscは不足ラベルで失敗する**。これはB03で追加済み/本パッチで用意済みの接続依存。独立moduleの検証と、パッチ適用状態の全体typecheck/buildは成功。

## 保存互換

`earlyProgress` は初回読込で旧進行から生成し、CAS保存後に使用する。削除/再発行しない。completedAreas、preservedUnlockedStages、deckSlotsは単調保持。追加3面の `clearedAdditionalStages` / `additionalStageAttempts` は元clearedStages/questAttemptsを消さずに新面の一回性と行動力を表現する。

旧開始済みinputには新assistを注入しない。旧 `APPROVED_QUEST65_ROUND17_20260922` のsnapshotは正式報酬抽選の旧経路を維持し、決済時も旧5枠/後続エリア解放を保持する。旧1-2の報酬に岩断が無いので新装備ガイドを強制しない。settled battleは保存結果を返し再計算しない。

## 限定検証

- `domain-results.json`: 68件/エリア3以降の全stage完全一致、素材/属性binding、guide、保留、migration、追加ID衝突、旧開始済み進行、既存任務ID、報酬/行動力。
- 各50seed（装備なし・未覚醒・LB0）: 1-1〜1-5全50/50。BURSTは1-1 49/50・他50/50。1-5 BURST最終撃破29/50。4人で1-4/1-5各50/50。
- 2-1 Lv1 7/50・Lv3 50/50。2-2 Lv3 0/50・Lv5 15/50・Lv10 50/50。参考値と一致し追加数値再調整なし。
- `api-results.json`: patched実Edge handler + 厳密ローカルtransport。初期3人から1-5、ガイド内save、任務ack、2-1に補助なし、client assist改竄無視、settled再送二重付与なし。
- `db-results.json`: PGlite PostgreSQL + 最小growth commit fixture。残高/台帳/受取状態の同時commit、注入失敗時rollback、同一再送、別request再受取拒否、queued競合一勝、旧エリア達成、権限。
- `browser-results.json` / PNG: 実独立React部品をagent-browser Chromiumで375x664/390x664。加入/装備save、保留reload、5人おまかせ、任意出撃、mandatory navigation保存、保存失敗保持。横溢れなし・guide CTA44px以上/画面内。
- 共有差分を一時適用して `tsc --noEmit` 成功。Next.js webpack build成功（29ページ生成）。最初はplaceholder URLとリポジトリ既定public URLが接続ガードに合わず失敗、現行GAME04開発refを明示して解消。接続設定ファイルは変更なし。
- SQLはSupabase / Postgresスキルのinvoker・権限制限・同一userロック順を確認。ブラウザーはagent-browser、React部品はhook順序/保存エラー/フォーカス移動/Tab制限を確認。

## 未確認・統合側受入

- 本体の共有画面にガイドは未接続。B03と同時に表示したリザルト→guide→出撃/任務の実通しは統合側作業。
- 共通API/DBは未適用。PGliteは単一接続のため、共有PostgreSQLの独立2接続間ロック競合、既存輝石期限/paid lotトリガーとの実結合は未検証。
- 未受取実テストアカウントで正式残高・無償履歴・既存報酬/所持履歴の確認が必要。既受取ユーザーの差額補填なし。
- B03の実MVP・戦績・報酬開閉・新最終ボスcropはB03最新との統合後に確認。部品/採点ソースを本タスクから変更しない。
- iPhone実機/共通Preview実配信での確認は未実施。全体バランス監査なし。

## 再現手順

`node scripts/verify_game04_early_retention.cjs`。DBは `EARLY_TOOLS` 配下に @electric-sql/pglite 0.5.8 を用意し `node scripts/verify_game04_early_retention_db.cjs`。

共有パッチ適用状態でsource.tsをesbuild 0.28.2 / neutral / esmへbundleして `.early-api.mjs` を作成し、`node scripts/verify_game04_early_retention_api.cjs`。本体index.tsへの書込/配信は不要。

ブラウザーは `EARLY_TOOLS` 配下に esbuild 0.28.2 / agent-browser 0.38.1、`node scripts/serve_game04_early_retention.cjs` → `node scripts/verify_game04_early_retention_browser.cjs`。検証fixtureのlocalStorageは正式保存ではない。正式state処理は同一pure moduleをAPI側でも検証。

### B03 6740b25への具体的な接続注意

現在のB03は `playing && settlement` の間、再生と同一BattleView内リザルトを保持する。既存 `onBattlePlayingChange` のtrue期間は結果確認も含むので、それをguide gateに再利用できる。ただし**onStartのAPI要求前**からgateをtrueにし、失敗時にfalseへ戻すこと。報酬stateの到着とplaying更新の間でguideが先に出ないようにする。結果CTAで既存表示を閉じてからgateを解除する。

`followingStage` のB03追加CTAにも `isQuestStageUnlocked(followingStage.id,state.clearedStages,state.earlyProgress)` を渡す（baseline向けパッチに存在しない新行）。area攻略済表示は旧completedAreasの維持も含める。レイアウト/MVP部品には触れない。

### 最新B03へのパッチ適合確認

`api-source.patch` はB03 `6740b25`に `git apply --check` 成功。baseline用shared-call-sites.patchはB03の報酬ラベル変更でQuestView hunkが不適合だったため、**`b03-6740b25-call-sites.patch`を別途作成して同SHAへのapply --check --ignore-space-change成功（既存Windows CRLF差を許容）**。統合時はこちらを使う。B03追加followingStage CTAへのprogress引数とAPI要求中のguide gateを含み、B03表示本体を置換しない。両UIパッチの二重適用は禁止。部品の配置/イベント接続は上記契約に従い統合担当が行う。
