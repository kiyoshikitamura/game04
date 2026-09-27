# 保存前検証記録

2026-09-27、基準811b92b。

- 型検査（tsc --noEmit）：成功。
- Next.js 16.2.10 build：成功（43静的ページ、TypeScript成功）。
- 共通UI contract：成功。
- DBG035 BURST：18種の限定条件と旧保存互換成功。
- 特選召喚：6実API消費・同要求再送の二重消費なし。
- DBキャンペーン/プロモーション・チャット：rollback検証成功。配布は無効のまま、開始日時null、90日受取期限。
- 新規GAME04ユーザー作成triggerとbackfill再送：rollback検証成功。
- 実ブラウザ375/390×600：22画像、pageerrorなし。CSS上書き2箇所を修正して再確認。
- 同時キャンペーン配布の実競合試験は未実施。users行ロックとcampaign/user一意制約、再送を確認。
- 実決済→BOX付与はPreviewの決済基盤未導入により未実施。

配信後にSHA・URL・稼働照合を追記する。
