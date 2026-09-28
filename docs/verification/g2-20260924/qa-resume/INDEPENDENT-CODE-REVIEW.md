# 再開差分の独立コードレビュー

2026-09-24 UTC。実装担当の型/単体/SQL rollback結果とは別に、再開独立検証担当が統合workspaceの実経路を読んで確認。実UI再検証の代替ではない。

## 要修正候補 RV01

`resume-supply/box-formal-candidate.sql` の `game04_apply_formal_present` は親JSON pathのSQL NULLのみ検査し、親がobjectかを検査していない。既存在庫の親がJSON null/scalar/arrayでも検査を通る可能性がある。jsonb_setによる更新が期待pathに反映されないと、state version増加・present CLAIMEDだけが成立して付与されないリスクがある。

対象例：growthInventory.expItems.character=0、materials=null、growthInventory.soulSelectors=[]。親各段階のjsonb_typeof='object'検査、数量のnull/正整数検査、書込後valueの一致確認を推奨。親へ通知済み。最終判定は実Postgres read-only式/rollbackで確定し、必要修正後に記録へ追記する。

## その他の経路確認

- claim_presentはauth.uid→users行lock→本人present行lock→期限/未受取/数量→正式source/version/free検査→state行lockの順。受取完了は付与後で同一transaction。旧2引数も本人チェック後1引数へ委譲。claim_allも同じ経路を呼ぶ。正式sourceに購入/期限由来metadataがある場合は拒否し、外部決済接続済みと扱わない。
- GameContext法務復帰はhas_profileと同一userId・5分以内session markerの両方が必要。タイトル/設定の表示を復帰させる変更であり、ゲーム保存権限を追加しない。旧匿名QAでtutorial gameplay_authorized=falseのままでも本体設定へ戻す意図に整合。実表示は未再検証。
- Growth画像失敗時はCentralModalをunmountしinlinealert/retryへ移る。footerはGrowth section外なので離脱経路が残る。onClickCaptureはsection内のretry以外を抑止し、runも!ready拒否で消費操作を許可しない。共通loaderは12秒でsettleし失敗cacheを解除する。実時間/失敗UIは未再検証。
- KPI gameplay routeは既存proxy matcherの範囲内。認証設定なし503、資格不一致401。通過後server service client、GAME04 dev origin一致、service-only RPC。SQL functionはPUBLIC/anon/authenticated executeをrevokeしservice_roleへgrant。receipt allowlist、battle開始/完了の別集計、QA分類のevent-time判定、unmapped分離は整合。対象外購入値を成功指標へ混入していない。

コードレビューのみで受取保存・画面離脱・計測本体接続をPASSとはしない。

## RV01修正レビュー追記

親が `supabase/manual/game04_g2_formal_present_structure.sql` を追加し開発DBへ適用。独立担当がroot/all ancestorsのobject必須、既存leafのnumber必須、更新後値一致ガードを再読確認。指摘へのコード対応は成立。

独立回帰候補 `supabase/tests/game04_g2_formal_present_malformed_rollback.sql` を作成。専用QA d6dab/G2QA薬Fのみ、16ケース（parent array/scalar/JSON null、leaf string/null/array）で受取拒否・状態/version不変・UNCLAIMED維持を検査しROLLBACKする。DB実行は親担当、作成時点は未実行。

## RV02 正式version JSON null境界

claim_presentの正式version検査が `<>` のため、キーが存在し値がJSON nullの場合、SQL三値論理で拒否条件全体がNULLになり通過する（source/fundingが正常な場合）。`IS DISTINCT FROM`へ変更を親へ依頼。上記rollbackテストの17ケース目にJSON null版の拒否・状態/version不変・UNCLAIMED維持検査を追加した。サーバー生成metadata不正への整合性検査であり、一般利用者への書込権限を示すものではない。

## 親実行結果の受領

親からRV01/RV02修正適用後の17ケースrollback PASS報告を受領。さらに正式sourceでversionキー欠落も拒否し、旧source版なしを保持する補強が入った。ここでのDB実行者は親、独立担当は試験候補作成・修正コードレビューを担当した。
