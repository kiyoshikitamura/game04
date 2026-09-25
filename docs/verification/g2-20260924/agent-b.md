# G2 子B 資源・供給・商店・VIP

対象基準: e62d3894b54ce70aede4a23a8fc2599c40b744da。共有API/DBの反映・最終Preview受入は親が管理する。以下の「実装」は統合受入済みを意味しない。

## 根拠

- GAME04_MASTER_AUTHORITY_LATEST_2026-09-21 §5–7
- master_sources_20260921/missions.md（デイリー10＋ノーマル183）、soul_allocation.md（NM066–082、入口の採用範囲優先）
- 現行開発DBのgame04_get_state/commit_state/commit_growth_state、billing_apply_lot_delta/billing_buy_dia_product、process_login_bonus、VIP定義を読取。

## 修正・実装

|ID|問題と原因|是正|検証状態|
|---|---|---|---|
|B-U03-01|薬99→100で49を切捨て|shop.tsは使用前上限未満の制限を維持し+50全量保持。失敗非消費|99→149、上限時・薬0時拒否のdomain test PASS|
|B-U03-02|runtimeが50/180秒|runtime-energy-candidate.sqlで100/300秒のみ変更|親がDB適用・実経路検証|
|B-U08-01|shop_exchangeはstate.diamondsだけ減算、commitが破棄し無料で付与|専用原子RPC候補でwallet消費・在庫保存・request台帳を同一txn化|親が適用/実QA確認|
|B-U08-02|users.diamondsと正式決済neon_diamondsが分離。lotは有償優先|既存wallet投影、DIAMONDのみfree-first、既存dia商品へのpaid配賦も修正|旧列は保持、換算0件。独立A reviewを親に集約|
|B-U08-03|無効ID constructor等/侵攻令数量2が受理|own-property確認、侵攻令quantity=1確認|domain test PASS|
|B-Q04-01|交換所にMaster実装文・領土侵攻解放素材の旧語|内部説明削除、侵攻令へ統一、受取物を確認画面表示|統合mobile QAは親|
|B-Q01-01|交換クリック同時連打/処理中Close|ref排他とClose無効、整数入力確認|統合API再送QAは親|
|B-U07-01|正式任務DB空/旧任務UI|正式183報酬全件・17魂配賦・条件評価。NM171侵攻令1＋新4段階でnormal187|197件ID一意、初クリア/受取拒否/既存報酬総量domain PASS|
|B-U07-02|分解後育成実績消失/重複イベント|missionProgressで個体/種類の最高到達値、生涯所持、確定イベントID保存|分解後Lv100履歴・同イベント2回で増加1 domain PASS|
|B-U07-03|ログボ旧1アイテム/日|正式30日の複数報酬関数・原子付与SQL候補・state receipt・正式Dialog|総量/周期/JST境界/未ログイン遡及なし domain PASS。DB/実UIは親|
|B-U09-01|VIP480円未設定・旧grantは期限積増しのみ|価格/30×100/720h/696h純粋契約、GRANTED注文検証・delivery台帳・worker SQL候補|時間境界/再購入拒否domain PASS。販売は未有効化|

## Wallet旧資産の集計

2026-09-24取得。利用者IDは出力せず全46件集計。

- users.diamonds正残高: 0件、合計0。
- users.neon_diamonds正残高: 46件、合計9,200。
- 2列不一致: 46件。
- 正式決済wallet参照修正に残高換算/合算は不要。旧列を保持し一括移行しない。
- paid-lot有効期限を薬/銭/侵攻令へ引継ぐ商材契約は未完成。現在の交換先はstate在庫でlot紐付けがない。付与itemごとのsource lot/issued_at/expires_at/残数と消費時期限検査をP02へ接続する必要。free-firstだけで有償交換商材全体合格とはしない。

## 正式任務の件数

原文normal183 + daily10 =193をそのまま保持。最新入口の侵攻個人戦勝利1/5/10/20/30による侵攻令5枚は、既存NM171（1勝）へ1枚追加し、新たな5/10/20/30の4行を追加。最終台帳normal187 + daily10 =197。元183を削除/置換して帳尻合わせしない。

NM066–082の固有魂はsoul_allocationの武将IDへ解決。汎用魂置換や数値推測なし。

### 必須未完・判断事項

1. **daily10は無効維持**。JST0は入口で確定。跨日戦闘所属日（推奨=結果確定日）、未受取処理（推奨=JST0で失効、補填なし／代案=保持し後日受取）、日次侵攻令の追加対象（推奨=クエスト1回クリアDM004、代案=3回DM005/5回DM006）の後続承認が未確認。報酬と件数のmasterは作成済みだが無断で新ルール採用しない。G3ノーマル抽選のdaily eventはG3で正式接続再受入。
2. 正式任務イベント接続・過去実績復元は確認できる保存値のみ。現在所持をsnapshotで保存、過去の分解/戦闘を推測しない。Cのraid qualifiedカウンタは開催突破時の既存grantを根拠に親統合。
3. ログボSQLは既存累計/当日受取を保持し、未受取日から正式付与。当日の旧付与を正式複数報酬として表示しない。実DB再送/日跨ぎ/在庫照合は親の専用QAが必要。
4. VIPの既存grant/entitlement/注文は全0。productも未接続。P02は支払前の有効VIP再購入拒否、480円注文、test決済成功→権利→初回100、return/webhook再送を検証する。workerは既存DB schedulerからログイン不要で呼ぶ必要。候補は定期実行サービスや販売を自動新規設定しない。
5. BOXからの育成素材・選択魂付与はAの在庫契約と親の実DB照合を待つ。旧マスター表示だけで成立扱いしない。

## 検証

`node scripts/verify_game04_g2_supply.mjs` PASS。これはdomain境界/数量/重複拒否の検証であり、本体・認証付きAPI・DB・再読込・モバイルの受入代替ではない。

- 行動力99/100/薬0/超過保持、交換10個/不正小数/不正ID/不正数量。
- ログボ30日: 信長魂60、銭300000、券2/4/2、EXP大6/12、無償輝石300、JST境界、31日目1周目に戻る。
- VIP: 購入即時1、24時間前0/到達1、696時間で30、720時間満了、同ordinal再付与なし、有効中再購入拒否。
- 任務: base183/daily10+latest4のID一意、NM001実stage ID、二重受取不可、分解後履歴、同settled event再送不加算、原文合計銭1427000/スキルLB494/装備LB551/魂150。

## 変更ファイル

shop.ts / vip.ts / loginBonus.ts / missions.ts / missionProgress.ts / formalMissions.ts / data/formalMissions.json / types.ts（login receiptのみ） / ShopExchangePanel.tsx / MissionContent.tsx / FormalLoginBonusModal.tsx / formalLoginBonus.css / RedesignCommerceOverlays.tsx / verify_game04_g2_supply.mjs と本ディレクトリSQL候補。

最終SHA/Preview/API版/実DB差分は親の統合結果が正本。
