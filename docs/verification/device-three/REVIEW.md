# 本番実機指摘3件 2026-09-27

基準: 本番 b8fea14088ad0cfbf87d0714725ff8434da5db4c / 保存 fff99e6。着手時の正式ドメインは dpl_FzMypYL9BtEATgq8YGE796tAmAxq Ready Production。並走共通 1aa33af / device 71aa5b5 / migration 85e3417 を保持。

- 結果保存中: BattleViewの終了後分岐だけがテキスト帯のまま残っていた。リタイアと同じ Game04Loading(screen) + branded-loading に統一。失敗はScreenState(error) + 再試行。完了ロック・世代チェック・コールバックと決済処理は変更なし。
- 敵1体4:3: alpha境界SVGの拡大幅125%/left -12.5%と親overflow:hiddenで横が切れていた。1体の対象素材だけ元画像canvasをcontainで100%幅内に収め、情報96px分を確保。縦横比維持。複数敵のalpha拡大/配置と1:1標準寸法は保持。
- 本陣: 表示切替→武将切替。ボタンのaccessible nameとダイアログ名を一致。ハンドラや保存処理は変更なし。

375/390 × 600 の本物のBattleViewを使うローカルfixtureで、短時間スピナー→既定1500ms後ロゴ、中央配置、待機中操作なし、失敗解除→再試行→完了1回・次ステージ自動開始0回を確認。柴田勝家正式素材の自然比率4:3・contain・親枠内・情報非重複を数値/画像で確認。添付result.json。
既存verify_retire_loadingとverify_battle_device_five_uiもPASS（リタイア正常/失敗、敵1/2/3体、状態14px/黒帯30%、通常/BURST/派切替リタイア、完了1回）。fixturesは見た目/保存callback制御用で本番報酬付与は実施しない。
React確認: hooks順序・既存ロック/非同期破棄・名前/aria・画像比率を維持。新規依存なし。型検査・共通UI静的契約PASS。
API・計算・報酬・認証/課金設定・GAME03・共通Previewを変更しない。

本陣375/390: 武将切替ボタンのaccessible name・表示切替の不在・既存武将選択ダイアログへの遷移PASS（専用QA、保存操作なし）。初回は検証プロセスのネットワーク制約で接続失敗したため、ネットワーク許可済み実行で確認。Next build 46ページPASS。
