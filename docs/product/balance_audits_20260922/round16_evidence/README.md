# 第16回 一括監査の再現

未承認の設計検証。主結果は上位round16_report.md / round16_ledger.json。

参照コミット13f3d3c29c26de36d0a10ce9244ce9b0d8efc081。Node.js v24.19.0。V2計算器はsrc/domain/redesign/battleBalanceV2.ts。
round16-results.jsonはrulesと各面のwaves、cases[].party、runs[].seedを保存。simulateBalanceBattle({rules,party,waves,seed})で再現する。テーマ追加結果も同じrulesを使用。全結果に使用入力あり。
主比較seed14001..14030、育成後14101..14120、テーマ比較15001..15060。主比較7,420戦、テーマ追加1,560戦。
スクリプトは当時のローカル配置と既存round14/15等の入力履歴を参照する。最終入力JSONからの再生は旧スクリプト順次実行を必要としない。
敵はintegrated8の未承認候補を含む。直近7面12体は今回53面の対象外で前回証拠を保持する。
主軸、除去、標準攻撃置換、キャラ代替、周回は異なる仮説。通常攻撃置換は無償の比較ではなく別スキル所持を前提にする。生存者数/残HP/行動数は実時間や獲得可能性を保証しない。
全53面の分類完了と全62面受入完了は別。新規数値FIXなし。
