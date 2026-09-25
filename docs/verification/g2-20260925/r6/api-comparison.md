# R6 API往復 前後比較

API v25→v26、afterコード `af640e291d3e79e511833dcef1e16f0ff7528b94`。同じQA-A、同じurllib HTTPS経路、直列・fresh request ID、set_home同背景20回＋get_state20回を前後で実施。全80件HTTP200。

|操作|before中央値ms|after中央値ms|before p95 / 最大ms|after p95 / 最大ms|after 1秒 / 1.5秒以内|
|---|---:|---:|---|---|---|
|set_home|8623.35|8126.50|10300.2 / 12169.6|10026.9 / 30345.3|0/20 / 0/20|
|get_state|9050.45|7956.30|11075.4 / 27943.9|9804.4 / 25651.6|0/20 / 0/20|

保存後にDB commit確定stateを再利用して二重stateForを省いた。ただしget_state経路自体は今回のreuse対象外で、同経路でも前後差がある。観測中央値差をすべてコード改善の効果と断定しない。

試行後半に別専用QAのSSR操作・親のブラウザ操作が並走し、共有サービス負荷は隔離していない。端末経路・対象QA・操作・回数は同じだが、ネットワーク/負荷の完全統制比較ではない。25〜30秒級の外れ値も保持。

判定：この代替HTTP経路では1秒・1.5秒とも未達。UIの主要情報表示・操作可能、画像待ち、iPhone Safari WiFi/4G・5G、coldの合格を示す資料ではない。1.5秒例外適用の根拠にもできない。別途親の画面計測と分離する。

生データ `api-before.json` / `api-after.json`、集計 `api-comparison.json`。
