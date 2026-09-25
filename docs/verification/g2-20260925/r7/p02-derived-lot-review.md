# P02 有償輝石交換の派生lot接続候補

## 根拠と範囲

GAME03既存 `20260913120945_billing_dia_approved_contract.sql` は有償DIA交換由来の資産へ元lotのissued_at/expires_at/source_lot_idを継承し、商品数量の有償比率を累積ceilで配分する。GAME04正式仕様の無償輝石優先を反映し、今回の実有償消費分のみ同方式で記録する。120日を交換日に再起算しない。

新規の回復薬・銭・侵攻令交換のみ対象。既存残高、過去交換、旧lotの換算や再分類なし。魂交換（輝石0）は従来経路を保持。

## 候補

`supabase/candidates/game04_p02_exchange_derived_lots.sql`。P31正式素材candidate適用後に使用。親が反映する。こちらではDB変更なし。

- ユーザーmutex→request再送確認→期限済輝石控除→state/version確認。
- 商品の正式数量/価格とstate差分を照合。
- `max(0, cost - free_balance)`だけ元有償lotから期限順に記録。
- 既存commit_growth_stateが資産とreceiptを保存。失敗なら輝石控除もロールバック。
- 成功後、二重付与をせずCLAIMED provenance presentと派生lotを同transaction内に登録。
- 回復薬と侵攻令はformal JSON state側trigger。銭は従来cash側trigger。新規lotはgrant更新の後に作るため自分の付与を消費扱いにしない。
- 同request再送は既存receiptを返し派生lotを増やさない。

## 検証

`supabase/tests/game04_p02_exchange_derived_rollback.sql` を作成。親によるcandidate同transaction rollback実行待ち。未実行をPASS扱いにしない。

予定assert: 無償120＋有償300から150消費、薬3のうち1だけ有期限、元期限保持、再送無追加、CAS失敗全戻し、薬消費paid優先、薬/銭/侵攻令の失効、無料資産保持。専用G2QAユーザーのみで全試験変更はrollback。

SP券についてはP31/G3側が最新gachaTicketBalancesとlegacy user_items投影の契約を調整中。本候補では券経路を変更しない。
