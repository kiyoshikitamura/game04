# 第17回 最終候補の検証記録

状態は一括FIX承認待ち。実装データへの自動適用は禁止。
基準計算器はround17_source_check.json参照、Node.js v24.19.0。
final17-results.jsonのrules、results各面のwaves、parties各比較編成、runsのseedを用い、simulateBalanceBattle({rules,party,waves,seed})で再現する。個別runのseedが正本で、全体seedメタデータのtempo4は旧範囲を上書きする。
最終40面について主軸・対策除去・標準攻撃置換・実キャラ代替各60戦、周回30戦、合計10,800戦。候補探索はselection_historyを参照。試行途中の値を最終値に混ぜない。
スクリプトは当時のローカル配置と既存入力履歴に依存する設計資料で、単独起動用パッケージではない。最終入力JSONから再現すれば過去の候補探索を再実行する必要はない。
既存7面・維持15面は第15/16回等の証拠を保持する。今回の40面と同じ回数で再検証したと解釈しない。
