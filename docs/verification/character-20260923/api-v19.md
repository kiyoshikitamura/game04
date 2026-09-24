# 開発API限定修正 2026-09-24

- 対象: GAME04 dev `lrgyllgzcdcphlbmkknc` / `game04-redesign-api`。
- 配信済み最新 v18 を取得し、初期編成の `deck: starters.map((c, i) =>` だけを `deck: starters.slice(0, 3).map((c, i) =>` へ変更。差分12文字。他ラインのv18変更を保持。
- 配信結果: v19 ACTIVE / verify_jwt=true。
- 配信hash: `fd0252361231ec6bfed20900463c592e3f3cdec7ed3b2fe88ee1cb9c7c82284e`。
- 既存保存編成は変更しない。DB migrationなし。Production変更なし。
- 正式初期所持セット全体の接続とは別。旧スキルID移行・素材対応の未解消はmaterials.mdを参照。
- 実API新規3枠確認は検証担当が記録する。
