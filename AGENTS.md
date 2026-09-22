> 育成必要量・魂・EXP繰越・LB素材・Player Lv回復・ノーマルガチャは `docs/product/GAME04_GROWTH_AUTHORITY_V1_2026-09-21.md` と `docs/product/GAME04_GROWTH_NORMAL_GACHA_HANDOFF_2026-09-21.md` が優先。既存EXP・残高の移行は未合意のまま保持する。

> 育成必要量・魂・EXP繰越・LB素材・Player Lv回復・ノーマルガチャは `docs/product/GAME04_GROWTH_AUTHORITY_V1_2026-09-21.md` と `docs/product/GAME04_GROWTH_NORMAL_GACHA_HANDOFF_2026-09-21.md` が優先。育成以外の戦闘v2・開催snapshot・報酬量・未承認v3は変更しない。旧残高・EXPを黙って換算しない。

> 戦闘・キャラ割当・検証用スキルの最新Authorityは `docs/product/GAME04_BALANCE_AUTHORITY_V2_2026-09-20.md`。v2本文が付録・旧正本に優先し、仮値・未決の状態を保持する。未変更ルールはv1を継承。保存済み戦闘・開催snapshotは開始時のルール版を維持する。

# GAME04 作業方針（2026-09-19）

## 現在の優先Authority

戦闘共通ルールは docs/product/GAME04_BALANCE_AUTHORITY_V1_2026-09-20.md を最優先とする。未確定案・参考試算は未承認のまま保持する。旧保存戦闘を新ルールで黙って再計算せず、ルール版を保持する。

2026-09-19の全面改修Handoffとdocs/productの同日付企画・UI正本を優先する。
GAME03ゲームルールの完全複製方針は撤回。共通運営基盤と戦国素材を保持し、シングル攻略・デッキ構築へ再設計する。
新規機能はsrc/domain/redesign、src/app/components/redesignとgame04_* DBへ分離する。
GAME04 dev lrgyllgzcdcphlbmkkncのみ変更。GAME03およびProductionへの書込み・公開は禁止。
担当外ファイル変更は親と調整し、DB適用・統合・配信は親へ集約する。
未FIX数値はPreview調整Masterと明示。Tutorial、商材最終設計、総合受入は後工程。
旧191件の進捗率を新計画へ流用しない。

スクロール共通ルールは docs/product/GAME04_SCROLL_UI_AUTHORITY_2026-09-19.md を遵守。長いページ・中央ダイアログにはスクロール所有者を明示し、デザインバーを非表示にしない。

## 以下は旧方針の記録（現在の仕様Authorityではない）

ユーザーの最新指示：GAME03の最新実Productionを完全複製し、キャラ60体とロゴのみ添付の戦国素材へ置換する。他の素材・ゲームシステム・数値は維持し、GAME04専用devで動かす。旧独自Common Core開発方針に優先する。

- 元GAME04 main: 01586311987e9623da321fa9fb2a94b90d6377a3。archive/pre-production-clone-20260916で保存。
- GAME03基準: e2998ff0ecbc2d8e608f3e47f9f43ed0fd6f723c。
- GAME03 DB/配信への書込み禁止。GAME04 devのみ。
- 親：本体snapshot・接続設定・統合・配信。assets_replace：キャラ/ロゴと表示対応。game03_production：DB baseline/master/Edge/Cron。game04_inventory：配信経路調査。
- 担当外ファイル変更は親と調整する。DB適用はDB担当に集約する。
- 既存GAME04履歴を保持しmainへ直接pushしない。秘密情報をコミット・出力しない。
- 検証は型、ビルド、素材60体参照、GAME04専用接続、実ゲーム導線を確認する。
