# G2 子C U04/U06 実装記録

基準: `e62d3894b54ce70aede4a23a8fc2599c40b744da`。共有作業tree、commit/API反映/配信は親が集約。G2判定を代替しない。

## 根拠

- AGENTS.md、GAME04_BATTLE_AUTHORITY_LATEST_2026-09-21.md。
- docs/product/master_sources_20260921/numeric.md: SKD039/040/068は共通単体回復条件、SKD070はDOT対象優先と条件付きfallback、Passive初期値。
- docs/design/battle/2026-09-24/BATTLE_UI_ASSET_MAPPING.md: 画像decode完了ゲート・失敗再試行・snapshot保持。
- docs/design/battle/2026-09-24/IMPLEMENTATION_HANDOFF.md: モード別SKIP制限、記録frameと演出同期。
- territoryPresentation.ts の中間は承認済み12段階の第6段階を算出。仮数値を確定化したのではなく、実値に不正確に付いていた「仮」表示を是正。

## 是正台帳

|ID|Q/U|画面/状態|原因・修正|局所検証|統合受入|
|---|---|---|---|---|---|
|C01|Q01/U05|侵攻一覧→詳細→再訪、画像失敗|new Image全件待機に上限/decode/成功cacheなし。既存battleAssetPreloadの12秒上限とdecode/cacheを共用し成功再利用、失敗は再試行可能。loader非表示による失敗隠蔽はしていない|cache重複/失敗→成功テストPASS|本体実測待ち|
|C02|Q01/U04|戦闘Wave/phase素材切替|cache済みでもloadingへ遷移。成功decode状態を同期参照し既読画像ではloading dialogを出さない。未読画像では従来どおり再生停止・画像待機|cacheテスト/recorded projection PASS|実再生計測待ち|
|C03|Q03/Q04/U06|共闘敵情報|主敵だけ表示しATK/DEF欠落。開催snapshotの全敵（護衛含む）Lv/HP/ATK/DEF/開始SP/上限/カウント/所持skillへ接続|型確認|本体Dialog待ち|
|C04|Q03/U06|共闘出撃準備|敵Lvに共有進行段階を表示。raidEnemyの実戦敵Lvへ変更。ownedCharactersを渡し覚醒済み未装着枠が未解放になる不整合を解消|型確認|本体→編成→帰還待ち|
|C05|Q04/U06|共闘報酬|正式masterの個別勝利報酬を未表示、空参加報酬を表示。個別勝利報酬と基本抽選率を表示、参加報酬がある場合だけ初回案内を表示|型確認|実保存照合待ち|
|C06|Q04/Q06/U06|侵攻中間・共闘用語|正式stage6の中間に「仮」を付けていた表示を除去。主見出し/帰還/退出を共闘へ統一|導出関数確認|モバイル比較待ち|
|C07|U01/U04|SKD068回復+shield|effect.someにより健康時もshieldだけで発動可能。新規formal master生成の条件を味方HP<=50%へ限定。39/40も同helperへ条件集約。既存snapshotは更新しない|十分なSPを貯めた健康な味方がSKD068を使用しないsimulation PASS|親API配信・実入力待ち|
|C08|Q03/Q04/U04/U06|敵skill説明/Passive/非対応旧skill|新規formal skillの説明が内部ID/LBのみ。正本の対象・効果量・持続へ変更。公開Passiveの開発仮値注記を除去。非対応旧skillのみ理由を短文表示、旧資産は保存保持|型確認、正本数値|本体表示待ち|
|C09|Q05/U04|正式SKD画像欠損|空画像URLも既存の効果種別SVGフォールバック対象へ。空srcの追加ページ要求を防止。72画像不足そのものは未解消としてU01へ維持|ソース確認|素材採用待ち|
|C10|U06|共闘準備→編成帰還|RaidView onOpenDeck(roomId,level) と initialPreparationLevel を追加し親Appが同じ部屋/段階の出撃準備へ戻せる契約を実装。処理中Dialog閉じる操作も抑止|型確認|親統合・本体待ち|

## 検証

- `node scripts/verify_game04_g2_battle_raid.cjs`: PASS。6Wave、敵開始SP/上限分離、SKD068不正発動、同一戦闘ID再送の非二重消費、報酬二重受取防止、画像cache/retry。`agent-c-regression.json`。
- `node --experimental-strip-types scripts/game04-battle-presentation/verify-recorded-projection.mjs`: PASS。HP/多段/回復/カットイン/状態失敗/Wave切替/snapshot不変、直接/DOTのoverkill表示。
- `node scripts/verify_game04_territory_presentation.cjs`: ローカル素材存在check「岡崎城 開始 existing art」で停止。数値照合の合格とは扱わない。checkoutの素材完全性と配信URLは親が照合。
- `npm run typecheck`: C変更箇所はエラーなし。実行中の親App差分で `RedesignApp.tsx(52) existing is possibly null`。親統合後の再確認が必要。
- React best-practices skillの観点で成功cache、parallel取得、同じeffectのcleanup、mutation lock保持をレビュー。

## 残件と境界

1. 最終専用Preview本体で360/375/390px/低高さ、画像失敗/再訪、戦闘停止/倍速/SKIP、共闘全敵Dialog、出撃準備から編成復帰、終了報酬受取の独立操作確認。
2. 冷cache/温cacheと回線条件を揃えた実ローディング時刻。上記cacheテストはリクエスト重複の検証であり、性能基準達成を表さない。
3. 親のRedesignAppへraidHp propおよび編成帰還接続を依頼済み。
4. SKD正式helper変更を親API候補へ統合。既存開催/battle snapshotの値は書き換えない。正式SKD画像/名称採用未完はAのU01表と同一IDで管理。
5. 認証付き実APIの主催/参加/戦闘/資格/消費/受取/再送/保存/復帰は親のQAアカウントで確認が必要。synthetic testsを実保存受入に数えない。
6. 採用済み侵攻主催仮FIX、旧領土snapshot、6Wave/65面/少人数出陣/SKIPのVIP制限を変更していない。DB/APIの実適用は未実施。

## モバイル検証経路の調査（追記）

- `agent-browser` / `chromium` / `google-chrome`: CLIなし。
- runtime Playwright packageは存在するがChromium実行ファイルなし。`chromium.launch({headless:true,timeout:10000})` は Executable doesn't exist で即失敗。ブラウザの追加導入やネットワーク回避はしていない。
- 既存Preview限定 `/qa/home-live-viewport` を360/375/390/512幅に拡張。`height=568` も既存対応。iframe `src=/` の実本体を表示するだけで、本体style/dataの注入はない。
- 対象URLは `?width=360` / `?width=375` / `?width=390` / `?width=390&height=568`。
- この経路で確認できるのは指定CSS viewport内の実本体表示/操作。実端末、OSキーボード、touch環境、safe-areaの物理端末挙動とは区別する。
- 未配信変更のため、修正候補配信後に独立browser担当が検証する。

## U07 / 共闘・侵攻任務の接続helper

`src/domain/redesign/missionRaidProgress.ts` を追加。ソースAPI本体は親が統合する。

- `raidBattleMissionEvent`: before未決済→after決済済のbattle IDだけ参加/個人勝利/他者開催勝利。単なる入室は数えない。generic `battle`も含むため別eventで二重加算しない。
- `raidRescueMissionEvent`: 成功した救援のみ、NM164正本どおり本人開催のエンカウントに限定。
- `raidHostMissionEvent`: 主催成功の永続room証拠で1開催1回。
- `raidQualificationMissionEvents`: `defeat:段階:userId` の既存reward grantを、突破時の3勝資格証拠として使用。現在winsから過去突破を推定しない。参加報酬や個人勝利から代用しない。侵攻関門3/6/9、城主12、本人主催最終clearを別counterへ。
- `reconcileRaidMissionProgress`: 他者が最後に共通HPを削った場合も、対象参加者の次回同期にdurable grantから反映。claimed状態に依らず同一event IDで一度だけ。戻りstateは親のCASで永続化が必要。表示だけの投影で完了にしない。
- 主催eventのatはroom.createdAt。資格付き突破の旧grantにはtimestampがないため観測時刻を使用するが、対象は累計NMであり日次目標へ接続していない。

`node scripts/verify_game04_g2_raid_missions.cjs`: PASS。決済限定、再送、本人主催救援、資格証拠、過去資格への非遡及、城主/関門、claimed grantを含む繰り返し同期。結果 `agent-c-raid-missions.json`。実API反映・保存照合は親統合後に必要。
