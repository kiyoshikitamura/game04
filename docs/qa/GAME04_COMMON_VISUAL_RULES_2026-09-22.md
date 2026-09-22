# GAME04 共通ビジュアルルール確認

作業基準: `7b26ee980498a4f9a1e4e5f5f8ce09e559fd1596` / `codex/game04-local-assets-20260922`。開始時の作業差分なし。

## 適用
- `src/app/game04-visual-tokens.css`: 指定配色、書体、文字サイズ、タップ領域、選択枠、画像上の下地、Footer / Dialogの余白。
- `public/fonts/game04/`: Noto Sans JP / Noto Serif JP 可変WOFF2とOFLライセンス。font-display: swap。
- `src/app/layout.tsx`, `src/app/sengoku-theme.css`: 共通トークン読込、旧一律明朝体指定を除去。
- `src/app/components/redesign/{redesign,growth,QuestView,RaidView}.css`: 小さい固定文字サイズ・本文色を共通トークンへ統合。
- `src/app/components/redesign/BattleView.{tsx,module.css}`: 5人横並びを維持。優先順と状態を明記した44×56pxのスキル操作を縦配置。詳細本文16px。
- `src/app/components/redesign/{RedesignShell,HomeView,NormalGachaView,MissionContent}.tsx`: Headerの顔表示、既存アイコン、主要CTA、任務本文の共通化。
- `src/app/qa/redesign/{RedesignFixture,QaOperations}.tsx`, `src/app/qa/shop-ui/ShopUiHarness.tsx`: オフラインの9画面切替。通常登用と既存Shopハーネス、共通任務本文を使用。

## 検証
- Typecheck / Next.js production build成功。
- 375 / 390 / 430px幅で9画面のQA遷移、横はみ出しなし、表示画像の欠落なし。
- 最終375px検査で通常文字の計算コントラスト4.5:1未満なし。画像上の文字には不透明下地を設定。無効CTAも暗い下地と破線で識別。
- Noto Sans JP / Noto Serif JPの読み込みをブラウザで確認。
- Battle詳細、通常登用確認・10件Result、ショップ購入前Dialogを確認。末尾スクロールと閉じる操作に到達可能。
- 無料登用の利用済み状態がQA往復後も維持。QAを閉じる操作でデータを初期化しない。
- Footer直前までスクロールした内容末尾がFooterに隠れないことを確認。safe-area余白はCSSに確保。
- Guild Lock、既存QAメニュー導線を維持。Battle / Master / Economyの処理変更なし。

## 個別画面での調整対象・検証境界
- Battle: 5列の名前・HP・状態・3スキルは情報密度が高く、縦スクロールを要する。優先順付きの縦スキル配置は共通ルール確認用で、最終配置承認は別途。
- 属性の横長素材は比率を維持。特にBattle内は5列幅のため一覧と同じ大きさを機械適用しない。細部の見え方は実機で個別調整。
- ガチャQAは既存通常登用を使用。特選登用のAPI接続や実抽選・決済はこのオフラインQAには追加しない。
- 任務は既存攻略記録と、未設定の達成報酬表示を使用。報酬Masterは新規作成しない。
- デスクトップブラウザのモバイル幅で検証。実機固有のsafe-areaやフォント描画はPreviewでユーザー確認。
- 本配信は共通ルールの確認用。9ページそれぞれの最終ビジュアル承認とは区別する。
