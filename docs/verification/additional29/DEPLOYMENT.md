# 保存・配信検証記録

2026-09-27、基準811b92b。

- 型検査（tsc --noEmit）：成功。
- Next.js 16.2.10 build：成功（43静的ページ、TypeScript成功）。
- 共通UI contract：成功。
- DBG035 BURST：18種の限定条件と旧保存互換成功。
- 特選召喚：6実API消費・同要求再送の二重消費なし。
- DBキャンペーン/プロモーション・チャット：rollback検証成功。配布は無効のまま、開始日時null、90日受取期限。
- 新規GAME04ユーザー作成triggerとbackfill再送：rollback検証成功。
- 実ブラウザ375/390×600：22画像、pageerrorなし。CSS上書き2箇所を修正して再確認。
- 配布のSQL実装を非公開QA campaign/専用受取人へ限定した関数で2接続競合を確認。片方がusers行ロックを2秒保持する間に他方を実行し、BOX1件/300個。試験関数は削除、QA campaign無効化。正式campaignは常に無効。
- 実決済→BOX付与はPreviewの決済基盤未導入により未実施。

## 共通Preview配信済み・実機確認待ち

実装保存・配信SHA：9d40e021c5dc3ba8bce9078f16af0c5df4397986

- [共通Preview](https://game04-git-work-game04-common-preview-20260925-kiyoshi-kitamura.vercel.app)
- Ready: dpl_JAUPJ3zpPujjfC2RqDvX2SiQaq4u
- 一意URL: https://game04-haob3s753-kiyoshi-kitamura.vercel.app
- 切替直前にPR #37と対象ブランチのHEAD一致。公開/api/qa/deploymentでSHA・branch・preview一致。
- 配信後の実本陣→初回抑止→2回目無料10連→あとで→同日再訪抑止、実RPCのshown記録成功。pageerror 0。
- 全素材合成QAの初回通信は12秒期限を超えて再読み込みが必要。HTTP404/通信失敗イベントなし。実ブラウザバー伸縮は実機待ち。
- この記録・配信後画像の後続コミットは証拠保存のみ。配信アプリのSHAとは区別する。

配信後最終確認：専用QAの実API獲得済みスキル・装備一覧は375/390pxとも再読み込み後に表示成功（deployed/real-lists.json、real-skills/equipment画像）。訴求2種・商店・所持品・通知も両幅成功（deployed/browser.json）、pageerror 0。本陣・交流・召喚も両幅確認。全素材合成の編成画面は画像待機の残件を維持。
