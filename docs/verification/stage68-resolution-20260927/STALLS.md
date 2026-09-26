# 停滞と他攻略への影響

旧役割の同一編成、新しい主攻略・別攻略・5帯、実発動回数は [role-comparisons.json](role-comparisons.json) と面別JSON。候補全件の試行を含む判定であり全ての未探索編成の保証ではない。

|面|旧停滞編成数|旧300到達試行数|新検証編成数|新300到達数|新最大行動|対照再生|
|---|---:|---:|---:|---:|---:|---|
|1-1|0|0|8|0|104|対象外|
|2-3|3|123|13|0|199|[同一seed](paired-replay/2-3.json.gz)|
|3-1|5|466|14|0|230|[同一seed](paired-replay/3-1.json.gz)|
|3-2|8|1146|19|0|192|[同一seed](paired-replay/3-2.json.gz)|
|3-3|5|848|13|0|103|[同一seed](paired-replay/3-3.json.gz)|
|3-5|10|1355|15|0|224|[同一seed](paired-replay/3-5.json.gz)|
|5-3|1|38|15|0|154|[同一seed](paired-replay/5-3.json.gz)|
|6-2|8|1070|16|0|261|[同一seed](paired-replay/6-2.json.gz)|
|6-5|7|653|21|0|147|[同一seed](paired-replay/6-5.json.gz)|
|7-2|5|249|11|0|295|[同一seed](paired-replay/7-2.json.gz)|
|7-7|7|191|12|0|295|[同一seed](paired-replay/7-7.json.gz)|
|8-2|2|35|13|0|184|[同一seed](paired-replay/8-2.json.gz)|
|8-3|7|300|14|0|279|[同一seed](paired-replay/8-3.json.gz)|
|8-8|3|108|16|0|205|[同一seed](paired-replay/8-8.json.gz)|
|9-1|7|568|13|0|221|[同一seed](paired-replay/9-1.json.gz)|
|9-3|9|517|23|0|217|[同一seed](paired-replay/9-3.json.gz)|
|9-4|13|1477|17|0|243|[同一seed](paired-replay/9-4.json.gz)|
|9-5|10|508|17|0|222|[同一seed](paired-replay/9-5.json.gz)|
|9-8|7|493|15|0|253|[同一seed](paired-replay/9-8.json.gz)|
|9-9|11|801|16|0|266|[同一seed](paired-replay/9-9.json.gz)|
|9-10|8|787|14|0|256|[同一seed](paired-replay/9-10.json.gz)|
|10-1|10|1112|20|0|271|[同一seed](paired-replay/10-1.json.gz)|
|10-2|11|747|20|0|283|[同一seed](paired-replay/10-2.json.gz)|
|10-3|12|1117|25|0|297|[同一seed](paired-replay/10-3.json.gz)|
|10-4|7|258|16|0|283|[同一seed](paired-replay/10-4.json.gz)|
|10-5|12|1282|16|0|237|[同一seed](paired-replay/10-5.json.gz)|
|10-7|10|616|13|0|242|[同一seed](paired-replay/10-7.json.gz)|
|10-9|10|376|22|0|200|[同一seed](paired-replay/10-9.json.gz)|
|10-10|5|117|17|0|284|[同一seed](paired-replay/10-10.json.gz)|

250行動以上の長い例は数値上の非停滞と分離して時間残件として保持。特に低勝率編成は実機で許容される待ち時間の判断が必要。