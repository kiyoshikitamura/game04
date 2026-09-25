# GAME04 ユーザー・コミュニティ最終確認候補

2026-09-25 / G5未合格 / 本体統合後の実接続受入は未完。

## 基準と分担

- G2 PR30: 29b1515f677bb475cb22b956c9802b88f51c2411 から専用 branch `work/game04-community-20260925`。
- G3 PR33: 着手時2d280db6、追加照合時b6b135d。formalGachaReceiptの保存形式を読み取り照合。
- P02〜P04 PR31: 3ca2e73。P03同一UID認証、P02購入認証API・VIP期限を維持。
- G4 PR34: FIX維持。演出・文言・チュートリアル保存は変更しない。
- GAME03: mainのAuthenticationReminderModalと本番get_public_profiles / get_recent_social_activity_feedを読み取りのみ確認。
- 共有DB/API/state書込み0件、main/Production変更0件。本担当はG3の配信枠を使用しない。

## 現実装・採用ルール・差分・対応

| 対象 | 採用ルールと現実装 | 今回の対応 | 確認状態 |
|---|---|---|---|
| 活動 | 本陣最新3件、展開一覧。継承feedは直近24時間、公開中news、QA/test除外。現dev取得RPCはSSRキャラのみ、旧戦力1位がUIに残り得た。G3正式召喚は旧feedに記録せず確定receipt保存 | ランキング/PvP/同盟をallowlistで除外。取得物名・最新作者名を表示。追加読取RPCでG3 normal/special確定receiptからSSR3カテゴリを投影。ID=ユーザー+requestId+結果順序で再読込/再送は同じ行。既存24h内receiptにも適用、書換え/backfillなし | 実装・DOM fixture確認済。SQL本文のEXPLAIN通過、RPC自体は未適用 |
| 全体/DM | 初期公開は活動・全体・DM。HOME_UI_AUTHORITY §7が初期公開を限定。BBS/募集/攻略/同盟チャットは復活させない。閲覧・投稿は匿名ログインを含むAuth UIDと既存プレイヤーが前提。全体140文字/10秒、DM140文字（追加cooldownなし） | UI500文字を140へ整合、hookもコードポイント検証。RPC応答とRealtime同一IDの二重表示を解消。全体cooldownがDM送信を妨げるUIを修正 | dev RPC定義を確認、境界/競合fixture PASS。実投稿は未実施 |
| 名前/自己紹介 | ゲストは匿名Auth UIDで開始。認証前後とも同一users行をgame04_update_own_profileで保存。名前trim後1〜8文字・重複不可、自己紹介0〜200文字。各項目別にJST1日1回、同値保存は変更回数を消費しない | 既存G2 RPC/保存revisionを維持。活動・全体・DM・公開プロフィール・共闘に現在名を表示。名前タップで自己紹介を読む小ダイアログを接続、DM入口維持 | dev RPC/日次trigger確認済、他者bio/最新名DOM PASS。実保存/再ログインは統合後 |
| 日次未認証注意 | GAME04既存文言「ゲームデータを保護」。GAME03の300個特典文は採用しない。既存キーはuser別localStorage、JST日付。従来は旧ランキング/任務gateに依存し本体に描画されなかった | 本体state取得後、本陣・非戦闘・ログイン表示/他dialog終了後に表示。描画時記録、同日reload抑制、認証後停止。旧GameContextによる非描画の先行消費を除去。認証先はP03 /auth/game04 | 日次/旧記録/再読込/認証切替fixture PASS。G4統合後の初回/2回目本陣順序は要受入 |
| 認証バッジ | 現ヘッダーはis_anonymous=falseだけ。他者公開RPCは認証情報なし | 追加public projectionでP03と同条件（非匿名、identity単一、登録方式一致、emailは確認+password）。本人/活動/全体/DM/公開プロフィール/共闘開催者・参加者へ接続。トークン・ユーザー切替時旧投影を隠し、focus/表示切替で再取得 | false/期限/遅延応答fixture PASS。RPC未適用時は名前fallbackのみ、青チェックを推測しない |
| VIP | 正式game04_vip_entitlements.expires_at → state.vipExpiresAt。480円/30日商材等はP所有 | 本人はstate、他者は同テーブルの期限を参照。isVipActive共通関数で厳密に期限より現在時刻が前の場合のみVIP。表示中も期限切れで消す | 期限一致/不正値/有効fixture PASS。実購入・失効再読込はP/G2受入 |
| 課金認証必須 | ShopTab未認証gate→/auth/game04。checkout APIはgetUser→非匿名→users/state同UID→identity単一→登録方式一致→email確認を注文作成前に要求 | 認証/Stripe本体は変更せず既存契約を保持。Pのbinding readbackと購入APIは別に確認される。クライアントの青チェックを購入許可に使用しない | ソース追跡、既存決済fixture8群PASS。実認証復帰/資産維持/StripeはP/G2未受入 |

## 保存・配信

コード・SQL候補・7件の実コンポーネント/境界fixture、通信しない `/qa/community` を本branchへ保存。
追加SQLは `supabase/candidates/game04_community_public_profiles.sql` と `game04_community_activity.sql`。共有環境には適用していない。
専用Previewの配信・ブラウザ結果は `PREVIEW.md` へ追記する。

## 限定検証

- TypeScript noEmit PASS。
- 新規community部品/QA/domainのESLint PASS。
- `tests/community/run.mjs`: 7/7 PASS。実HomeViewを使ったSSR名・現作者名・bio・認証バッジ・旧rank非表示を含む。Supabase/GameContextのみfixture。DB受入を代替しない。
- P既存 `tests/p02-p04/independent-billing.mjs`: 8群PASS。実Stripe通信なし。
- dev実関数の定義・日次trigger・P/G3保存契約を読み取り照合。追加SQL内部SELECTをdev上でEXPLAINのみ実施、参照/型の成立確認。関数作成・実行権限/実ユーザーでの受入は未実施。
- 日次抑制は継承どおり端末localStorage。端末変更・保存領域削除をまたぐ全端末1日1回保証は追加していない。
- チャットAPIにrequestIdはなく、通信結果不明後の手動再投稿のexactly-once保証は既存どおり無い。今回解消したのは同一確定IDのRPC/Realtime二重描画。

## 本体統合後に残る受入

1. G3終了後にG2/Pが追加SQL2件をレビュー・適用。Edge bundleや既存RPCを丸ごと置換しない。
2. 匿名/認証済の名前・bio保存、日次拒否、再読込/再ログイン、第三者プロフィール反映。
3. P認証前後でUID・所持武将/装備/券・財布・進行が同一、shopへ復帰し購入開始APIがゲストを拒否すること。
4. P03 linked投影、本人/第三者バッジ、VIP有効/期限切れ/再ログイン。P03・billingの最終契約差分があれば表示SQLも同時照合。
5. G3実SSR獲得→確定receipt→活動の具体名、失敗/再送/再読込で二重行なし。SQL候補適用前の旧RPCfallbackでは正式G3 receiptを表示できない。
6. G4 FIXを保持して初回/2回目本陣・ログイン報酬・日次注意が重ならないこと。初回本陣の注意を除外する新仕様は設けていない。
7. サウンド等を含む同一最終候補で受入。単体Preview/fixtureをG5合格としない。

## メイン判断が必要な事項

- SSR選択交換の活動公開：GAME03のランダム獲得継承だけでは採否を確定できない。候補は `normal_gacha` / `special_gacha` のみ公開し、`special_gacha_exchange` は除外。推奨は現候補どおり交換を除外（活動を抽選の獲得報告に限定）。採用する場合は読取SQLの操作allowlistに1種追加するだけで、抽選・資産保存は変更しない。

## G2/P統合上の注意

- cherry-pick対象は本PR差分のみ。G2/G3のsource/index・保存性能既定OFF候補、P認証/Stripe、G4実装に変更なし。
- 衝突注意: HomeView.tsx / RedesignShell.tsx / GameContext.tsx / useChat.ts / RaidView.tsx / RaidApprovedVisual.tsx。GameContextは旧日次注意effectの除去のみで、他の同期・認証・音処理を置換しない。
- 認証routeやP callbackは既存経路。認証報酬・新しい毎日文言は追加しない。
- 追加公開RPCはUID/名前/bio/お気に入り/認証boolean/VIP期限のみ。メール・identity ID・password等は返さず、呼出しにはAuth UIDを要求。匿名Authユーザーの閲覧/投稿を禁止しない。
- G3活動はreceiptの読取投影。G3が別の活動producerを実装する場合は二重ソースにならないよう片方へ統一する。

## 再現コマンド

```
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js src/app/components/redesign/Community*.tsx src/domain/redesign/community.ts src/app/qa/community/*.tsx
COMMUNITY_BUILD_RUNTIME_DIR=/path/to/test-runtime NODE_PATH=/path/to/test-runtime/node_modules node tests/community/run.mjs
node --experimental-strip-types tests/p02-p04/independent-billing.mjs
```

テスト用runtimeにはesbuild 0.25.12、jsdom 26.1.0、React/ReactDOM、@testing-library/reactを使用。アプリ依存・lockfileは変更なし。JSDOM由来の残存handleで終了が滞らないようNodeの `--test-force-exit` を指定、7件の終了・集計を確認している。
