# 実再生時間

ローカルChromiumで実際のBattleViewを再生。3倍速、導入停止解除/再開から最終フレームまでperformance.nowで測定。全記録のhiddenTransitionsは0。端末実機監査ではない。行動数から秒へ換算していない。CPU負荷・ブラウザ差を含む単回測定。

|case|seed|行動|実秒|決着|
|---|---:|---:|---:|---|
|[resolution-1-1-primary](playback-fixtures/resolution-1-1-primary.json.gz)|562001|34|24.10|final_wave_defeated|
|[resolution-10-3-long](playback-fixtures/resolution-10-3-long.json.gz)|532112|297|201.09|final_wave_defeated|
|[resolution-10-4-after](playback-fixtures/resolution-10-4-after.json.gz)|86001|77|65.16|final_wave_defeated|
|[resolution-10-4-before](playback-fixtures/resolution-10-4-before.json.gz)|86001|300|221.09|action_limit|
|[resolution-2-3-after](playback-fixtures/resolution-2-3-after.json.gz)|441003|254|192.58|party_defeated|
|[resolution-2-3-before](playback-fixtures/resolution-2-3-before.json.gz)|441003|300|216.86|action_limit|
|[resolution-2-3-final-long](playback-fixtures/resolution-2-3-final-long.json.gz)|521092|191|126.58|final_wave_defeated|
|[resolution-2-3-final](playback-fixtures/resolution-2-3-final.json.gz)|441003|160|113.01|final_wave_defeated|
|[resolution-2-3-long](playback-fixtures/resolution-2-3-long.json.gz)|521092|270|189.70|party_defeated|
|[resolution-7-7-long](playback-fixtures/resolution-7-7-long.json.gz)|581155|295|176.87|party_defeated|
|[resolution-9-6-after](playback-fixtures/resolution-9-6-after.json.gz)|87001|98|65.52|party_defeated|
|[resolution-9-6-before](playback-fixtures/resolution-9-6-before.json.gz)|87001|300|178.21|action_limit|

全入力・敵hash・編成名・測定時刻は [playback-measurements.json](playback-measurements.json)。2-3 after/longは中間案、final/final-longが最終採用入力。9-6は前回から同じ敵入力を保持。従来の主51.24秒/低67.13秒/旧189.77秒も保持し、今回の別測定で上書きしない。

今回未測定面: 1-2、1-3、1-4、1-5、2-1、2-2、2-4、2-5、3-1、3-2、3-3、3-4、3-5、4-1、4-2、4-3、4-4、4-5、5-1、5-2、5-3、5-4、5-5、5-6、6-1、6-2、6-3、6-4、6-5、6-6、7-1、7-2、7-3、7-4、7-5、7-6、7-8、8-1、8-2、8-3、8-4、8-5、8-6、8-7、8-8、9-1、9-2、9-3、9-4、9-5、9-7、9-8、9-9、9-10、10-1、10-2、10-5、10-6、10-7、10-8、10-9、10-10