# G2 継続 統合差分独立レビュー

担当E。基準79669373からの取得済みコード差分をレビュー。対象・実行時sha256は `integration-targeted-results.json`。本記録で本体/実端末/配信API受入を代替しない。

## A 育成/自動装備

`growth.ts` のSKILL_MASTERSはOWNABLE_SKILL_MASTERSのaliasであり、正式72を除外する修正ではない。未知masterのみ自動選択対象から外し、所持原本は保持。装備の未知slotをweaponとして扱う旧fallbackを除去し、instance重複を防ぐ。既存並び順を維持。

独立再実行: auto_equip_compat、master_growth PASS。正式SKD071共有/有効デッキ保存、未知だけの空slot、在庫保持、累計育成境界を確認。API配信/本体自動装備は未確認。

## C 戦闘画像失敗復帰

画像errorの同result・同imageKeyでのみ終了操作を許可。終了の多重呼出しをrefで防ぎ、再試行はloadingへ戻す。既存API確定結果を再生から離脱するだけで、戦闘開始/再付与requestを追加しない。VIP限定skip条件は変更しない。

指摘E01: 初版CTA「戦闘結果へ進む」はQuestのonCompleteでは結果へ進むが、RedesignAppのraid onCompleteでは共闘画面へ戻る。親へ通知し、共通文言「再生を終了する」への是正を依頼済み。最終コードでの文言確認は別途記録する。

既存battle_raid、raid_start_snapshotを独立再実行PASS。画像cache失敗後再試行、6Wave/開始SP、旧snapshot計算不変は局所試験。Dialogの実時間エラー/終了操作は本体未確認。

## D 本陣活動/モバイル

feed RPCと公開プロフィールRPCを分離し、プロフィール未解決でもfeedを描画可能。feed失敗時に既存activitiesを消さず、エラーと0件を区別。依存cleanupが古いresponseを破棄。プロフィール取得はuser IDのsorted unique集合で動き、同内容のsocialEvents再生成によるfeed再取得を抑止。

未解決観点: RPC自体が未settleの場合にtimeout/abortがなくactivityLoadingは継続する。画面全体の操作をロックしないが、無限待機解消の合格とはしない。親へ通知。通信timeoutの実測・復帰は未確認。

Quest CSSはminmax(0,1fr)/min-width:0/overflow-wrapで名称・数量を折り返し、情報をhiddenで隠さない。数値/CTA到達と実画面は別途未確認。

React component実行に必要なjsdom/happy-dom/react-test-rendererは未導入。独自模擬hook実装を用いてReactのeffect/DOM復帰を合格扱いにしていない。上記はコードレビュー。

## B 供給KPI

`game04_g2_kpi_supply.sql` と `supply/route.ts`、rollback候補を独立読解。適用を妨げる不整合は検出していない。DB適用/実Postgres rollbackは親が担当。

- ログボproducerのstate更新→progress更新順とtriggerの正式版/日付/total/day検査が一致。同transactionでcaptureする。過去履歴の推測backfillなし。
- INSERT/UPDATE双方を捕捉。total不変UPDATEを除外し、(user,date)/(user,total)一意で重複を除外。
- 新台帳RLS/anon・authenticated権限撤去、service-only集計、既存Next middlewareの管理者認証、GAME04開発URL照合を維持。
- BOXは正式無償19ID・受取済・期限内・有償metadataなし。GAME04_QAはsubjectの有無にかかわらずexcluded。
- その他のQA分類は発生時点、未結合はunmapped。VIPはfree_diamonds数量であり購入売上ではない。ログボ数量はbundle件数とレスポンスに明示。
- mission報酬詳細/外部決済/保存復帰計測は未カバーとrouteに明示。

既存KPI試験のURLだけメモリ内で `/api/admin/kpi/v2/supply` へ置き換え、Next matcher/設定なし503/資格なし・誤り401/正しい試験資格で継続を確認PASS。ファイルは変更していない。配信HTTPの検証ではない。

rollback候補は正式capture/重複/QA BOX正確1件/期限/権限/期間を検査する。過去版・null・stale receipt拒否はコード確認のみ。親の実行結果が出るまでSQL試験をPASSとしない。

## 判定

局所差分に対する独立レビューと5試験は成立。E01文言是正、Home未settle待機、同候補実UI/保存/計測/全状態/外部依存を残し、U10/U11・G2は未完。既存成果は巻き戻していない。

### E01 是正追記

Cの後続修正でBattleView CTAが「再生を終了する」へ変わったことを独立に再読確認。Quest/raid双方のコールバック動作と矛盾する結果画面の約束を解消。コード上の指摘はクローズ。実画像error→終了UI操作の受入は引き続き未確認。

### E02 本陣未settle待機の是正追記

D後続HomeView修正を独立再読し、`scripts/verify_g2_home_activity_async.cjs` を再実行PASS。実effect本文を抽出し、state setter/transport/timerを試験用に与える局所試験であり、React component/DOM全体の実行ではない。

- 未settleでも12秒timer自体がloading解除・error表示state・abortを行う。transportがabortを無視してもUI状態は復帰できる。
- timeout時にcancelledを立て、後着responseによる既存/再試行結果の上書きを防ぐ。
- success/error/throw時のtimer解放、unmount/依存変更cleanupのabort・timer解放を確認。
- 独立試験で未settle/abort/後着破棄/再試行成功/既存一覧保持を確認。既存コード `src/app/context/hooks/useChat.ts` のコミュニティ読取更新上限12,000msと一致する。全APIの性能合格基準が確定したとはしない。

E02はコード・局所試験としてクローズ。配信版本陣/交流Dialogのerror・再読み込みCTA、実通信条件の12秒観測は未受入のまま。

### 親の供給DB検証結果受領

親よりGAME04開発migration `20260924183511` 適用、rollback内の全ASSERT通過、`ledger_count=0` によるrollback確認の報告を受領。E自身がDB実行したものではない。AdvisorのRLS enabled/no policiesはservice-only台帳の意図と一致。一般ユーザー読み取りを追加する必要はない。

親のbundle比較でbaseline/updated API hash完全一致、今回のautoEquip関数がAPI bundleに含まれないことを確認したとの報告を受領。稼働API v23維持と今回フロント修正は両立する。API未配信不具合として再計上しない。

### R2UI05 お知らせread timeout 独立確認

Dの `InboxPanel.tsx` / `verify_g2_news_async.cjs` を独立読解し、試験を再実行PASS。実行時hash/出力を `integration-targeted-results.json` のfollowupR2UI05へ保存。

- news一覧readだけへ12秒timer/AbortControllerを追加。タイムアウトはtimer自身からerror/loading解除を行い、transport未settleでも再試行状態へ移る。
- timeout後や閉じる/tab切替cleanup後のresponseはcancelledで破棄。timer・signalを正常完了/cleanupで解放。
- 一覧は成功時だけ置換し、エラー時は既取得一覧を保持。空結果成功はerrorなしの空表示になる。現render条件でもloading/errorと「お知らせはありません」を同時表示しない。
- 受取/一括受取とpresentClaimLoadingの排他は変更なし。read timeoutを金銭/在庫mutationのロック解除へ流用していない。
- 取得成功、応答error、throw、未settle、abort、後着抑止、再試行空成功、cleanupを抽出effect試験で確認。DOM/ブラウザを実行した証拠ではない。

コード・局所試験としてR2UI05の是正成立。配信版本体でのtimeout/retry CTA・一覧保持の観測は親の実検証へ残る。新たな修正要求なし。
