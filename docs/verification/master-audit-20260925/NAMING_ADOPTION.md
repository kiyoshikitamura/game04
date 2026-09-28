# 名称一括案 採用・実装引継ぎ

承認：2026-09-25 20:24 JST ユーザー「はい、問題ないです。採用します。」

`NAMING_PROPOSAL.md` / `naming-proposal.json`の名称・配役案を全件採用。提案時ファイルは履歴として保持し、現在の採用状態は本書・name-authority.json・src/domain/redesign/data/context-names.jsonを優先する。再承認不要。

## 実装

- 65面のquest.nameだけを採用場面名へ更新。攻略description、全敵ID/数値/技能/報酬/進行は完全一致を検証。生成処理は承認名称表を使い、conceptをnameへ戻さない。生成をメモリ上で実行し、現JSONとの全値差0も確認。
- contextNames.tsが明示IDで名前/役割を表示へ投影。356敵配置・共闘85組・侵攻60段階の採用表を接続。本人のcanonical nameや所持名は変更しない。名前の違う旧snapshotにも新配役名を強制しない。
- 出陣一覧/詳細/出撃準備/結果/再生見出し、本陣の継続title、共闘一覧/詳細/履歴/救援確認/準備、本陣の遭遇案内、戦闘の敵名/詳細、侵攻の場面/役割に接続。共闘カードはタイトルと武将・地域を分けて表示。
- 生成候補patchは適用した実装に置き換え済み。旧patchを重ねて適用しない。
- immutableなapproved-values.jsonの旧名称には、verify-snapshotがname-authority.jsonの採用名をnameフィールド限定で優先適用する。観測dumpを期待値に上書きしない。

## 検証

- `node scripts/master-audit/verify-context-names.cjs` PASS：全ID・値不変・味方名前不変・旧snapshot不変。
- `npx tsc --noEmit --incremental false` PASS。
- generator出力をメモリへ取得しquest65.jsonと全値比較：差0。DB/ファイルへの生成書込みなし。
- `verify-names.cjs`：repository名称NG 0件。既取得v31/DBは各65件NGのまま。表示側だけ直ったことを配信master修正済み扱いにしない。
- React Best Practices確認：名称Mapはmodule scope、追加fetch/effect/stateなし。既存操作・アクセシブル名を保持。実DOM/実機表示・折返し受入は未実施。

## 統合担当へ

1. G2共通Previewへこのコミットの名称差分を取り込む。既存G3/G4/コミュニティ最新版を巻き戻さない。本ブランチの古いAPI bundleを配信しない。
2. 新しいcontext-names.jsonをフロントへ、名称更新済みquest65.jsonをG3統合APIの生成元へ含める。DB quest65の65nameも現値条件付きで同期し、name以外の差を混ぜない。共有API/DB反映は本担当では実施していない。
3. PR35側のコミュニティ活動・救援投稿の新しい表示経路へ `raidDisplayTitle` / `raidDisplayLabel` を明示master IDで接続する。既存の保存済みチャット本文や活動文の一括置換はしない。本基準G2にはPR35の最終表示経路が含まれないため、統合差分で1か所に接続し二重実装を避ける。
4. 出陣/共闘/侵攻から代表各1画面で名称・武将名・役割・折返しを限定確認する。一般敵の戦闘カード/詳細も1件確認。既保存の戦闘ログ本文は原記録を保持する。
5. 候補SHA/API版/DBを採取し65名称を再照合。再生成の名称巻き戻り、旧データ優先、ID誤対応がなければMA08の統合待ちを解除する。MA07ほか別の停止事項は維持。

名称案の承認待ちは解消。実装はGit保存、共有環境への配信と統合表示受入は未実施。
