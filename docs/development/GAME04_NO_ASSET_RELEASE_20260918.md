# GAME04 素材不要タスク先行実装

基準はGAME04 `259f26a`（GAME03 Production `bc2f256eddfaa0b53ba136dd7e84f1da21286ed2` 同期済み）。配信先は既存 `codex/game04-upstream-20260918` のPreview。Production公開は行わない。

## Preview反映対象

- #15 認証文言、#30 全画面フォント、#39 Activity、#53 7章21段階、#54 敵表示、#56 Story、#57 Story配置、#58 会話UI、#98 同盟名称、#111 任務文言。
- #23 既存画像258pathの配信整理、#69 排出Poolと表示Master接続、#72 実Pool由来提供割合。
- #132 GAME04 campaign識別、#137 X/Metaから開始までの既存計測同期、#147 本番投入手順、#189 不具合対応導線準備。

Storyは42場面126発言。各段階前後の場面を戦闘設定から独立して管理し、既存武将画像を使用する。場面既読は利用者別ローカル保存で、ブラウザを変えると再表示される。

## 部分反映と残課題

- #18/#19/#31/#76: 名称・表示・接続は実装。戦国画像はItem18/Skill45のみ格納済み。汎用Skill5/Equipment160と専用Skill20/Equipment10の計195画像、カード専用枠・商品画像は後工程。
- #87/#109: 固有文言の変更。背景・専用演出は素材待ち。
- #7/#144/#146: 環境変数差分表と本番構築手順を準備。本番Project/DB/Domain/秘密値は未設定・未確定または未確認。
- #24: 779素材を静的参照138、動的候補370、戦国置換済82、静的参照なし189に分類。DB・動的参照の可能性があるため削除0。
- #151〜159: 8種類のLegal/問い合わせ草案ページを掲載する実装。運営主体・窓口・正式Domain・権利・年齢/資金決済の判断等は未確定のため着手中。

C未FIX #95/#96/#103/#104、および関連導線・Release日程は変更しない。Tutorial本体・総合QA・Production公開は後工程。

## DB変更

GAME04専用dev `lrgyllgzcdcphlbmkknc` だけを対象に、承認済名称258件からcanonical Skill70/Equipment170/Item18のdisplay_nameを更新。適用SQLは `supabase/baselines/game04-theme-20260918/master-display-names.sql`。

更新前後でdisplay_nameを除いた全列のfingerprintが一致。`gacha_items_master` 全行fingerprintも一致。確率・天井・排出ID・ステータス・価格・購入制限・報酬・既存ユーザーは変更しない。GAME03への書込みはない。

## 最低限の確認

- TypeScript型チェック: PASS
- Preview設定のProduction build: PASS
- GAME04計測・接続分離確認: PASS
- 既存商店価格・数量・購入制限確認: PASS
- 正式名称網羅・画像258path実在・7章21段階・42場面の話者名と画像照合: PASS
- GAME04 DBの名称以外・ガチャPool不変: PASS

網羅テストと最終実機確認はユーザー指示により後工程。配信SHA・Ready・Preview URLはPRと進捗管理正本の参照欄に記録する。
