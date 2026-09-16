# GAME04 キャラクター・ロゴ置換対応表

添付ZIPの60体を元のPNGバイトのまま採用。ロゴの正式表記は添付に合わせて「戦国姫艶舞」。GAME03のキャラクターID、レアリティ、属性、能力値、排出率、既存画像パスを保持し、表示名と画像のみ置換する。

## dev用の仮配置

GAME03本番はSSR10/SR20/R20/N10、提供素材はSSR10/SR15/R20/N15。システムを完全維持するため、N素材の戦闘職5体（くノ一・僧兵・女侍・戦巫女・陰陽師）をSR枠に仮配置。これは正式なGAME04レアリティ設計ではない。`src/theme/sengoku-characters.json` に元フォルダのレアリティを保存し、後で対応を交換できる。

SRフォルダ内の今川義元・長宗我部元親・加藤清正・直江兼続は元ファイル名がR_だが、フォルダを正としてSR扱い。

## 置換範囲

- public/characters の稼働60パスと public/old の同名互換素材。
- public/branding/tribe-neon-logo.png：元ロゴをそのまま配置。
- canonical masterの表示名にテーマmapper適用。元JSONのゲーム性能は変更しない。
- 他プレイヤー詳細の編成名にも同じmapperを適用し、DBの旧表示名が返っても戦国名を表示する。
- チュートリアル案内人などの直書きキャラクター名を置換。
- 背景、スキル、装備、バナー、タイトルキービジュアル等の合成画像は今回の「他素材はそのまま」に従って維持。そこに焼き込まれたGAME03キャラクターやロゴは残る。

## 対応

| ID | GAME03名 | GAME04名 | 実レアリティ | 素材レアリティ |
|---|---|---|---|---|
| char_ageha_01 | アゲハ | 豊臣秀吉 | SSR | SSR |
| char_alice_01 | アリス | くノ一 | SR | N |
| char_aoi_01 | アオイ | お市の方 | R | R |
| char_cecile_01 | セシル | 井伊直虎 | SR | SR |
| char_chang_01 | チャン | 上杉景勝 | R | R |
| char_daimon_01 | ダイモン | 井伊直政 | R | R |
| char_genji_01 | ゲンジ | 今川義元 | SR | SR |
| char_go_01 | ゴウ | 武田信玄 | SSR | SSR |
| char_gou_01 | ダイスケ | 伝令 | N | N |
| char_jihoon_01 | ジフン | 前田利家 | R | R |
| char_joe_01 | ジョー | 北条氏康 | R | R |
| char_kaede_01 | カエデ | 真田幸村 | SSR | SSR |
| char_kageyama_01 | カゲヤマ | 僧兵 | SR | N |
| char_kaito_01 | カイト | 大友宗麟 | R | R |
| char_karen_01 | カレン | 徳川家康 | SSR | SSR |
| char_kengo_01 | ケンゴ | 本多忠勝 | SSR | SSR |
| char_kenji_01 | ケンジ | 山伏 | N | N |
| char_koharu_01 | コハル | 上杉謙信 | SSR | SSR |
| char_leo_01 | レオ | 伊達政宗 | SSR | SSR |
| char_leon_01 | レオン | 加藤清正 | SR | SR |
| char_long_01 | ロン | 女侍 | SR | N |
| char_lucas_01 | ルーカス | 島津義弘 | SR | SR |
| char_makoto_01 | マコト | 小早川隆景 | R | R |
| char_mark_01 | マーク | 小松姫 | R | R |
| char_martina_01 | マルティナ | 戦巫女 | SR | N |
| char_masato_01 | マサト | 弓兵 | N | N |
| char_maya_01 | マヤ | 服部半蔵 | SR | SR |
| char_mei_01 | メイ | 山本勘助 | R | R |
| char_minami_01 | ミナミ | 島左近 | R | R |
| char_mio_01 | ミオ | 前田慶次 | SSR | SSR |
| char_miyabi_01 | ミヤビ | 明智光秀 | SSR | SSR |
| char_momoko_01 | モモコ | 島津義久 | R | R |
| char_naoto_01 | ナオト | 漁師 | N | N |
| char_noa_01 | ノア | 柴田勝家 | SR | SR |
| char_reiji_01 | レイジ | 織田信長 | SSR | SSR |
| char_reina_01 | レイナ | 毛利元就 | SR | SR |
| char_ren_01 | レン | 斎藤道三 | R | R |
| char_ren_male_01 | カズヤ | 本願寺顕如 | R | R |
| char_riki_01 | リキ | 濃姫 | SR | SR |
| char_rin_01 | リン | 武田勝頼 | R | R |
| char_rui_01 | ルイ | 直江兼続 | SR | SR |
| char_sakura_01 | サクラ | 真田昌幸 | SR | SR |
| char_sawat_01 | サワット | 火薬師 | N | N |
| char_seiya_01 | セイヤ | 石田三成 | SR | SR |
| char_serika_01 | セリカ | 浅井長政 | R | R |
| char_shin_01 | シン | 片倉景綱 | R | R |
| char_shion_01 | シオン | 甲斐姫 | R | R |
| char_shun_01 | シュン | 町娘 | N | N |
| char_sora_01 | ソラ | 立花誾千代 | SR | SR |
| char_souta_01 | ソウタ | 茶屋の娘 | N | N |
| char_taiga_01 | タイガ | 長宗我部元親 | SR | SR |
| char_takeshi_01 | タケシ | 陰陽師 | SR | N |
| char_takuro_01 | タクロウ | 雑賀孫市 | SR | SR |
| char_tatsuya_01 | タツヤ | 行商人 | N | N |
| char_tetsu_01 | テツ | 黒田官兵衛 | SR | SR |
| char_tomoya_01 | トモヤ | 鉄砲兵 | N | N |
| char_yoshihiko_01 | ヨシヒコ | 鍛冶師 | N | N |
| char_yuji_01 | ユウジ | 立花宗茂 | R | R |
| char_yuki_01 | ユウキ | 竹中半兵衛 | R | R |
| char_yukina_01 | ユキナ | 細川ガラシャ | R | R |
