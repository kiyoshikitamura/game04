# GAME04 作業方針（2026-09-16）

ユーザーの最新指示：GAME03の最新実Productionを完全複製し、キャラ60体とロゴのみ添付の戦国素材へ置換する。他の素材・ゲームシステム・数値は維持し、GAME04専用devで動かす。旧独自Common Core開発方針に優先する。

- 元GAME04 main: 01586311987e9623da321fa9fb2a94b90d6377a3。archive/pre-production-clone-20260916で保存。
- GAME03基準: e2998ff0ecbc2d8e608f3e47f9f43ed0fd6f723c。
- GAME03 DB/配信への書込み禁止。GAME04 devのみ。
- 親：本体snapshot・接続設定・統合・配信。assets_replace：キャラ/ロゴと表示対応。game03_production：DB baseline/master/Edge/Cron。game04_inventory：配信経路調査。
- 担当外ファイル変更は親と調整する。DB適用はDB担当に集約する。
- 既存GAME04履歴を保持しmainへ直接pushしない。秘密情報をコミット・出力しない。
- 検証は型、ビルド、素材60体参照、GAME04専用接続、実ゲーム導線を確認する。
