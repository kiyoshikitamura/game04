# 今回の敵変更差分

16d45e1からの差分。採用43面・追加12面・配布44箇所を土台に、停滞28面と1-1を変更。既存敵技能を保持し、敵固有の長期戦攻撃を追加。プレイヤー能力に合わせた動的補正はなく、保存した固定数値。共通式・300行動・BURST・周回報酬は変更なし。

|面|敵（wave/位置）|項目|前|後|
|---|---|---|---|---|
|1-1|女侍 1-1/W1/1|hp|900|2700|
|1-1|女侍 1-1/W1/1|atk|35|350|
|1-1|漁師 1-1/W1/2|hp|650|1950|
|1-1|漁師 1-1/W1/2|atk|30|300|
|2-3|僧兵 2-3/W1/1|hp|4000|2400|
|2-3|茶屋の娘 2-3/W1/2|hp|650|390|
|2-3|鍛冶師 2-3/W2/1|hp|4000|2400|
|2-3|鍛冶師 2-3/W2/1|skills|SKD034: always; self; def_up:15|2-3/W2/1/pressure-10-targeted: every_n_actions10; all_enemies; damage:860<br>SKD034: always; self; def_up:15|
|2-3|服部半蔵 2-3/W2/2|hp|1500|900|
|2-3|服部半蔵 2-3/W2/2|skills||2-3/W2/2/pressure-10-targeted: every_n_actions10; all_enemies; damage:810|
|2-3|お市の方 2-3/W2/3|hp|650|390|
|2-3|お市の方 2-3/W2/3|skills|SKD040: always; lowest_ally; heal:75|2-3/W2/3/pressure-10-targeted: every_n_actions10; all_enemies; damage:310<br>SKD040: always; lowest_ally; heal:75|
|3-1|鍛冶師 3-1/W1/1|hp|3430|2058|
|3-1|鍛冶師 3-1/W1/1|skills|SKD034: always; self; def_up:15|3-1/W1/1/pressure-12: every_n_actions12; all_enemies; damage:470<br>SKD034: always; self; def_up:15|
|3-1|僧兵 3-1/W1/2|hp|680|408|
|3-1|僧兵 3-1/W1/2|skills||3-1/W1/2/pressure-12: every_n_actions12; all_enemies; damage:1330|
|3-1|直江兼続 3-1/W2/1|hp|3430|2058|
|3-1|直江兼続 3-1/W2/1|skills|SKD008: always; first; damage:120|3-1/W2/1/pressure-12: every_n_actions12; all_enemies; damage:470<br>SKD008: always; first; damage:120|
|3-2|女侍 3-2/W1/1|hp|3000|600|
|3-2|女侍 3-2/W1/1|atk|410|861|
|3-2|女侍 3-2/W1/1|skills||3-2/W1/1/pressure-16: every_n_actions16; all_enemies; damage:310|
|3-2|行商人 3-2/W1/2|hp|770|154|
|3-2|行商人 3-2/W1/2|atk|130|273|
|3-2|行商人 3-2/W1/2|skills|SKD035: always; all_allies; atk_up:8|3-2/W1/2/pressure-16: every_n_actions16; all_enemies; damage:970<br>SKD035: always; all_allies; atk_up:8|
|3-2|加藤清正 3-2/W2/1|hp|3000|600|
|3-2|加藤清正 3-2/W2/1|atk|410|861|
|3-2|加藤清正 3-2/W2/1|skills|SKD009: always; first; damage:120|3-2/W2/1/pressure-16: every_n_actions16; all_enemies; damage:310<br>SKD009: always; first; damage:120|
|3-2|行商人 3-2/W2/2|hp|1050|210|
|3-2|行商人 3-2/W2/2|atk|160|336|
|3-2|行商人 3-2/W2/2|skills|SKD035: always; all_allies; atk_up:8|3-2/W2/2/pressure-16: every_n_actions16; all_enemies; damage:790<br>SKD035: always; all_allies; atk_up:8|
|3-3|山伏 3-3/W1/1|hp|2500|1500|
|3-3|くノ一 3-3/W1/2|hp|1500|900|
|3-3|服部半蔵 3-3/W2/1|hp|2780|1668|
|3-3|服部半蔵 3-3/W2/1|skills|SKD012: always; first; damage:120|3-3/W2/1/pressure-16: every_n_actions16; all_enemies; damage:580<br>SKD012: always; first; damage:120|
|3-5|鍛冶師 3-5/W1/1|hp|4020|804|
|3-5|鍛冶師 3-5/W1/1|atk|620|1302|
|3-5|鍛冶師 3-5/W1/1|skills|SKD034: always; self; def_up:15|3-5/W1/1/pressure-16: every_n_actions16; all_enemies; damage:270<br>SKD034: always; self; def_up:15|
|3-5|火薬師 3-5/W1/2|hp|1700|340|
|3-5|火薬師 3-5/W1/2|atk|500|1050|
|3-5|火薬師 3-5/W1/2|skills|SKD019: always; all_enemies; damage:60|3-5/W1/2/pressure-16: every_n_actions16; all_enemies; damage:330<br>SKD019: always; all_enemies; damage:60|
|3-5|戦巫女 3-5/W2/1|hp|2573|515|
|3-5|戦巫女 3-5/W2/1|atk|620|1302|
|3-5|戦巫女 3-5/W2/1|skills|SKD046: always; lowest_ally; shield:65|3-5/W2/1/pressure-16: every_n_actions16; all_enemies; damage:270<br>SKD046: always; lowest_ally; shield:65|
|3-5|陰陽師 3-5/W2/2|hp|1900|380|
|3-5|陰陽師 3-5/W2/2|atk|220|462|
|3-5|陰陽師 3-5/W2/2|skills|SKD037: always; highest_atk_enemy; atk_down:10|3-5/W2/2/pressure-16: every_n_actions16; all_enemies; damage:750<br>SKD037: always; highest_atk_enemy; atk_down:10|
|3-5|織田信長 3-5/W3/1|hp|1646|329|
|3-5|織田信長 3-5/W3/1|atk|527|1107|
|3-5|織田信長 3-5/W3/1|skills|SKD007: always; first; damage:120|3-5/W3/1/pressure-16: every_n_actions16; all_enemies; damage:310<br>SKD007: always; first; damage:120|
|3-5|お市の方 3-5/W3/2|hp|1664|333|
|3-5|お市の方 3-5/W3/2|atk|306|643|
|3-5|お市の方 3-5/W3/2|skills|SKD040: always; lowest_ally; heal:75|3-5/W3/2/pressure-16: every_n_actions16; all_enemies; damage:540<br>SKD040: always; lowest_ally; heal:75|
|5-3|柴田勝家 5-3/1/1|hp|12000|7200|
|5-3|本願寺顕如 5-3/1/2|hp|7500|4500|
|5-3|徳川家康 5-3/2/1|hp|34000|20400|
|5-3|徳川家康 5-3/2/1|skills|SKD036: always; all_allies; def_up:17.01<br>SKD009: always; first; damage:130.7|5-3/2/1/pressure-16: every_n_actions16; all_enemies; damage:470<br>SKD036: always; all_allies; def_up:17.01<br>SKD009: always; first; damage:130.7|
|5-3|前田利家 5-3/2/2|hp|11000|6600|
|5-3|前田利家 5-3/2/2|skills||5-3/2/2/pressure-16: every_n_actions16; all_enemies; damage:570|
|6-2|黒田官兵衛 6-2/1/1|hp|14630|5267|
|6-2|山本勘助 6-2/1/2|hp|4750|1710|
|6-2|上杉景勝 6-2/2/1|hp|14630|5267|
|6-2|上杉景勝 6-2/2/1|skills|SKD037: always; highest_atk_enemy; atk_down:13.18|6-2/2/1/pressure-12-p1.6: every_n_actions12; all_enemies; damage:624<br>SKD037: always; highest_atk_enemy; atk_down:13.18|
|6-2|柴田勝家 6-2/2/2|hp|6500|2340|
|6-2|柴田勝家 6-2/2/2|skills||6-2/2/2/pressure-12-p1.6: every_n_actions12; all_enemies; damage:1184|
|6-2|大友宗麟 6-2/3/1|hp|11704|4213|
|6-2|大友宗麟 6-2/3/1|skills|SKD037: always; highest_atk_enemy; atk_down:13.18|6-2/3/1/pressure-12-p1.6: every_n_actions12; all_enemies; damage:624<br>SKD037: always; highest_atk_enemy; atk_down:13.18|
|6-2|立花宗茂 6-2/3/2|hp|8000|2880|
|6-2|立花宗茂 6-2/3/2|skills|SKD011: always; first; damage:137.76|6-2/3/2/pressure-12-p1.6: every_n_actions12; all_enemies; damage:720<br>SKD011: always; first; damage:137.76|
|6-2|山本勘助 6-2/4/1|hp|9363|3371|
|6-2|山本勘助 6-2/4/1|skills|SKD037: always; highest_atk_enemy; atk_down:13.18|6-2/4/1/pressure-12-p1.6: every_n_actions12; all_enemies; damage:5120<br>SKD037: always; highest_atk_enemy; atk_down:13.18|
|6-2|黒田官兵衛 6-2/4/2|hp|9600|3456|
|6-2|黒田官兵衛 6-2/4/2|skills|SKD028: always; first; damage:125.54|6-2/4/2/pressure-12-p1.6: every_n_actions12; all_enemies; damage:7024<br>SKD028: always; first; damage:125.54|
|6-5|濃姫 6-5/1/1|hp|17000|10200|
|6-5|小早川隆景 6-5/1/2|hp|13000|7800|
|6-5|石田三成 6-5/2/1|hp|21000|12600|
|6-5|島津義久 6-5/2/2|hp|13000|7800|
|6-5|毛利元就 6-5/2/3|hp|17000|10200|
|6-5|北条氏康 6-5/3/1|hp|19000|11400|
|6-5|上杉景勝 6-5/3/2|hp|14000|8400|
|6-5|明智光秀 6-5/4/1|hp|11970|7182|
|6-5|明智光秀 6-5/4/1|skills|SKD028: always; first; damage:132.27|6-5/4/1/pressure-16: every_n_actions16; all_enemies; damage:530<br>SKD028: always; first; damage:132.27|
|6-5|山本勘助 6-5/4/2|hp|12500|7500|
|6-5|山本勘助 6-5/4/2|skills|SKD038: always; first; def_down:14.89|6-5/4/2/pressure-16: every_n_actions16; all_enemies; damage:630<br>SKD038: always; first; def_down:14.89|
|7-2|北条氏康 7-2/1/1|hp|12312|7387|
|7-2|今川義元 7-2/1/2|hp|10800|6480|
|7-2|上杉景勝 7-2/2/1|hp|12312|7387|
|7-2|上杉景勝 7-2/2/1|skills|SKD036: always; all_allies; def_up:19.77|7-2/2/1/pressure-12: every_n_actions12; all_enemies; damage:600<br>SKD036: always; all_allies; def_up:19.77|
|7-2|前田利家 7-2/2/2|hp|12960|7776|
|7-2|前田利家 7-2/2/2|skills||7-2/2/2/pressure-12: every_n_actions12; all_enemies; damage:550|
|7-2|徳川家康 7-2/3/1|hp|25920|15552|
|7-2|徳川家康 7-2/3/1|skills|SKD036: always; all_allies; def_up:19.77<br>SKD009: always; first; damage:145.45|7-2/3/1/pressure-12: every_n_actions12; all_enemies; damage:1080<br>SKD036: always; all_allies; def_up:19.77<br>SKD009: always; first; damage:145.45|
|7-7|片倉景綱 7-7/1/1|hp|17990|10794|
|7-7|前田利家 7-7/1/2|hp|9370|5622|
|7-7|真田昌幸 7-7/2/1|hp|22488|13493|
|7-7|島津義弘 7-7/2/2|hp|9370|5622|
|7-7|直江兼続 7-7/3/1|hp|22488|13493|
|7-7|直江兼続 7-7/3/1|skills||7-7/3/1/pressure-16-p1.6: every_n_actions16; all_enemies; damage:1152|
|7-7|上杉景勝 7-7/3/2|hp|9370|5622|
|7-7|上杉景勝 7-7/3/2|skills|SKD046: always; lowest_ally; shield:99.32|7-7/3/2/pressure-16-p1.6: every_n_actions16; all_enemies; damage:144<br>SKD046: always; lowest_ally; shield:99.32|
|7-7|徳川家康 7-7/4/1|hp|11514|6908|
|7-7|徳川家康 7-7/4/1|skills||7-7/4/1/pressure-16-p1.6: every_n_actions16; all_enemies; damage:928|
|7-7|濃姫 7-7/4/2|hp|9370|5622|
|7-7|濃姫 7-7/4/2|skills|SKD046: always; lowest_ally; shield:99.32|7-7/4/2/pressure-16-p1.6: every_n_actions16; all_enemies; damage:304<br>SKD046: always; lowest_ally; shield:99.32|
|8-2|前田利家 8-2/1/1|hp|10150|6090|
|8-2|北条氏康 8-2/1/2|hp|10150|6090|
|8-2|上杉謙信 8-2/2/1|hp|20290|12174|
|8-2|上杉謙信 8-2/2/1|skills|SKD014: always; first; damage:229.21|8-2/2/1/pressure-16: every_n_actions16; all_enemies; damage:310<br>SKD014: always; first; damage:229.21|
|8-2|柴田勝家 8-2/3/1|hp|10150|6090|
|8-2|雑賀孫市 8-2/3/2|hp|10150|6090|
|8-3|井伊直政 8-3/1/1|hp|84560|50736|
|8-3|立花宗茂 8-3/1/2|hp|3810|2286|
|8-3|小早川隆景 8-3/1/3|hp|3810|2286|
|8-3|徳川家康 8-3/2/1|hp|25370|15222|
|8-3|徳川家康 8-3/2/1|skills|SKD036: always; all_allies; def_up:22.92<br>SKD009: always; first; damage:162.25|8-3/2/1/pressure-12: every_n_actions12; all_enemies; damage:820<br>SKD036: always; all_allies; def_up:22.92<br>SKD009: always; first; damage:162.25|
|8-3|毛利元就 8-3/3/1|hp|3718|2231|
|8-3|島津義弘 8-3/3/2|hp|3810|2286|
|8-3|長宗我部元親 8-3/3/3|hp|3810|2286|
|8-3|伊達政宗 8-3/4/1|hp|12990|7794|
|8-3|伊達政宗 8-3/4/1|skills|SKD022: always; all_enemies; damage:81.12|8-3/4/1/pressure-12: every_n_actions12; all_enemies; damage:510<br>SKD022: always; all_enemies; damage:81.12|
|8-8|柴田勝家 8-8/1/1|hp|24000|14400|
|8-8|浅井長政 8-8/1/2|hp|38000|22800|
|8-8|斎藤道三 8-8/2/1|hp|17000|10200|
|8-8|片倉景綱 8-8/2/2|hp|24000|14400|
|8-8|伊達政宗 8-8/3/1|hp|80000|48000|
|8-8|雑賀孫市 8-8/4/1|hp|24000|14400|
|8-8|細川ガラシャ 8-8/4/2|hp|22000|13200|
|8-8|本多忠勝 8-8/5/1|hp|80000|48000|
|8-8|織田信長 8-8/6/1|hp|104000|62400|
|8-8|織田信長 8-8/6/1|skills|SKD035: always; all_allies; atk_up:11.7<br>SKD007: always; first; damage:162.25|8-8/6/1/pressure-16: every_n_actions16; all_enemies; damage:480<br>SKD035: always; all_allies; atk_up:11.7<br>SKD007: always; first; damage:162.25|
|8-8|お市の方 8-8/6/2|hp|22000|13200|
|8-8|お市の方 8-8/6/2|skills|SKD040: always; lowest_ally; heal:114.61|8-8/6/2/pressure-16: every_n_actions16; all_enemies; damage:440<br>SKD040: always; lowest_ally; heal:114.61|
|9-1|北条氏康 9-1/1/1|hp|48000|14400|
|9-1|北条氏康 9-1/1/1|atk|3500|6125|
|9-1|北条氏康 9-1/1/1|def|3200|3040|
|9-1|北条氏康 9-1/1/1|skills|SKD034: always; self; def_up:22.92|9-1/1/1/pressure-16: every_n_actions16; all_enemies; damage:300<br>SKD034: always; self; def_up:22.92|
|9-1|今川義元 9-1/1/2|hp|24000|7200|
|9-1|今川義元 9-1/1/2|atk|4000|7000|
|9-1|今川義元 9-1/1/2|def|1400|1330|
|9-1|今川義元 9-1/1/2|skills|SKD036: always; all_allies; def_up:22.92|9-1/1/2/pressure-16: every_n_actions16; all_enemies; damage:260<br>SKD036: always; all_allies; def_up:22.92|
|9-1|徳川家康 9-1/2/1|hp|56890|17067|
|9-1|徳川家康 9-1/2/1|atk|3697|6470|
|9-1|徳川家康 9-1/2/1|def|4003|3803|
|9-1|徳川家康 9-1/2/1|skills|SKD036: always; all_allies; def_up:22.92<br>SKD009: always; first; damage:162.25|9-1/2/1/pressure-16: every_n_actions16; all_enemies; damage:280<br>SKD036: always; all_allies; def_up:22.92<br>SKD009: always; first; damage:162.25|
|9-3|加藤清正 9-3/1/1|hp|84720|25416|
|9-3|加藤清正 9-3/1/1|atk|3340|5010|
|9-3|加藤清正 9-3/1/1|def|3403|3233|
|9-3|加藤清正 9-3/1/1|skills|SKD034: always; self; def_up:22.92|9-3/1/1/pressure-16: every_n_actions16; all_enemies; damage:360<br>SKD034: always; self; def_up:22.92|
|9-3|真田昌幸 9-3/1/2|hp|28620|8586|
|9-3|真田昌幸 9-3/1/2|atk|4133|6200|
|9-3|真田昌幸 9-3/1/2|def|1910|1815|
|9-3|真田昌幸 9-3/1/2|skills|SKD046: always; lowest_ally; shield:99.32|9-3/1/2/pressure-16: every_n_actions16; all_enemies; damage:300<br>SKD046: always; lowest_ally; shield:99.32|
|9-3|細川ガラシャ 9-3/1/3|hp|21790|6537|
|9-3|細川ガラシャ 9-3/1/3|atk|5692|8538|
|9-3|細川ガラシャ 9-3/1/3|def|1590|1511|
|9-3|細川ガラシャ 9-3/1/3|skills|SKD040: always; lowest_ally; heal:131.74|9-3/1/3/pressure-16: every_n_actions16; all_enemies; damage:220<br>SKD040: always; lowest_ally; heal:131.74|
|9-3|本多忠勝 9-3/2/1|hp|17768|5330|
|9-3|本多忠勝 9-3/2/1|atk|2751|4127|
|9-3|本多忠勝 9-3/2/1|def|4003|3803|
|9-3|本多忠勝 9-3/2/1|skills|SKD009: always; first; damage:162.25|9-3/2/1/pressure-16: every_n_actions16; all_enemies; damage:440<br>SKD009: always; first; damage:162.25|
|9-3|濃姫 9-3/2/2|hp|18317|5495|
|9-3|濃姫 9-3/2/2|atk|2986|4479|
|9-3|濃姫 9-3/2/2|def|1910|1815|
|9-3|濃姫 9-3/2/2|skills|SKD046: always; lowest_ally; shield:99.32|9-3/2/2/pressure-16: every_n_actions16; all_enemies; damage:410<br>SKD046: always; lowest_ally; shield:99.32|
|9-3|豊臣秀吉 9-3/2/3|hp|21790|6537|
|9-3|豊臣秀吉 9-3/2/3|atk|1462|2193|
|9-3|豊臣秀吉 9-3/2/3|def|1590|1511|
|9-3|豊臣秀吉 9-3/2/3|skills|SKD040: always; lowest_ally; heal:131.74|9-3/2/3/pressure-16: every_n_actions16; all_enemies; damage:830<br>SKD040: always; lowest_ally; heal:131.74|
|9-4|前田利家 9-4/1/1|hp|140400|50544|
|9-4|前田利家 9-4/1/1|skills|SKD023: always; all_enemies; damage:90.26|9-4/1/1/pressure-16-p1: every_n_actions16; all_enemies; damage:800<br>SKD023: always; all_enemies; damage:90.26|
|9-4|浅井長政 9-4/1/2|hp|19620|7063|
|9-4|浅井長政 9-4/1/2|skills||9-4/1/2/pressure-16-p1: every_n_actions16; all_enemies; damage:700|
|9-4|武田信玄 9-4/2/1|hp|57508|20703|
|9-4|武田信玄 9-4/2/1|skills|SKD023: always; all_enemies; damage:90.26|9-4/2/1/pressure-16-p1: every_n_actions16; all_enemies; damage:680<br>SKD023: always; all_enemies; damage:90.26|
|9-4|柴田勝家 9-4/3/1|hp|6174|2222|
|9-4|柴田勝家 9-4/3/1|skills|SKD023: always; all_enemies; damage:90.26|9-4/3/1/pressure-16-p1: every_n_actions16; all_enemies; damage:490<br>SKD023: always; all_enemies; damage:90.26|
|9-4|島左近 9-4/3/2|hp|7314|2633|
|9-4|島左近 9-4/3/2|skills|SKD009: always; first; damage:162.25|9-4/3/2/pressure-16-p1: every_n_actions16; all_enemies; damage:370<br>SKD009: always; first; damage:162.25|
|9-5|上杉景勝 9-5/1/1|hp|53760|19354|
|9-5|上杉景勝 9-5/1/1|skills|SKD036: always; all_allies; def_up:22.92|9-5/1/1/pressure-12-p1.6: every_n_actions12; all_enemies; damage:736<br>SKD036: always; all_allies; def_up:22.92|
|9-5|前田利家 9-5/1/2|hp|35840|12902|
|9-5|前田利家 9-5/1/2|skills||9-5/1/2/pressure-12-p1.6: every_n_actions12; all_enemies; damage:688|
|9-5|石田三成 9-5/2/1|hp|34406|12386|
|9-5|石田三成 9-5/2/1|skills|SKD034: always; self; def_up:22.92|9-5/2/1/pressure-12-p1.6: every_n_actions12; all_enemies; damage:736<br>SKD034: always; self; def_up:22.92|
|9-5|島津義久 9-5/2/2|hp|26880|9677|
|9-5|島津義久 9-5/2/2|skills|SKD053: always; first_ally; cleanse:1|9-5/2/2/pressure-12-p1.6: every_n_actions12; all_enemies; damage:656<br>SKD053: always; first_ally; cleanse:1|
|9-5|毛利元就 9-5/2/3|hp|35840|12902|
|9-5|毛利元就 9-5/2/3|skills|SKD010: always; first; damage:162.25|9-5/2/3/pressure-12-p1.6: every_n_actions12; all_enemies; damage:576<br>SKD010: always; first; damage:162.25|
|9-5|明智光秀 9-5/3/1|hp|17600|6336|
|9-5|明智光秀 9-5/3/1|skills|SKD028: always; first; damage:146.96|9-5/3/1/pressure-12-p1.6: every_n_actions12; all_enemies; damage:1456<br>SKD028: always; first; damage:146.96|
|9-5|山本勘助 9-5/3/2|hp|17203|6193|
|9-5|山本勘助 9-5/3/2|skills|SKD038: always; first; def_down:18.86|9-5/3/2/pressure-12-p1.6: every_n_actions12; all_enemies; damage:1456<br>SKD038: always; first; def_down:18.86|
|9-8|柴田勝家 9-8/1/1|hp|38720|23232|
|9-8|島左近 9-8/1/2|hp|38720|23232|
|9-8|真田幸村 9-8/2/1|hp|159720|95832|
|9-8|真田幸村 9-8/2/1|skills|SKD013: always; first; damage:229.21|9-8/2/1/pressure-16: every_n_actions16; all_enemies; damage:600<br>SKD013: always; first; damage:229.21|
|9-9|竹中半兵衛 9-9/1/1|hp|48410|29046|
|9-9|雑賀孫市 9-9/1/2|hp|39680|23808|
|9-9|武田勝頼 9-9/2/1|hp|77464|46478|
|9-9|武田勝頼 9-9/2/1|skills|SKD023: always; all_enemies; damage:90.26|9-9/2/1/pressure-16-p1.6: every_n_actions16; all_enemies; damage:688<br>SKD023: always; all_enemies; damage:90.26|
|9-9|斎藤道三 9-9/3/1|hp|48410|29046|
|9-9|斎藤道三 9-9/3/1|skills|SKD032: always; first; stun:0|9-9/3/1/pressure-16-p1.6: every_n_actions16; all_enemies; damage:720<br>SKD032: always; first; stun:0|
|9-9|真田昌幸 9-9/3/2|hp|128960|77376|
|9-9|真田昌幸 9-9/3/2|skills|SKD032: always; first; stun:0|9-9/3/2/pressure-16-p1.6: every_n_actions16; all_enemies; damage:816<br>SKD032: always; first; stun:0|
|9-10|加藤清正 9-10/1/1|hp|62400|22464|
|9-10|直江兼続 9-10/1/2|hp|31200|11232|
|9-10|伊達政宗 9-10/2/1|hp|169000|60840|
|9-10|伊達政宗 9-10/2/1|skills|SKD022: always; all_enemies; damage:81.12|9-10/2/1/pressure-12-p1.6: every_n_actions12; all_enemies; damage:1264<br>SKD022: always; all_enemies; damage:81.12|
|9-10|本多忠勝 9-10/3/1|hp|22683|8166|
|9-10|本多忠勝 9-10/3/1|skills|SKD050: always; self; taunt:0,counter:78.76|9-10/3/1/pressure-12-p1.6: every_n_actions12; all_enemies; damage:896<br>SKD050: always; self; taunt:0,counter:78.76|
|9-10|織田信長 9-10/4/1|hp|44302|15949|
|9-10|織田信長 9-10/4/1|skills|SKD035: always; all_allies; atk_up:11.7<br>SKD007: always; first; damage:162.25|9-10/4/1/pressure-12-p1.6: every_n_actions12; all_enemies; damage:1072<br>SKD035: always; all_allies; atk_up:11.7<br>SKD007: always; first; damage:162.25|
|9-10|お市の方 9-10/4/2|hp|32500|11700|
|9-10|お市の方 9-10/4/2|skills|SKD040: always; lowest_ally; heal:114.61|9-10/4/2/pressure-12-p1.6: every_n_actions12; all_enemies; damage:928<br>SKD040: always; lowest_ally; heal:114.61|
|10-1|井伊直虎 10-1/1/1|hp|62624|27053|
|10-1|井伊直虎 10-1/1/1|skills|SKD034: always; self; def_up:26.35|10-1/1/1/pressure-14-last: every_n_actions14; all_enemies; damage:1133<br>SKD034: always; self; def_up:26.35|
|10-1|雑賀孫市 10-1/1/2|hp|25160|10870|
|10-1|雑賀孫市 10-1/1/2|skills|SKD040: always; lowest_ally; heal:131.74|10-1/1/2/pressure-14-last: every_n_actions14; all_enemies; damage:1835<br>SKD040: always; lowest_ally; heal:131.74|
|10-1|毛利元就 10-1/2/1|hp|20520|8864|
|10-1|毛利元就 10-1/2/1|skills|SKD026: always; last; damage:161.74|10-1/2/1/pressure-14-last: every_n_actions14; all_enemies; damage:2007<br>SKD026: always; last; damage:161.74|
|10-1|細川ガラシャ 10-1/2/2|hp|25160|10870|
|10-1|細川ガラシャ 10-1/2/2|skills|SKD040: always; lowest_ally; heal:131.74|10-1/2/2/pressure-14-last: every_n_actions14; all_enemies; damage:1616<br>SKD040: always; lowest_ally; heal:131.74|
|10-1|北条氏康 10-1/3/1|hp|78280|20291|
|10-1|北条氏康 10-1/3/1|skills|SKD034: always; self; def_up:26.35|10-1/3/1/pressure-14-last-wave3hp0.6period10: every_n_actions10; all_enemies; damage:1575<br>SKD034: always; self; def_up:26.35|
|10-1|上杉謙信 10-1/3/2|hp|25160|6522|
|10-1|上杉謙信 10-1/3/2|skills|SKD040: always; lowest_ally; heal:131.74|10-1/3/2/pressure-14-last-wave3hp0.6period10: every_n_actions10; all_enemies; damage:1600<br>SKD040: always; lowest_ally; heal:131.74|
|10-2|立花誾千代 10-2/1/1|hp|47150|28290|
|10-2|立花宗茂 10-2/1/2|hp|47150|28290|
|10-2|武田勝頼 10-2/2/1|hp|172200|103320|
|10-2|武田勝頼 10-2/2/1|skills|SKD013: always; first; damage:263.49|10-2/2/1/pressure-12: every_n_actions12; all_enemies; damage:2260<br>SKD013: always; first; damage:263.49|
|10-2|伊達政宗 10-2/3/1|hp|70533|42320|
|10-2|伊達政宗 10-2/3/1|skills|SKD022: always; all_enemies; damage:90.26|10-2/3/1/pressure-12: every_n_actions12; all_enemies; damage:680<br>SKD022: always; all_enemies; damage:90.26|
|10-2|井伊直政 10-2/3/2|hp|47150|28290|
|10-2|井伊直政 10-2/3/2|skills|SKD007: always; first; damage:180.53|10-2/3/2/pressure-12: every_n_actions12; all_enemies; damage:490<br>SKD007: always; first; damage:180.53|
|10-3|上杉景勝 10-3/1/1|hp|77700|18648|
|10-3|上杉景勝 10-3/1/1|skills|SKD036: always; all_allies; def_up:26.35|10-3/1/1/pressure-20-p1.6: every_n_actions20; all_enemies; damage:592<br>SKD036: always; all_allies; def_up:26.35|
|10-3|濃姫 10-3/1/2|hp|44100|10584|
|10-3|濃姫 10-3/1/2|skills|SKD046: always; lowest_ally; shield:114.18|10-3/1/2/pressure-20-p1.6: every_n_actions20; all_enemies; damage:1184<br>SKD046: always; lowest_ally; shield:114.18|
|10-3|加藤清正 10-3/2/1|hp|2187|525|
|10-3|加藤清正 10-3/2/1|skills|SKD034: always; self; def_up:26.35|10-3/2/1/pressure-20-p1.6: every_n_actions20; all_enemies; damage:512<br>SKD034: always; self; def_up:26.35|
|10-3|真田昌幸 10-3/2/2|hp|2424|582|
|10-3|真田昌幸 10-3/2/2|skills|SKD046: always; lowest_ally; shield:114.18|10-3/2/2/pressure-20-p1.6: every_n_actions20; all_enemies; damage:624<br>SKD046: always; lowest_ally; shield:114.18|
|10-3|徳川家康 10-3/3/1|hp|57803|13873|
|10-3|徳川家康 10-3/3/1|skills|SKD036: always; all_allies; def_up:26.35<br>SKD009: always; first; damage:180.53|10-3/3/1/pressure-20-p1.6: every_n_actions20; all_enemies; damage:1136<br>SKD036: always; all_allies; def_up:26.35<br>SKD009: always; first; damage:180.53|
|10-3|片倉景綱 10-3/3/2|hp|44100|10584|
|10-3|片倉景綱 10-3/3/2|skills|SKD046: always; lowest_ally; shield:114.18|10-3/3/2/pressure-20-p1.6: every_n_actions20; all_enemies; damage:1008<br>SKD046: always; lowest_ally; shield:114.18|
|10-4|山本勘助 10-4/1/1|hp|36550|21930|
|10-4|斎藤道三 10-4/1/2|hp|49450|29670|
|10-4|長宗我部元親 10-4/2/1|hp|49450|29670|
|10-4|大友宗麟 10-4/2/2|hp|36550|21930|
|10-4|明智光秀 10-4/3/1|hp|12410|7446|
|10-4|明智光秀 10-4/3/1|skills|SKD028: always; first; damage:162.96|10-4/3/1/pressure-12: every_n_actions12; all_enemies; damage:590<br>SKD028: always; first; damage:162.96|
|10-4|服部半蔵 10-4/3/2|hp|10370|6222|
|10-4|服部半蔵 10-4/3/2|skills|SKD029: always; first; damage:117.83,dot:17.57|10-4/3/2/pressure-12: every_n_actions12; all_enemies; damage:540<br>SKD029: always; first; damage:117.83,dot:17.57|
|10-4|山本勘助 10-4/3/3|hp|11977|7186|
|10-4|山本勘助 10-4/3/3|skills|SKD037: always; highest_atk_enemy; atk_down:17.57|10-4/3/3/pressure-12: every_n_actions12; all_enemies; damage:540<br>SKD037: always; highest_atk_enemy; atk_down:17.57|
|10-5|今川義元 10-5/1/1|hp|89540|26862|
|10-5|今川義元 10-5/1/1|atk|3504|6132|
|10-5|雑賀孫市 10-5/1/2|hp|50600|15180|
|10-5|雑賀孫市 10-5/1/2|atk|2098|3672|
|10-5|上杉景勝 10-5/2/1|hp|7691|2307|
|10-5|上杉景勝 10-5/2/1|atk|4849|8486|
|10-5|上杉景勝 10-5/2/1|skills|SKD036: always; all_allies; def_up:26.35|10-5/2/1/pressure-12: every_n_actions12; all_enemies; damage:220<br>SKD036: always; all_allies; def_up:26.35|
|10-5|長宗我部元親 10-5/2/2|hp|8490|2547|
|10-5|長宗我部元親 10-5/2/2|atk|2904|5082|
|10-5|長宗我部元親 10-5/2/2|skills|SKD008: always; first; damage:180.53|10-5/2/2/pressure-12: every_n_actions12; all_enemies; damage:360<br>SKD008: always; first; damage:180.53|
|10-5|織田信長 10-5/3/1|hp|117089|35127|
|10-5|織田信長 10-5/3/1|atk|1554|2720|
|10-5|織田信長 10-5/3/1|skills|SKD035: always; all_allies; atk_up:13.3<br>SKD007: always; first; damage:180.53|10-5/3/1/pressure-12: every_n_actions12; all_enemies; damage:670<br>SKD035: always; all_allies; atk_up:13.3<br>SKD007: always; first; damage:180.53|
|10-5|島津義弘 10-5/3/2|hp|50600|15180|
|10-5|島津義弘 10-5/3/2|atk|2098|3672|
|10-5|島津義弘 10-5/3/2|skills|SKD007: always; first; damage:180.53|10-5/3/2/pressure-12: every_n_actions12; all_enemies; damage:500<br>SKD007: always; first; damage:180.53|
|10-7|前田利家 10-7/1/1|hp|30750|18450|
|10-7|前田利家 10-7/1/1|atk|37450|46813|
|10-7|前田利家 10-7/1/1|def|420|357|
|10-7|立花宗茂 10-7/1/2|hp|52900|31740|
|10-7|立花宗茂 10-7/1/2|atk|4944|6180|
|10-7|立花宗茂 10-7/1/2|def|3220|2737|
|10-7|本多忠勝 10-7/2/1|hp|41940|25164|
|10-7|本多忠勝 10-7/2/1|atk|1047|1309|
|10-7|本多忠勝 10-7/2/1|def|4709|4003|
|10-7|本多忠勝 10-7/2/1|skills|SKD009: always; first; damage:180.53|10-7/2/1/pressure-16: every_n_actions16; all_enemies; damage:1380<br>SKD009: always; first; damage:180.53|
|10-7|真田幸村 10-7/3/1|hp|21474|12884|
|10-7|真田幸村 10-7/3/1|atk|2776|3470|
|10-7|真田幸村 10-7/3/1|def|4709|4003|
|10-7|真田幸村 10-7/3/1|skills|SKD013: always; first; damage:263.49|10-7/3/1/pressure-16: every_n_actions16; all_enemies; damage:520<br>SKD013: always; first; damage:263.49|
|10-7|真田昌幸 10-7/3/2|hp|24730|14838|
|10-7|真田昌幸 10-7/3/2|atk|2665|3331|
|10-7|真田昌幸 10-7/3/2|def|3450|2933|
|10-7|真田昌幸 10-7/3/2|skills|SKD046: always; lowest_ally; shield:114.18|10-7/3/2/pressure-16: every_n_actions16; all_enemies; damage:550<br>SKD046: always; lowest_ally; shield:114.18|
|10-9|浅井長政 10-9/1/1|hp|28800|10368|
|10-9|毛利元就 10-9/1/2|hp|35328|12718|
|10-9|濃姫 10-9/2/1|hp|32256|11612|
|10-9|濃姫 10-9/2/1|skills|SKD046: always; lowest_ally; shield:114.18|10-9/2/1/pressure-24-p2.5: every_n_actions24; all_enemies; damage:2025<br>SKD046: always; lowest_ally; shield:114.18|
|10-9|細川ガラシャ 10-9/2/2|hp|30720|11059|
|10-9|細川ガラシャ 10-9/2/2|skills|SKD040: always; lowest_ally; heal:131.74|10-9/2/2/pressure-24-p2.5: every_n_actions24; all_enemies; damage:2000<br>SKD040: always; lowest_ally; heal:131.74|
|10-9|真田幸村 10-9/3/1|hp|66060|23782|
|10-9|真田幸村 10-9/3/1|skills|SKD019: always; all_enemies; damage:90.26|10-9/3/1/pressure-24-targeted: every_n_actions24; all_enemies; damage:2265<br>SKD019: always; all_enemies; damage:90.26|
|10-9|豊臣秀吉 10-9/4/1|hp|161280|58061|
|10-9|豊臣秀吉 10-9/4/1|skills|SKD040: always; lowest_ally; heal:131.74<br>SKD011: always; first; damage:180.53|10-9/4/1/pressure-24-p2.5: every_n_actions24; all_enemies; damage:2350<br>SKD040: always; lowest_ally; heal:131.74<br>SKD011: always; first; damage:180.53|
|10-10|直江兼続 10-10/1/1|hp|27540|16524|
|10-10|長宗我部元親 10-10/1/2|hp|29808|17885|
|10-10|立花誾千代 10-10/2/1|hp|57500|34500|
|10-10|立花誾千代 10-10/2/1|skills|SKD023: always; all_enemies; damage:90.26|10-10/2/1/pressure-16-p1.6: every_n_actions16; all_enemies; damage:1104<br>SKD023: always; all_enemies; damage:90.26|
|10-10|山本勘助 10-10/3/1|hp|27200|16320|
|10-10|山本勘助 10-10/3/1|skills|SKD037: always; highest_atk_enemy; atk_down:17.57|10-10/3/1/pressure-16-p1.6: every_n_actions16; all_enemies; damage:480<br>SKD037: always; highest_atk_enemy; atk_down:17.57|
|10-10|島左近 10-10/3/2|hp|29440|17664|
|10-10|島左近 10-10/3/2|skills|SKD009: always; first; damage:180.53|10-10/3/2/pressure-16-p1.6: every_n_actions16; all_enemies; damage:1296<br>SKD009: always; first; damage:180.53|
|10-10|雑賀孫市 10-10/4/1|hp|57500|34500|
|10-10|本多忠勝 10-10/5/1|hp|29491|17695|
|10-10|本多忠勝 10-10/5/1|skills|SKD050: always; self; taunt:0,counter:89.05|10-10/5/1/pressure-16-p1.6: every_n_actions16; all_enemies; damage:1392<br>SKD050: always; self; taunt:0,counter:89.05|
|10-10|織田信長 10-10/6/1|hp|23069|13841|
|10-10|織田信長 10-10/6/1|skills|SKD035: always; all_allies; atk_up:13.3<br>SKD007: always; first; damage:180.53|10-10/6/1/pressure-16-p1.6: every_n_actions16; all_enemies; damage:1008<br>SKD035: always; all_allies; atk_up:13.3<br>SKD007: always; first; damage:180.53|
|10-10|加藤清正 10-10/6/2|hp|19661|11797|
|10-10|加藤清正 10-10/6/2|skills|SKD034: always; self; def_up:26.35|10-10/6/2/pressure-16-p1.6: every_n_actions16; all_enemies; damage:816<br>SKD034: always; self; def_up:26.35|