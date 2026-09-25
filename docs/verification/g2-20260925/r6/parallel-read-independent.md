# R6 API read並列化 独立レビュー

対象：`supabase/functions/game04-redesign-api/source.ts` のprofile／prior request／acquisition入力の並列読取差分。ゲームルール・保存payload・DB RPC変更なし。

- 認証済みuser IDを取得してから、読み取り3件をPromise.allで開始する。
- live `game04_acquisition_input` の定義をpg_get_functiondefでSELECT確認。LANGUAGE sql STABLE、legacy snapshot／acquisition events／masterのSELECTのみ。書込み・初期化・ログボ付与なし。
- profile未登録時は先に拒否。保存/初期化は実行しない。
- prior requestがある場合、投機的なacquisition読取のエラーを無視して既存のfresh response経路へ進む。receiptと現在stateの復帰を保持。
- 新規mutationでacquisition読取に失敗した場合は更新へ進まない。成功した読取結果をstateForへ渡し、同じ読取を重複実行しない。
- CAS競合・セッション初期化・ログボ・commitは従来順。read、battle、host、restore観測など早期分岐の入力経路は並列対象外。

`node scripts/verify_g2_r6_parallel_read.cjs` を独立再実行：PASS。実際のEdge handlerをHTTP mockで実行し、3読取並行開始、新規保存のacquisition1回、再送fresh／読取失敗隔離、未profile非更新、CAS競合、read/auth経路を確認。

本差分に独立レビュー阻害なし。HTTP mockの証拠であり、配信後の実API／画面時間の合格を代替しない。
