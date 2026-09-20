# GAME04 全面改修・統合記録

本書前半は初回配信の履歴。現在の追加実装・適用・未受入範囲は各追加工程と進捗JSONを参照する。戦闘共通ルールは9/20正本が旧SP・BURST・効果等の記述に優先し、今回の実装受入は `GAME04_BATTLE_COMMON_INTEGRATION_20260920.md` に分離する。

基準: `7369f3dbaf3ef454c33932df55ee308e0b7718cb` / `codex/game04-upstream-20260918`。
正本: docs/product の 2026-09-19 Planning / Implementation / Battle / Home / Quest / Growth / Raid。
対象DB: `lrgyllgzcdcphlbmkknc` のみ。GAME03およびProductionは変更しない。

## 差分分類

|分類|対象|
|---|---|
|KEEP|戦国素材、認証・プロフィール、既存資産、法務ページ、決済検証基盤|
|MODIFY|Home、Quest、Battle、育成、デッキ、Raid、VIPの権利接続|
|REMOVE（公開導線）|PvP・RATE・GvG、旧時間派遣、Guild/BBS/募集。旧DB・履歴は保持|
|NEW|6属性・個別HP・合計SPの戦闘、10エリア70ステージ、専用状態API、救援outbox|

## 永続化

- Migration `20260919123634_game04_redesign_runtime.sql` 適用済。
- 新しい8テーブルと3 RPC。ブラウザーからの直接更新不可。Edgeで利用者を認証し、サービス権限で更新する。
- wallet/行動力は既存usersをAuthorityとして共有。状態versionとRaid versionを確認し、競合更新を拒否。
- 戦闘開始時に行動力を消費し、seed/編成/敵を保存。通信再送で同じ戦闘・精算を再利用する。
- 旧所持資産の初回取り込みはUUID台帳で管理し、既存データを削除しない。
- `game04-redesign-api/source.ts` が編集元。配信する `index.ts` はesbuildによる単一bundle。

## 後工程・制限

- M8チュートリアル、M9商材・ガチャ・Economy・数値FIXは未実施。
- 旧ガチャ/Shopは既存基盤の開発表示。獲得イベント接続は下記追加工程で実装。正式な商材・確率・重複変換量は未確定。
- 新Mission報酬設計、旧Tutorial依存のコミュニティ利用条件、計測最終接続は次工程で統合確認する。
- 2026-09-19本流決定でUnlock個人Checkpointを削除FIX。除去実装・共有Lv参加の受入状態は下記M5-06工程で管理する。
- ランキング全般は初期リリース対象外にFIX。新ランキング軸の設計・実装は初期母集団から除外。
- Masterの能力・報酬・育成費・敵強度はPreview暫定値。60キャラ、50スキル、160装備、背景/Bossは既存素材を再利用。
- VIP30日権利・速度・Skip・検証済決済後の付与経路を実装。価格未FIXのため販売は無効。
- 最終実機確認は未実施。Repositoryの進捗JSONはランキング除外後の実装工程42件サブセット。ユーザー引継ぎの全体141件正本とは異なり、全体進捗率を算出しない。

実装別の検証記録は同ディレクトリ `GAME04_REDESIGN_*_20260919.md` を参照。

## 初回配信検証

- 実装commit: `93d25673202b1e43297bae338ddfc8033aa8d5f6`
- `npm run typecheck` / `VERCEL_ENV=preview npm run build`: PASS。
- dev実API: 初期化→Quest勝利→同一requestId再送→Unlock Raid作成→Raid勝利 PASS。
- Edge `game04-redesign-api` version 2 / verify_jwt=true。
- ローカルBattle core・Raid・育成検証、およびDB rollback内CAS/冪等/VIP検証 PASS。
- 決済reconciliation単独旧スクリプトは拡張子なしimportのNode解決エラー。実決済は行わず、型・Buildと既存検証済注文経路のコード確認まで。

## 確定残件接続（2026-09-19）

監査基準: `137c3eccfb6c66a2a001096900e2edee7dc63b37`。

- M5-06: Checkpointによる個人制限を除去し、共有Lvの個別敵で戦う。3勝資格・非遡及・旧Lv結果の精算を保持。
- M9-03: 旧所有スナップショットと新獲得イベントを分離。UUID更新型重複をreceiptで捕捉し、新所有と適用台帳を同一CASで保存。
- M4-06: Mission条件評価・サーバー受取・UIを接続。正式Masterは空/無効で保持。
- MS-03: Login/Present等の受取後に新所有状態を再取得。明示された新Masterの取得経路をイベントへ接続。未定義の旧Item変換は行わない。

### 適用・検証の現在地

- 型検査・Build: PASS（統合担当確認）。
- GAME04 dev Migration `20260919144247_game04_acquisition_events`: 適用済み。
- Edge `game04-redesign-api`: version 3 ACTIVE / verify_jwt=true。
- ローカル: Raid共有Lv14、WIN/LOSE、3勝、非遡及、旧Lv精算、取得冪等、Mission Fixtureを確認。
- dev実API: Raid Lv14途中参加WIN/LOSE・再送、3勝資格・非遡及・旧Lv精算・Lv15強化・2参加者並行精算/claim PASS。8戦のうち4戦は開始済み保存fixtureからのAPI再開。全Lvバランス・実ブラウザ中断再現ではない。
- 今回のPreview: 実装commit `f75a341cda872f043a3ef564f333e09f7f9f9988` をVercel success確認。既存branch URLでroot TAP TO START、`/qa/redesign` Home/Raid表示を確認。
- M5-06はPreview反映済。M9-03/M4-06/MS-03は接続範囲のみPreview反映済。正式Master承認・全体完了とは分離する。
- 追加2テーブルのAdvisorはINFO RLS no policyのみ。service-only / browser revokeを意図したもの。

全体141件・未FIX/正式承認待ち35件はユーザー引継ぎ申告値。確認したRepository/Libraryでは141件全行の正本所在を確認できていない。旧Excel43件/74.4%や現JSON42件を全体率へ流用しない。詳細は `GAME04_CONFIRMED_REMAINDER_HANDOFF_20260919.md` と進捗JSONの `taskUpdates` を参照。

Preview追加確認: `/qa/redesign` の任務中央Dialogで内部スクロールを確認（`.rd-modal-body` clientHeight 682 / scrollHeight 953、overflowY auto）。末尾「達成報酬準備中」へ到達。既存スクロール修正を保持。

取得接続のdev実API: 6イベント（新規キャラ1、重複魂20、Skill素材2、装備個体2）の正確な取込みと後続読取での二重付与なしを確認。並行get_stateの片方はDB REST上流の非JSON応答で400となったため、並行HTTP受入は未PASS。Missionは正式Master空・不正claimの400拒否まで確認し、有効Missionの実API受取は未検証。

Present実API最終確認: Character/Skill/Equipment各2個を各同時2claimし、各組[200,400]で一方のみ成功。取得検証累計12イベント、新規キャラ+1・魂+40・Skill素材+6・装備個体+4で再取得結果完全一致。無効Mission claim400後もstate不変。`GAME04_ACQUISITION_ACCEPTANCE_20260919.json` に証跡を保存。有効Mission実API受取・Login全日程・実ガチャ抽選は未検証。並行get_stateの一方が上流非JSON400となるKnown Issueは残存。暫定的な上流応答異常であり、CAS競合409とは異なる。

## 2026-09-20 領土侵攻の仕様追加（実装なし）

新正本：`docs/product/GAME04_TERRITORY_INVASION_AUTHORITY_2026-09-20.md`。TI-01〜05を未着手として追加。M5-06/M9-03/M4-06/MS-03の既存実装報告は維持し、新機能の実装完了と混同しない。今回の差分は文書・進捗データのみ。

上段は仕様追加時の履歴。領土侵攻はその後、実装 `a743043`／Preview確認 `f539ba0`／記録更新 `06a9bd8` で限定受入を反映済み。DB Migration 20260919151837／20260919152135、Edge v5。詳細は `GAME04_TERRITORY_IMPLEMENTATION_20260920.md` と進捗JSON `territoryUpdates` を参照する。

## 2026-09-20 戦闘共通ルール完成版の接続

作業基準 `06a9bd8953ab02a475d58abe4efe9e9ee9dde2fc`、正本統合 `9c24e211eeab98030994001078dfcf83f5140f26`。最優先正本 `docs/product/GAME04_BALANCE_AUTHORITY_V1_2026-09-20.md` を使用する。

キャラSP合算→共通SP400、独立バーストゲージ200、装備枠順、条件・効果・敵連続行動・死亡蘇生・Wave保持・300行動上限を対象に実装着手。開始済み戦闘の旧ルールと領土侵攻・報酬等の既存成果を保持する。正式数値は未FIXのままとし、戦闘ルール実装／UI接続／Preview受入／正式数値・バランス受入を分離する。

本工程のSHA・検証・DB／Edge・Preview反映は `GAME04_BATTLE_COMMON_INTEGRATION_20260920.md` と進捗JSON `battleCommonUpdates` を参照。過去のM2配信履歴を新ルールの受入実績に読み替えない。

### 戦闘共通ルールの適用・限定受入結果

実装／Preview SHA `b8675e16c325166ae9ff1215eef2795c0017edc9`、Vercel success。GAME04 dev専用Migration `20260920082351_game04_common_battle_v2_master.sql` とEdge v7を適用。現在のterritory masterのみ仮版へ更新し、既存14開催snapshot・旧保存戦闘・進行は保持した。型検査・Build・24新検証群と3既存回帰がPASS。Quest新規v2の同request並行・旧保存互換、Raid個別WIN/LOSE・3勝非遡及・旧Lv精算・次Lv敵強化、360pxの別SP/ゲージ・中断・詳細ログ・300行動残数を限定確認。

BC-01〜03はPreview反映済（限定受入）、BC-04正式数値・バランスは未FIX。多人並行の今回v2回帰・全Lvバランス・物理実機は未受入。raid_claim同一request再送でも材料・銭・適用台帳が一致し、全grant受取済みを確認。詳細は `GAME04_BATTLE_COMMON_INTEGRATION_20260920.md` を参照。GAME03・Productionは変更していない。
