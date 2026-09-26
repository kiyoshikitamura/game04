# 共闘・侵攻供給FIXの実装引継ぎ

2026-09-25 20:50 JSTのユーザーFIXを実装。名称承認とは別の後続数値FIXとして採用。新正本はdocs/product/GAME04_RAID_SUPPLY_FIX_2026-09-25.md。再承認不要。

- 侵攻最終魂 TI01〜05＝10/15/20/25/30。通常/関門/個人勝利は魂なしのまま。
- 遭遇率：1〜4は維持。5＝10%、6＝15%、7〜10＝25%。1-1/1-2は0、自発開催中抑止とレア別比率は維持。
- 共闘個人勝利魂：5以降を新表へ。10はSR3/SSR2確定。全体討伐の確定魂と資格は維持。
- 既存snapshot・戦闘・台帳への遡及なし。新規開催は新しい報酬をsnapshotへ保存。既存snapshot参照の優先順位は維持。

## 検証

独立した承認本文から期待値を読み、65面/85共闘/5城×3抽選の全値を取得v31と比較。許容変更は今回の遭遇率・勝利魂・最終魂と、先に承認されたクエスト名だけ。その他の敵値・共通HP・スキル・報酬・期間・消費・レア抽選定義は変更なし。旧開催の報酬保持と新開催snapshotもPASS。

- verify-raid-supply.cjs PASS
- verify_game04_raid_formal.mjs PASS（85共闘、5城12段階、勝利/敗北/資格/旧段階精算/再送等の既存限定検査）
- verify-context-names.cjs PASS
- generatorのメモリ内出力と現在quest65全値差0
- TypeScript検査 PASS
- verify-candidates.cjs PASS。SQL未実行。

## 統合時

1. raid-supply-approved.jsonとraidFormalMaster/raidInvasionMaster、quest65とgeneratorの差分をG3を含む同一候補へ統合。旧API bundleを丸ごと配信しない。
2. DB quest65の名称65件＋遭遇率48件、DB territoryの最終魂5件を反映する必要がある。territory-master-candidate.sqlは最終魂も含む最新版へ更新済み。取得時旧JSON完全一致のCASを維持しているため、別担当が既に更新したDBへ強行適用しない。現在値を再取得し必要差分だけ作り直す。
3. 過去migration一括再適用禁止。旧room/battle/player所持を更新しない。snapshotなしの旧正式開催が見つかれば個別確認。
4. API実効値・DB・新開催snapshotを再採取して照合。新規エリア10の勝利魂、侵攻最終魂、エリア7〜10の遭遇率を限定受入する。実遭遇率を多数試行で推計する再試験は不要、参照値と抽選経路を確認する。
5. PR36の比較基準は旧approved-valuesに名称承認表と今回の承認本文を明示的に上書きしたもの。verify-snapshot.cjsを使用し、旧baselineへ戻さない。既取得v31/DBは790フィールド差でSTOP。配信未実施をPASSに変えない。

共有API/DB変更なし。G5統合配信・M実環境照合は統合担当へ。
