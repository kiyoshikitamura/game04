# GAME04 全面改修：レイド実装

基準：企画正本 / レイドUI仮FIX / 全面改修計画（2026-09-19）。

## 差分監査

| 分類 | 対象 |
|---|---|
| KEEP | 認証、画像資産、非同期サーバー戦闘、共通運営基盤 |
| MODIFY | 旧RaidRoomの参加条件・旧Battle参照を新Master・共同行動力・新Battle Coreへ置換 |
| REMOVE / HIDE | 日次・地域別・救援専用ページ、旧PvPランキング露出。旧データ破壊は行わない |
| NEW | Encounter / Unlockの新Room、3勝資格、Checkpoint、救援窓、一覧・詳細・共通出撃準備 |

## 実装

- `src/domain/redesign/raid.ts`：2種Master、Boss Lv・見た目・Checkpoint、開催、参加・退出、救援、Battle確定、報酬受取。
- `src/domain/redesign/raidPresentation.ts`：残時間・属性・報酬・救援窓の表示。
- `src/app/components/redesign/RaidView.tsx`：残時間昇順の1一覧、3種filter、解禁訴求、詳細、敵・参加者・報酬・救援の中央モーダル。
- 出撃準備はQuestと同じ`PreparationModal`。独立したレイド準備UIを作らない。
- 報酬はRoom内の冪等grantを経て本人stateへ受取。未所持キャラの魂も共通grantRewardを使用。
- 別参加者による討伐で共通Lvが変わった場合、開始済み戦闘の勝敗・参加報酬を確定し、新Lvへ古い戦闘のダメージを転用しない。
- Battle開始時の行動力支払と結果確定の二段階に対応。`energyAlreadyPaid`はサーバー専用引数。
- Encounter初回「無視」と主催者途中退出禁止を分離。
- 救援公開はDB commitのoutboxとHome共通feedへ接続（Data / 親API担当）。

## 仮設定

Boss画像は既存武将の流用。ステータス・勝利倍率・行動力消費・報酬量・最大Lv・見た目切替LvはPreview数値Master。商品価格・本番Economyは確定していない。

初期は常設レイドランキングを置かない（レイドUI正本16章）。参加者の勝利数・累計与ダメージは表示する。Guild Raidとランキング軸最終設計は後工程。

## 旧実装の保留区間（仕様決定前の記録）

任意解禁レイド途中参加の開始Checkpointは記録・表示済み。参加時の共通LvとCheckpointが異なる場合、そこから追いつく進行仕様が正本にないため出撃を停止し「途中参加後の進行仕様を調整中」と表示する。初回のみCheckpoint戦闘後に共通Lvへ飛ばす等の新ルールは追加しない。Checkpoint一致時および既存参加者の継続攻略は可能。

## 最小検証

型検査成功。純粋遷移で60分 / 3日、3勝資格、オーバーダメージ、戦闘と報酬受取の冪等、救援6時間回復、途中参加Checkpoint、退出後の再参加拒否、旧Lv戦闘結果確定を確認。

Preview反映・DB接続・統合確認は親エージェントの配信記録を参照。

## 最新仕様決定と実装差分（2026-09-19）

2026-09-19 本流決定：ランキングは初期リリース対象外。Unlock Raidの個人途中参加Checkpointは正式削除。途中参加者も戦闘開始時の共有Lvで個別バトルを行う。個別勝敗・Raid全体3勝資格・非遡及報酬・共有Lv連動の敵強化は維持。

上記の追い付き仕様未FIXは解消した。コードは未変更のため、joinedLevel > checkpointの出撃停止とCheckpoint表示・項目依存は残っている。M5-06で除去し、戦闘開始時の共有Lvへ統一する。個別敵生成、3勝判定、非遡及、Lv連動強化を維持して回帰確認する。新ランキング設計は初期対象外。
