# GAME04 追加29項目（2026-09-27）

PR #37 / work/game04-common-preview-20260925。基準811b92b（後続の有償期限成果を含む）。main・Production・GAME03・バランス係数は変更しない。配信SHAはDEPLOYMENT.mdへ記録。

ユーザー承認：初陣パックは **1,500円相当→100円**。BOX受取期限は **各配布から90日**。前者の内訳は武将券1×300＋戦技券3×300＋武具券1×200＋100輝石。活力丸2個は維持し、この換算に足さない。

## 受付番号と結果

|受付|DBG|結果|
|---|---|---|
|01|076 新規|直接付与を「所持品に入りました。」へ。共通receiptはアイテムごとのINVENTORY/PRESENT混在も表示。BOX受取と任務受取の成功通知に接続。失敗経路は成功表示を出さない既存処理を保持。|
|02|002/018|ActionButtonの主15px・補助14px、padding7×12/6×8、最小タップ44pxを共通化。|
|03|077 新規|RarityBadgeをN/R/SR/SSRテキストへ。育成・出撃・戦闘肖像・召喚・旧共通武将部品・QA利用先も接続、旧画像preloadを除去。属性バッジは保持。|
|04|078 新規|仕様どおり。SP固定上限400、開始0、現在値は戦闘フレーム、編成合算補正なし。数値変更なし。|
|05|009|BattleView下部の旧スキル名行を除去。新しいスキル表示とカットイン・SEは保持。|
|06|054/055|パッシブ・装着戦技の名称16px＞説明14px。装着戦技を48px画像の行へ。|
|07|049|候補が画面外の間だけ下矢印。到達・編成解除で消灯。pointer-events:none、固定フッター上、reduced motion対応。|
|08|079 新規|save_deckの無意味な比較行を除去。成功時「更新しました。」。|
|09|071|所持品の初期分類を「すべて」へ。|
|10|055|スキル・装備に共通48px画像/1列行。検索・絞込・並べ替えを保持。|
|11|063|通常登用の重複所持銭行を除去。消費1,000/10,000銭を保持。|
|12|063/066|特選の重複所持行を除去、券CTA/確認もcanonicalItemName。必要券数と可否を保持。|
|13|057|侵攻令の「入手方法」CTAを除去。敵・報酬・条件不変。|
|14|067|履歴・有効期限・更新は補助compact CTAへ。|
|15|067|税込注記は右寄せ12px。|
|16|069|武将固有魂→正式汎用魂アイコンと数量を表示。2:1、10個以上・偶数条件は不変。|
|17|067|VIPを先頭、倍速/スキップ・720時間・無償100×30回・24時間間隔・自動更新なしを簡潔に表示。|
|18|068|最新承認正本は購入ボーナスなし。0個表記を除去。API側catalogも各価格＝有償個数で一致。Preview決済無効のため実購入は未検証。|
|19|072|本陣左ボタン64px幅/52px高、未解放は画像上へ重ねる。|
|20|072|本陣ローテーションバナーとtimerを除去。下部交流digest・他ページ訴求を保持。|
|21|080 新規|実API獲得前後の候補・結果を記録。LB0のSP比較を実所持LBのSPへ限定修正。順位/共有/レア優先等の戦略変更なし。|
|22|081 新規|突破後通算2回目以降、JST1日1回、無料10連未使用。DBの実表示記録と予約で端末間連打を抑止。他ダイアログ終了後に再評価。|
|23|082 新規|無償300輝石のBOX配布・1ユーザー1campaign・期限90日。既存backfill、新規profile trigger、Home補完。正式開始未設定・配布無効で保存。|
|24|082|[NEWS_DRAFT.md](NEWS_DRAFT.md)は未承認・未公開。|
|25|065|GLOBAL/DM未読と入口を接続。取得成功した投稿位置まで既読へ。後着/別タブは消さず、通信失敗時は未読保持。|
|26|065|本陣左列の商店と同盟の間に交流。正式chatアイコンと未読dot。下部digestを保持。|
|27|083 新規|既存実装が300/300/200・10連3000/3000/2000で一致。実API全6ケース実消費・再送二重消費なしを確認。|
|28|084 新規|初陣パック10000銭→100輝石、他内容・100円・購入1回を保持。表示/サーバーcatalog/既存DB商品更新migration。Previewの商品0件・grant RPC未導入につき実決済→BOX付与は決済担当待ち。|
|29|084|正式券3種を参照した2:1訴求画像を作成。area1後・未購入・初回だけ・無料10連より優先。商店の当該商品へ直接スクロール。|

## 調査根拠

- SP：GAME04_BALANCE_AUTHORITY_V2_2026-09-20.mdとbattleBalanceV2。上限400/開始0を維持。キャラSPの合算は採用しない正本に一致。
- 商品：docs/product/master_sources_20260921/shop.mdの「購入ボーナスなし」が最新。旧9/12案の無償個数へ戻さない。src/server/billing/catalog.tsと現行UIの金額・個数が一致。隔離Previewはbilling_products=0、Stripe/webhook無効、billing grant/reserve RPC未導入。決済構築を無断で追加しない。
- おまかせ：編成Lv→覚醒、装備Lv→LB（適合部位・別個体）、スキルLB→SP（全武将で共有可・同武将内は重複不可）、完全同点は所持配列順。新規取得を含める。SSR常時優先はない。各武将の役割/属性/ダメージ効率/攻撃・回復条件/BURST適性を評価する仕組みはない。LB2の「挑発」は基礎SP40だが実SP39、旧「薬師の手当」は40で、旧比較が同点になる参照不備のみ修正。[auto-selection.json](auto-selection.json)に実所持前後の候補と採用IDを保存。R LB5＞SSR LB0は現順位どおり。
- 戦略見直し案（未実装）：攻撃・回復の役割別候補枠、実ダメージ/SP効率、BURST対象攻撃の有無を評価軸として別途定義。現在の倍率・SP・条件・レア順位は変更しない。

## 検証

- 実DB transaction-checks.sql：突破前/初回/2回目/再送/端末予約/実表示/当日再訪/無料利用済/日次状態/初陣優先/重ねない。キャンペーン無効/開始前/終了時刻/重複/90日期限/既存claim_presentで+300/再受取拒否。全変更rollback。
- 実DB chat-checks.sql：専用UI検証A/Bで全体2件・自己投稿除外・DM別既読・後着保持・既読単調性・再取得。rollbackにより通常ユーザーへ投稿を公開しない。
- gacha-live.json：専用追加29QAで全6価格の実消費。総消費8800輝石、再送で追加消費なし。正式確率/無料JST境界の既存domain検査もPASS。
- BURST DBG035 domain検査：SP0/不足、装備順・条件/対象再評価、Wave/全滅/死亡/行動不能、対象外の抽選なし・ゲージ保持、再充填、旧保存5戦とtutorial互換PASS。
- 375/390×600：本陣・交流・召喚・商店・所持品・スキル/装備・矢印・訴求2種・直接/BOX/混在通知。画像をoutputs/additional29とGit内screenshotsへ保存。ブラウザ縮小域はCSS viewport600pxで代替。実Safariのバー伸縮は実機確認待ち。
- 実表示とDB境界試験は分離。新規ユーザーtrigger→300輝石BOX/90日期限/既存backfill再送も実DB rollbackでPASS。同じ配布SQLのQA campaign限定版で2接続競合→BOX1件/300個を確認し、試験関数を削除。正式配布は実行しない。実決済は未実施。

## リリース設定の引継ぎ（この作業では実行しない）

1. 正式release日時が確定後、専用GAME04対象を照合してgame04_release_campaignsのstarts_atを設定。ends_atは2026-12-31T15:00:00Z（2027-01-01 00:00JST未満）、claim_days=90、claim_policy_approved=true、amount=300を維持。
2. リリース担当がenabled=trueへ切替。既存usersをID順の小さいバッチでservice_role専用game04_grant_release_campaign(user_id)へ渡す。認証uid由来の新規triggerと重複しても同じgiftを返す。campaign/user主キーとusers行ロックで重複抑止。
3. game04_release_campaign_grants/presentsを件数と300個・FREEで照合。paid lotsを作らない。新規usersはtrigger、戻った既存ユーザーはensure RPCで補完。
4. 配布終了と受取期限を混同しない。12/31配布分も90日後まで既存claim_presentで受取可能。
5. お知らせの文案を承認してから運営の既存公開手順へ。今回newsへの書込みなし。

## 素材

starter-pack-1500.pngは1774×887、2:1。imagegenに正式special_ticket_character/skill/equipment.pngを参照として渡した。指示：初陣応援パック、特選召喚札3種、価格1,500円相当→100円を大きく、金/深紅/黒の和風、文字を切らない、人物・ロゴを追加しない。表示時だけ取得し初回ロードの待機素材に加えない。

## 残件

実機受入、初陣パック実決済→BOX付与（決済基盤待ち）、正式release開始日時/配布実行、お知らせ承認公開。新戦略のおまかせ評価は別提案。配信済みの項目は実機確認待ちとし、実機解決数は増やさない。

型検査・Next build結果はDEPLOYMENT.mdへ。変更TSXはReactスキルのhooks順序、非同期取消、安定キー、共通dialog focus/tap、不要な先読みを確認。

DB advisor確認：新規のSECURITY DEFINER RPCはauth.uid()で本人へ限定しsearch_path固定、補助配布関数はservice_role限定。campaignテーブルのRLSポリシーなしはクライアント直接アクセス禁止の意図どおり。匿名ログインの本人read許可もゲーム要件どおり。[RPC advisory](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)、[RLS advisory](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)。

配信後追加確認：実本陣の通算1/2/3回目とshown RPC永続化は成功、pageerror 0。全武将・全素材の合成QAでは画像期限超過が発生し、スキル/装備は再読み込みで表示、編成は復帰未確認。ローカルの同検証は成功しており、配信環境の大量素材読込を残件として区別する。

配信後最終確認：専用QAの実API獲得済みスキル・装備一覧は375/390pxとも再読み込み後に表示成功（deployed/real-lists.json、real-skills/equipment画像）。訴求2種・商店・所持品・通知も両幅成功（deployed/browser.json）、pageerror 0。本陣・交流・召喚も両幅確認。全素材合成の編成画面は画像待機の残件を維持。
