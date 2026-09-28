# R5 添付背景の採用・本体接続

ユーザー 2026-09-25追加指示を正本とし、旧クエスト「既存3＋候補7」案を今回添付10点に置換。SSR10点は素材採用のみ確定、解放細則未承認のため本陣へ公開せず準備。

## 反映と原本

- 添付原本ZIPは変更せず保持。ファイルID、ZIP SHA256、各PNG日本語名・SHA256をbackground-manifest.jsonに保存。79MBの原本重複をGitへ追加しない。
- 配信35点はWebP quality86、最大960×1720内へ縦横比保持。元画像が上限内のため寸法そのまま。切抜き・描き換えなし。配信合計 8996112 bytes。
- Quest一覧・詳細・戦闘はQUEST_AREASの正式area IDから解決。侵攻一覧/詳細/確認/開催中/共闘内侵攻/戦闘再生は正式castle IDと段階から解決。
- 通常=1/2/4/5/7/8/10/11、関門=3/6/9、城主=12（raidInvasionMaster正式12段階）。敵数値・進行・報酬変更なし。
- 撃破後roomが次段階へ進んでも、再生はraidStartSnapshot.levelを使用。開始snapshotのない旧記録に現在room段階を借用しない。旧snapshot本体は不変。

## 対応表

| 種別 | 元ファイル | 正式ID・区分 | 配信先 |
|---|---|---|---|
| invasion | 01_岡崎城_通常戦.png | TI01 normal | /bg/approved-20260925/invasion-TI01-normal.webp |
| invasion | 02_岡崎城_関門戦.png | TI01 gate | /bg/approved-20260925/invasion-TI01-gate.webp |
| invasion | 03_岡崎城_城主戦.png | TI01 lord | /bg/approved-20260925/invasion-TI01-lord.webp |
| invasion | 04_長浜城 _通常戦.png | TI02 normal | /bg/approved-20260925/invasion-TI02-normal.webp |
| invasion | 05_長浜城_関門戦.png | TI02 gate | /bg/approved-20260925/invasion-TI02-gate.webp |
| invasion | 06_長浜城_城主戦.png | TI02 lord | /bg/approved-20260925/invasion-TI02-lord.webp |
| invasion | 07_春日山城_通常戦.png | TI03 normal | /bg/approved-20260925/invasion-TI03-normal.webp |
| invasion | 08_春日山城_関門戦.png | TI03 gate | /bg/approved-20260925/invasion-TI03-gate.webp |
| invasion | 09_春日山城_城主戦.png | TI03 lord | /bg/approved-20260925/invasion-TI03-lord.webp |
| invasion | 10_躑躅ヶ崎館_通常戦.png | TI04 normal | /bg/approved-20260925/invasion-TI04-normal.webp |
| invasion | 11_躑躅ヶ崎館_関門戦.png | TI04 gate | /bg/approved-20260925/invasion-TI04-gate.webp |
| invasion | 12_躑躅ヶ崎館_城主戦.png | TI04 lord | /bg/approved-20260925/invasion-TI04-lord.webp |
| invasion | 13_安土城_通常戦.png | TI05 normal | /bg/approved-20260925/invasion-TI05-normal.webp |
| invasion | 14_安土城_関門戦.png | TI05 gate | /bg/approved-20260925/invasion-TI05-gate.webp |
| invasion | 15_安土城_城主戦.png | TI05 lord | /bg/approved-20260925/invasion-TI05-lord.webp |
| quest | 01_三河の地 _.png | mikawa | /bg/approved-20260925/quest-mikawa.webp |
| quest | 02_尾張の旗_.png | owari | /bg/approved-20260925/quest-owari.webp |
| quest | 03_美濃の城  _.png | mino | /bg/approved-20260925/quest-mino.webp |
| quest | 04_近江の湖_.png | omi | /bg/approved-20260925/quest-omi.webp |
| quest | 05_甲斐の山.png | kai | /bg/approved-20260925/quest-kai.webp |
| quest | 06_越後の雪.png | echigo | /bg/approved-20260925/quest-echigo.webp |
| quest | 07_京洛の影.png | kyoto | /bg/approved-20260925/quest-kyoto.webp |
| quest | 08_出雲の社.png | izumo | /bg/approved-20260925/quest-izumo.webp |
| quest | 09_薩摩の炎.png | satsuma | /bg/approved-20260925/quest-satsuma.webp |
| quest | 10_関ヶ原.png | sekigahara | /bg/approved-20260925/quest-sekigahara.webp |
| ssr | 上杉謙信 _雪の春日山城.png | char_koharu_01 | /bg/approved-20260925/ssr-char_koharu_01.webp |
| ssr | 伊達政宗 _青葉城と仙台城下.png | char_leo_01 | /bg/approved-20260925/ssr-char_leo_01.webp |
| ssr | 前田慶次_米沢城下・花の宴.png | char_mio_01 | /bg/approved-20260925/ssr-char_mio_01.webp |
| ssr | 徳川家康_駿府城と城下.png | char_karen_01 | /bg/approved-20260925/ssr-char_karen_01.webp |
| ssr | 明智光秀_琵琶湖畔の坂本城.png | char_miyabi_01 | /bg/approved-20260925/ssr-char_miyabi_01.webp |
| ssr | 本多忠勝_大多喜城を望む山道.png | char_kengo_01 | /bg/approved-20260925/ssr-char_kengo_01.webp |
| ssr | 武田信玄_躑躅ヶ崎館と甲府盆地.png | char_go_01 | /bg/approved-20260925/ssr-char_go_01.webp |
| ssr | 真田幸村 _上田城.png | char_kaede_01 | /bg/approved-20260925/ssr-char_kaede_01.webp |
| ssr | 織田信長_安土城.png | char_reiji_01 | /bg/approved-20260925/ssr-char_reiji_01.webp |
| ssr | 豊臣秀吉_黄金期の大坂城.png | char_ageha_01 | /bg/approved-20260925/ssr-char_ageha_01.webp |

## 限定検証

- `node scripts/verify_g2_r5_backgrounds.cjs`: PASS。35画像存在/非ゼロ/ハッシュ一致、quest10ID、侵攻60段階対応、SSR10、誤room開始snapshot拒否、旧記録fallback。
- Pillow全35画像decode成功、contactsheet全35点視認。余計な切抜きや番号違いなし。
- `tsc --noEmit --pretty false`: PASS（親統合前時点）。
- 実Previewでのモバイル表示・画像HTTPは親の統合候補で確認。contactsheet/静的検証を実表示・実機合格に代用しない。
- SSR解放→選択→保存は未承認細則に依存。素材のみ準備、機能受入未実施。

## 担当変更ファイル

- src/domain/redesign/approvedBackgrounds.ts
- src/domain/redesign/quests.ts
- src/app/components/redesign/{QuestView,TerritoryView,RaidView,RedesignApp}.tsx
- public/bg/approved-20260925/*.webp（35）
- scripts/verify_g2_r5_backgrounds.cjs
- docs/verification/g2-20260925/r5/background*（manifest、対応記録、35点contactsheet、check結果）

QuestView/TerritoryViewは採用素材のgrowthRewardImage接続も同時反映（素材担当共通helper）。マスター・API・DBはこの担当で変更なし。
