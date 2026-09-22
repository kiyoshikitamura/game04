# 第15回の再現

Node.js24.19.0、--experimental-strip-types。round15→follow15→confirm15の順。保存スクリプトは当時のbattle-check作業フォルダ相対パスを使用する履歴。

上位round15_selected_inputs_results.jsonは、各ケースのparty/wavesと全seed結果を持つ。rulesは第14回round14_evidence/README.mdと同一。simulateBalanceBattleへ渡して再現する。計算器基準SHA95e499db74c958da00b084b705f3a0b01a46787f。ゲームロジック変更なし。

全て未承認候補。6-1/6-2/7-1/8-4など不採用の探索結果も根拠として保存しており、まとめて実装しない。最終変更範囲はround15_combined_enemy_delta.jsonのみ（正式FIX後）。
