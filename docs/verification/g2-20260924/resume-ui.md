# G2 再開時 UI 追加是正

基準コード 7476566f945708a8e752f71d4d6b90c23f3b937a。記録2016f10を継承。ローカルresetなし。担当D旧記録から未確認公開導線を追加点検した。**本記録はコード点検・修正であり、配信後の独立再検証と実機受入は未完。**

|ID|対象 / 分類|原因と是正|検証 / 残件|
|---|---|---|---|
|RUI01|BOX 長名・大数量 / Q02 U05|報酬行と数量strongのnowrapが受取ボタン領域へはみ出す。報酬名・数量を省略せず折返し、CTAは縮小させない。一括受取欄も折返し可能にした。|CSS点検。360/375/390px・390×568実ブラウザ寸法確認は独立担当へ依頼。|
|RUI02|お知らせ取得・エラー・再試行 / Q01 U05|取得失敗が無表示、0件と誤認できた。更新status・失敗案内・再試行を追加。既存一覧は更新待ち/失敗で消さない。成功時だけ差替える。cleanup後のsetStateを防ぐ。|TypeScript PASS。実接続成功/失敗と再試行は独立担当へ。新しい時間閾値・勝手な再試行は追加していない。|
|RUI03|お知らせ一覧 長名・キーボード / Q02 U05|click専用divをbuttonにしてEnter/Space操作・focus表示を追加。見出し/日時折返し。|TypeScript PASS。本文は既存CanonicalDialog内部scroll、overflow-wrapを保持。|
|RUI04|問い合わせ/法務全8ページ / Q02 U05|legal.cssだけ銀色scrollbarが残存。承認済み共通金色thumb/暗色trackへ変更。閉じる固定CTA用末尾余白とsafe areaを保持。|CSS点検。設定→問い合わせ→閉じる復帰は独立担当へ。|
|RUI05|BOX/受取DialogのCASH残存 / Q03 U05|canonicalItemName(CASH)が旧通貨名を返す。親へ共通domain修正を依頼。|担当外なので本担当は変更していない。統合時の追跡対象。|

## 点検範囲と未完の区別

- BOX: 空、長い配布名・報酬名、大数量、個別/一括受取中、受取失敗をコード確認。useInventoryは既存server RPC→所有者の最新rows→確定受領数で表示する経路、pending lock、応答消失時mutationを再送せず再読込する処理を確認。今回保存ロジックは変更していない。実API受取の合格にはしない。
- 設定: 名前8文字、自己紹介200文字、16px入力、min-width:0・overflow-wrap、保存中disabled、末尾sticky CTAを既存実装で確認。今回変更なし。実機keyboard未確認。
- お知らせ: 一覧/更新/失敗/再試行/空/長文/閉じるを対象。ニュースRLS・公開時刻は既存クエリ契約を保持。公開ニュースの作成やDB変更なし。
- 問い合わせ: SupportContact→legal/contact、settings戻り指定→LegalPageの閉じる→本体復帰クエリの経路を確認。窓口メール/運営情報未設定はP04未完のまま。代わりのメールや外部サービスを作らず、送信確認済みとはしない。
- 不足/満杯: BOXの失敗時受領しない・再読込ロジックは確認したが、正式在庫上限と満杯状態の実API操作は未確認。無根拠に容量値や満杯fixtureを追加しない。

## 変更ファイル

- src/app/components/InboxPanel.tsx
- src/app/components/InboxPanel.css
- src/app/legal/legal.css

`npm run typecheck` exit 0。API/DB、P04本文、共有App/GameContextは無変更。配信SHAと独立ブラウザ結果は親が追記する。

## RUI06 設定→問い合わせ→閉じるの復帰不整合

独立担当が747の新規匿名QAで、設定から問い合わせへ遷移後30秒以内に閉じ、TAP TO STARTへ戻ることを確認。5分のマーカー期限切れではない。さらにタイトルから「チュートリアルを続ける」→G2本陣へ到達し、設定は閉じた状態。

原因はGameContextの復帰条件が旧`nextState.gameplay_authorized`（旧チュートリアル完了条件）を要求する一方、G2本体page.tsxは同UIDのauthenticatedProjectionReadyで入場する仕様との差異。`hasPendingLegalSettingsReturn(userId)`で同じ利用者のマーカーを確認できても、旧条件falseでmarkerを削除してタイトルへ戻していた。

修正依頼を親へ送付：すでにRPCのuser_id照合を済ませた位置なので、`nextState.has_profile && hasPendingLegalSettingsReturn(userId)`で設定表示を復帰し、実際の本体描画は従来どおりauthenticatedProjectionReadyで待機する。queryやstorageをゲーム権限とみなさずAPI認証は保持する。共有GameContext編集は親へ集約、担当UIからの無断編集なし。配信後同一QAの設定復帰を独立再確認する。

## RUI07 タイトルに旧ゲームの画像

0e12候補を独立担当が確認した `qa-resume/08-new-title-old-art.jpg`（390×568本体iframe）を実装担当も目視し、巨大TRIBE NEONロゴ、ネオン街、ストリート人物が描かれていることを確認。Footerは戦国姫艶武。旧画像残骸Q03として必須修正対象。G4の新しいチュートリアル制作とは区別する。

TitleView.cssは `/branding/title-key-visual.png` を参照。G1の同パスblobは `ba0adc4e90d86aeab71d8068a1334d4598523cdf`。開始中logo `/branding/tribe-neon-logo.png` は `8bf8a509d2980d0221eaf76ba66f4c9ce3c17779` で、バトル承認素材対応表は『既存GAME04ロゴ。ファイル名を変更していない』としている。名前だけを根拠に不適切と判定しない。

採用済みGAME04タイトル素材を親が照合中。本担当は承認不明の新画像・寄せ集め画面へ勝手に置換していない。ローカル画像ファイルは未復元、配信画像のshell取得は25秒timeout。画像の見た目自体は独立ブラウザ証拠で確認済み。

TAP無反応の疑いは、独立担当root別tabでTAP→はじめからが正常に進んだためアプリ不具合と断定しない。iframeでのDOM操作timeoutと認証API Failed to fetchを区別し、旧画像と同一原因扱いしない。

### RUI07 追加修正（親指示に基づく既存役割表への接続）

`config/game04-local-other-assets.json` は既存取込資産の役割を title/KV（source kv/kv.png）→ `/creative/branding/key-visual.png`、logo/KV → `/creative/branding/logo.png` と指定する。TitleView.css背景・TitleView開始中ロゴ・BOOT_CRITICAL_ASSETSの3ファイルを、この同一役割表のパスへ修正した。新規素材の制作・加工・採用は行わず、旧画像ファイルそのものも削除していない。G3/G4の導線・初期付与を変更していない。

ブラウザtab22で固定Preview上のcreative/branding/key-visual.pngへgotoはtimeoutしたが、続く現在画面のscreenshotは取得できた。画像上部の『戦国姫艶武』ロゴと和装女性を目視確認し、旧TRIBE NEON画像とは異なることを確認。下半分は読み込み中の灰色で、全画像・切抜き品質確認済みとはしない。logo画像タブはタイムアウト/待機のため追加取得を中止。**役割表整合の修正済み、実表示・切抜き再検証未完。**
