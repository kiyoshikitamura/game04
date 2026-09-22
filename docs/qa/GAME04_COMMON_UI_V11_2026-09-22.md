# GAME04 共通UI追加ルール v1.1 反映・検証記録

- 対象: `codex/game04-local-assets-20260922`
- 開始・直前fetch基準: `d15abb6817b28413cc8b196a8c0177676543bf12`。開始時作業差分なし。
- 指示本文の v1.1 条件を基準に実装。添付正本ファイルはこの作業環境では取得できていないため、添付独自の追記事項との照合は未実施。
- 先行する配色・Webフォント・Header/Footer・QAメニュー移動を維持。Master、Battle Rule、Balance、Economy、素材は変更しない。

## 適用内容

- `game04-visual-tokens.css`: CTA 48px / 16px太字・1行、操作群の最大2列と狭幅縦配置、タブ中央・等幅・折返し配置。既存キャラ5タブを維持。
- `ui/DialogSurface.tsx`: body portal、visualViewport中央配置、背面inert・スクロール停止、フォーカストラップ、背面タップでは閉じない。
- `ui/CanonicalDialog.tsx`, `redesign/Modal.tsx`, `ui/FullScreenPanel.tsx`, `ui/ConfirmDialog.tsx`: タイトル・操作固定、本文のみスクロール、詳細/確認/編集/結果/通知の閉じ方、未保存の破棄確認。
- `redesign/{HomeView,GrowthView,QuestView,RaidView,TerritoryView,NormalGachaView,BattleView,PreparationModal,RedesignCommerceOverlays}.tsx`, `SettingsPanel.tsx`, `SpecialGachaOffer.tsx`: 共通Dialog適用、選択時の即保存解消、キャンセルと明示実行、結果の×抑止、実行ロック、費用のCTA外表示。
- `lib/game04UiError.ts`, `redesign/GrowthControls.tsx`: 既知の不足理由の表示文言と、未知の内部エラーの非表示化。未知の原因を不足と断定しない。
- `redesign/EnergyRecoveryDialog.tsx`, `redesign/RedesignApp.tsx`, `context/hooks/useInventory.ts`: 回復薬所持数/消費数/回復量、未所持の閉じる表示、既存use_energy_drink RPC呼出し。回復後は出撃準備へ戻り、自動出撃しない。
- `ui/ViewedItem.tsx`, `context/hooks/useViewedEntries.ts`, `context/hooks/useNewsBadges.ts`, `InboxPanel.tsx`, `context/GameContext.tsx`, `redesign/RedesignShell.tsx`, `context/hooks/useChat.ts`: 実際に見えた対象単位の既読、アカウント/端末別保存、未受取と未読の分離、親メニュー/Footer集約、表示したDMだけ既存個別既読処理へ接続。
- `qa/redesign/{QaOperations,RedesignFixture}.tsx`, `qa/shop-ui/ShopUiHarness.tsx`: 9画面導線維持。回復薬あり/なしの行動力0、新着追加、オフライン未読確認を追加。

## 検証結果

- 型チェック: PASS。
- ローカルBuild: Preview用の既存Mock DB設定で検証。環境変数なしでは既存Supabase構成ガードで停止するため、`NEXT_PUBLIC_APP_ENV=preview`, `VERCEL_ENV=preview`, `NEXT_PUBLIC_USE_MOCK_DB=true`を使用。環境ファイルの変更・コミットなし。
- 320×568 / 430×568: 9画面をQAから巡回。検査対象CTAの改行・横はみ出し・欠落画像なし。QA選択後はQA画面が閉じる。
- 320×360: 出撃準備Dialogは画面内中央、本文スクロール、末尾キャンセル/出撃CTAへ到達。
- 375×568: プレゼントの可視先頭4件だけ既読、画面外8件は未読維持。12件すべての未受取状態と受取CTAは保持。親/Footerのバッジ維持。
- お知らせ: 詳細の実表示で解除、再読み込みでも既読維持、QA新着追加で再付与。
- 回復薬: 1個使用の連続クリックで1回だけ回復、出撃準備へ戻る、自動出撃なし。未所持は使用CTAなし/閉じるのみ。
- 編集: スキル割当・ホーム背景変更は保存前に反映されず、キャンセル時に破棄確認。育成入力にも破棄確認。
- 登用: 確認は×/キャンセル/登用する、結果は×なし/閉じる。Dialogは1枚。
- 背面タップでは閉じず、背面スクロール停止。閉じた後はinert解除。

## 実接続とQAの区別・個別確認事項

- 回復薬、プロフィール保存、DM既読は通常画面の既存APIへコード接続しているが、認証済み実アカウントによる消費/保存/DM受信の往復検証は未実施。QAでの成功を実接続検証済みとは扱わない。
- QAの回復/新着/受取/登用はローカル仮動作。新着・回復条件を追加したQAデータ自体は再読み込みでリセットするが、既読記録はlocalStorageに保持する。
- プレゼントの閲覧記録は端末/アカウント単位。別端末との同期は今回追加していない。
- 全体チャットは既存APIがチャンネル単位既読のため、新UIでページ表示だけによる一括既読を停止。メッセージ単位のサーバー既読APIは追加していない。
- 育成の複数操作を持つ詳細では、各操作CTAを本文内に保持している。本文スクロールで到達可能だが、操作ごとの固定Footerへの統合は個別調整事項。機能・情報は削除していない。
- Battle密集部（5人行動順/スキル3枠）は先行配置を保持。各ページの最終ビジュアル承認や実機固有のキーボード/safe-area検証とは別扱い。

配信先は同ブランチの専用Vercel Preview。Production公開・本流取込み・GAME03変更なし。
