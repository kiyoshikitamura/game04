# G2 R8 継続結果・統合候補と配信順

2026-09-25 JST。基準PR #30 `d328cc292ecdbf4ac163e6f33f2de95e399f0c3b`。G2未完、main/Production変更なし。API/DB/state書込みなし。G3優先中のため候補は未配信、性能基準未達を維持する。

## 今回完了

1. 回収作業を終了。v31本文保存・稼働一致、保存80回再集計は完了として継承。実戦闘20回最終ログは回収不能範囲と確定し、旧ブラウザ再試行は行わない。次の統合候補で不足分を計測する。
2. 保存待ちの主成分と削減可能な直列通信を特定し、編成保存だけに限定した既定OFFの候補を実装。source/bundle/SQL候補・限定検証を保存。
3. G3 `2d280db6` の正式sourceへ、Git保存済みG2の可読roomsForをそのまま移す正確なpatchと参照sourceを作成。G3の受領待ちを解消するための実装根拠を具体化。
4. SSRの現在保存状態を集計SELECTで確認。実refresh callbackのセッション切替境界を追加ローカル検証。障害復帰の未受入は既存証拠との対応を確定。
5. 管理KPIの現在DB読取を確認。外部設定を開発/本番・確認済み/ユーザー報告/未確認へ分離。DNS/TLSは最新P06記録を採用して旧未設定記載を撤回。
6. PR #34のFIX版とG2の共有ファイル差分・本体接続不足を整理。承認済み演出/文言/導線は変更していない。

## 保存性能の原因と限定候補

取得済みv31の保存CTA中央値1297.70ms、API待ち中央値1249.80ms、結果DOM中央値1252.25ms、busy DOM中央値3.10ms。主成分はAPI待ち。独立した指標の中央値の差を厳密な描画所要時間にはしない。既存測定にサーバー各SQLのspanはなく、特定SQLが何ms遅いとまでは確定できない。

コードでは認証→準備read→session state取得→commit→response用rooms/social/pending/territoryという直列段階がある。最後のresponse群は並列だがcommit完了後に別HTTP往復を必要とする。この確実に存在する依存HTTP段階のみを対象とする。

|候補|内容|
|---|---|
|対象action|`save_deck`のみ。ガチャ・背景選択・戦闘・受取・交換は従来経路|
|新RPC|`game04_commit_deck_with_context`。既存commit_growth_stateを呼び、同一transaction内で保存後のrooms/owner・social30件・pending1件・territoryを返す|
|制限|service_roleのみ、SECURITY INVOKER、search_path固定。receipt action=save_deck、資源差分0、battle/raidなしを必須化|
|API|同じroom投影を共用。既存任務reconcile/CASは維持。contextはreceiptへ保存せず一時レスポンスに限定。再送は従来fresh-read経路|
|有効化|`GAME04_SAVE_CONTEXT_RPC=true`の場合だけ使用。未設定/falseは従来動作。今回設定していない|
|通信|実handler＋制御HTTPの通常保存で10→6呼出し、commit後の依存HTTP段階1つを削減|
|保存順序|owner先頭武将・territoryは必ずcommit後。事前投影・クライアント楽観状態は使わない|

根拠ファイル: `supabase/functions/game04-redesign-api/source.ts`、対応`index.ts`、`supabase/manual/game04_g2_commit_deck_with_context.sql`。G2通常bundleはG3全体を含まないため**そのまま共有APIへ配信禁止**。G3受入後、その最新sourceへ本差分を統合して再生成する。

検証:

- Edge対象TypeScript型検査PASS。esbuild 0.25.0 / bundle / neutral / ESM / ES2022 / 非minifyで再生成成功。生成index差分もAPI部に限定。
- `node scripts/verify_g2_save_context.cjs` PASS。実source handler、通常応答全体同値、保存後owner画像、既定OFF、認証/ID/profile/prior/acquisition失敗、再送、CAS、context失敗、context欠落fallback、任務reconcile、save_deck以外の経路を確認。HTTP mockでありSQL実行・実性能ではない。
- SQLは既存関数署名・VOLATILE/INVOKER属性をlive read-only照合し、静的レビュー済み。**新SQL自体のPostgres適用/rollback試験は未実施**。共有DBを更新しない制約を保持。
- 残るリスク: context処理までtransaction内になるためユーザーロック保持時間が延びる。context SQL失敗時はcommitもrollbackされる。従来の「commit成功後にresponse失敗」と差があるが、同一request再試行で二重保存しないことを統合DB試験で確認する。直列SQL分の時間とロック競合次第では短縮しないため、実測まで採用合格にしない。
- 既存保存80回を再実行していない。v31≤1.5秒18/20、必要19/20未達は維持。

## G3受領状況・配信順

- 確認時のPR #33 headは`2d280db6104bbdcf1e6a06e9c6bab752312df24a`。G3本文はv31 source待ちの旧記載のまま。
- [受領/保持差分/配信枠の一括照会](https://github.com/kiyoshikitamura/game04/pull/33#issuecomment-5828992433)を送付。今回確認時点で担当側の受領返信なし。**コメント送付済みを受領確認済みと扱わない**。
- `g3-v31-rooms.patch`はG3最新remote sourceからroomsForだけを置換した1差分。`g3-v31-rooms-source.ts.txt`はその参照全文。minified bundleから推定していない。G3並列read/status/再送payload等の実handler mock PASS。ガチャ実抽選/DB受入ではない。
- G3テスト用の`SPECIAL_GACHA_TICKET_IDS` doubleを既存parallel-read試験へ補い、最新G3 sourceに対応。G3本体/branchへ直接書いていない。
- G2の新性能候補をこのG3 patchに混ぜていない。G3はv31保持＋自身の修正を先に受入し、その後G2性能候補を扱う。

配信順は固定: 旧処理停止/更新排他の成立 → G3受領返信・開始告知 → 稼働version/hashと最新SHA再確認 → G3 source統合/保存 → 必要なG3 DB差分のみ → G3 API/専用Preview → 実接続受入/証拠保存 → G3終了連絡 → G2の次統合候補・不足測定。G3受入中、G2はAPI/DB/stateを書かない。

旧実行確認はここで打ち切る: v31配信完了履歴/追加API改善停止記録あり、今回も稼働v31、read-only pg_stat_activity確認時は非idle client query0件。旧セッション/子実行の終了を確証する制御手段はこのスレッドにない。0件は将来の再開を排除しない。無期限pollingしない。

## 障害復帰・SSR・KPI

|項目|今回確認|次候補に残すもの|
|---|---|---|
|R05|既存news/activityのconfirmed一覧保持、12秒Abort、後着破棄とR7空一覧DOM証拠を区別。候補API変更はこれらreadへ非適用|非空一覧を表示した実DOMで障害→保持→再試行|
|R06|画像失敗中は再生を停止、終了は同一result一回のonCompleteのみ、再戦闘POSTを呼ばない構造を確認。fixture/API/DBの既存証拠を維持|保存済み実戦結果・共闘ページへの復帰とreceipt非重複を同一操作で照合|
|SSR永続化|read-only集計でSSR背景選択2件、解放集合との一致2件、解放集合あり3player。新規保存/ログインなし|同UIDの実logout/login、G3自然SSR/交換→解放→選択→再login|
|SSR読取境界|`verify_g2_session_read_boundary.cjs`で実refresh callbackの6場面PASS。新セッション復元、logout後/別UID後の古い応答破棄、古いversion拒否、障害時保持、同時read重複抑制|これはセッションを模したローカル検証。実Auth/ブラウザ受入へ置換しない|
|KPI DB|JST 9/25（UTC 9/24 15:00〜9/25 15:00）の3RPC読取成功。gameplay19行、supply5行、detail1行。行数はイベント/人数/売上ではない|同期間の管理UI/HTTP200・401と数量照合、旧QA分類の根拠|
|KPI設定|Vercel get_projectは既知project/teamで404、対象URL fetchも接続権限不足または対象未発見。現在envを取得できない|「KPI設定なし/503」と断定しない。対象team/projectへアクセスできる接続か、担当のreadbackを必要とする|

旧分類根拠のない一括変更なし。SSR/restore KPI観測を本物のログイン受入とはしない。G3の測定と干渉しうる実操作はG3終了後へ移す。

## FIX済みPR #34との統合差分

ユーザー受入実装`320621a71a0bdaa11d6c85e0c52bbc24642131db`、受入記録込みhead`ec35f6f205045f72748f14ad7932892867658daf`。承認済み仕様/見た目を再確認へ戻さない。

|分類|保持する成果・接続方針|
|---|---|
|TitleView/HomeEffect|桜・火の粉・雪・木の葉。explicit effectId追加、reduced motion/非表示停止。G2既存法務/認証/復帰の後続を保持して該当hunkのみ統合|
|BattleView|`requirePlaybackCompletion=false`を既定として専用模擬戦のみtrue。G2の画像復帰・`data-playback-frame`・開始/画像計測を保持。通常戦闘から失敗終了を消さない|
|World/獲得/模擬戦|導入3画面、固定3武将/3スキル、おまかせ、伊達固定イベント、名前入力、一括decode/フェードをそのまま保持。確定ダメージ/演出を一般戦闘engineへ移さない|
|通常任務|初敗北「任務へ」は共通MissionContent中央Dialog。専用任務ページ/育成/出陣追加ボタンを復活させない。正式接続後は本体受取APIへ接続|
|保存・付与|preview専用storageKey/`game04_tutorial_preview_states`のクライアントsnapshotは正式権威にしない。固定付与/進行は既存認証・server action・台帳・requestIdへ接続。既存所持品を初期化しない|
|ログイン報酬|初回Home抑制、2回目以降/JST規則を維持。G2のget_session_stateによる付与と本体表示の双方を照合し、preview内付与を二重実行しない|

今回PR34をG2へ丸ごとmergeしていない。仕様再設計・文言変更なし。本体初敗北からの実導線、正式初期付与/同UID保存/ログイン報酬の統合受入が残る。Gitのmergeable=falseをユーザー受入否定に使わない。

## P02〜P04/P06 最新外部設定

- P06最新`3e03ca083d1176911fd42a220cc7a0c09393e15f`の`DNS_TLS_ACCEPTANCE_1600.md`を採用。apex A・www CNAME・Vercel Valid・TLS・3ホスト匿名302保護は確認済み。15:38のInvalid/DNS未設定を現況の停止理由にしない。
- ユーザーのSupabase設定完了/URL修正済み/anonymous sign-inに関する報告を保持。設定済み操作の再実施を要求しない。ただし本番soiksの報告を開発lrgyの設定完了へ読み替えない。
- PR #31最新`3ca2e73c`以後の設定readbackはGitで未確認。[P02〜P04照会](https://github.com/kiyoshikitamura/game04/pull/31#issuecomment-5828992593)、[P06照会](https://github.com/kiyoshikitamura/game04/pull/32#issuecomment-5828992781)へ環境別・項目別の最新結果/保存SHAを依頼。今回確認時点で返信なし。
- Google provider/redirect・SMTP・Stripe test/webhook/return origin・VIP・KPIについて「旧時点の未設定」「ユーザー設定済報告」「担当readback未確認」を区別し、未確認を未設定と断定しない。
- 本番receiverは保護を維持。今回のG2継続で公開・本番Auth・Stripe live設定は変更しない。

## 再開方法・本当に必要なユーザー操作

**経路A（既存devを継続）**: 旧G2スレッドが操作可能なら実行停止を行い、親へ子処理も終了するよう指示して終了記録を得る。停止結果を新G2/G3へ共有し、G3スレッドに「PR30最新R8のv31保持patchを受領・統合し、G3のみ配信/受入。開始と終了をPR33へ記録」と送る。PRコメントは待機中の別チャットを自動再開する保証がないため、担当の受領返信がなければG3スレッドの再開操作が必要。

旧G2がResume stream unavailableのままで停止が反映されない場合、停止指示の連打・画面を閉じただけを停止証明にはしない。公式の子エージェント案内もWeb側サイドバーで個別停止は提供しないとしている。存在未確認の一括停止ボタンを案内しない（https://learn.chatgpt.com/docs/agent-configuration/subagents）。

**経路B（停止確認できない場合の隔離再開）**: 新しいGAME04専用Supabase開発ブランチ/プロジェクトへG3受入環境を分離する。旧lrgyは保持し、旧実行が触れない新ref・専用API・専用Previewへ向ける。API slugだけ変えてDBを共有する方法では更新排除にならない。

作業手順は、新設の組織/費用確認と作成承認 → 現在のschema/manual適用済定義/正式masterを読み取りsnapshot化 → 新refへ復元（過去migration一括再適用なし、既存ユーザー資産を無断コピーせず専用QAのみ）→ sourceのEXPECTED_PROJECTを新refに限定 → Previewの接続設定/Auth callbackを当該branchだけ変更 → v31保持G3候補を配信/受入 → 結果保存。新設は追加費用があり得るため今回未作成。ユーザーに必要なのは組織/費用確認後の新設承認で、技術設定は担当側で行う。これを選べば旧スレッド復旧を待つ必要がない。新環境の結果を旧lrgyでの性能測定と同一条件比較にしない。

**Vercel接続**: 担当がreadbackできればユーザー操作不要。できない場合のみ、ChatGPTのVercel接続を対象team `kiyoshi-kitamura` / project `game04`へアクセス可能なアカウントで再認可する。再認可後はこちらでenvの有無・対象branch・最新deploymentを読み取る。秘密値をチャットへ貼らない。KPI値の新規設定が必要かはその確認後に判断する。

## 統合候補で実施する不足項目

G3受入後の同一SHA/API版/専用Previewで、(1) SQL候補rollback・CAS/同request再送・context失敗とロック競合、(2) 保存20回の基準達成と悪化有無、(3) 実戦闘開始20回（未回収分の代替）、(4) cold独立5回・受取/交換各20回・実機/回線別、(5) R05非空DOM/R06保存済実結果復帰とreceipt、(6) SSR実再loginとG3取得経路、(7) 管理KPI HTTP/UI、(8) FIXチュートリアルの正式保存/初敗北/報酬接続、(9) 設定readback後のP02/P03実受入。完了済み全画面監査・旧測定の再実行はしない。
