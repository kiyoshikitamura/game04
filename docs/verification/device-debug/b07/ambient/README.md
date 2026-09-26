# DBG-040 採用済み環境演出 — 実装・限定検証

2026-09-26、ユーザー「演出案を採用」によりB07の提案を正式採用。初期桜とクエスト進捗解放の10背景に接続した。**背景表示中の動き**であり、背景獲得・解放時の演出ではない。

基準：PR #37 / a509a9c。統合担当が並走中のDBG-042/043を保持して統合する。HomeEffect、ambient資産、対応表、共通UI正本§18.9はB07担当。タイトル/BURST表示、§18.10、共通台帳、push/配信は統合担当。戦闘/解放条件/保存/報酬/DB/APIは変更なし。

## 採用内容

|正式背景|実装した環境演出|粒子数/霞層数|390px証跡|
|---|---|---|---|
|夕桜の城下街|SSR桜の花びら輪郭を再利用した控えめな背面の花びら|8/0|[画像](sakura-390.png)|
|三河の地|遠景上部の日差しの揺らぎ・道の奥の霞|0/1|[画像](mikawa-390.png)|
|尾張の旗|遠景右寄りの光塵・淡い霞|6/1|[画像](owari-390.png)|
|美濃の城|谷側の低い薄霧|0/2|[画像](mino-390.png)|
|近江の湖|湖面の疎らな反射光・対岸の霞|8/1|[画像](omi-390.png)|
|甲斐の山|盆地の遠景を流れる霞|0/2|[画像](kai-390.png)|
|越後の雪|小さな雪片・遠景の雪霞|8/1|[画像](echigo-390.png)|
|京洛の影|灯籠付近の暖かい明滅・路地奥の霞|0/1|[画像](kyoto-390.png)|
|出雲の社|木漏れ日の明暗・少量の光塵|6/0|[画像](izumo-390.png)|
|薩摩の炎|暖色の遠景霞・灯付近の弱い明滅|0/1|[画像](satsuma-390.png)|
|関ヶ原|草地の奥に低い帯状の霧|0/2|[画像](sekigahara-390.png)|

[全11背景の一覧見本](overview-390.jpg)

375pxの同名画像も保存。SSR10背景は従来の人物ID別ファイルを保持し、チュートリアルの明示effectIdも従来どおり優先する。城門素材を他用途で使う場合も同じ控えめな桜を参照するが、初期選択候補へ戻さない。

## 共通実装

- `src/domain/presentation/homeAmbient.ts`：正式背景URL→環境演出sceneの表示専用対応。
- `HomeEffect.tsx`：従来の透明iframe・visibility/reduced-motionライフサイクルを再利用。sourceをkeyとし、切替では旧frameを破棄。
- `public/creative/effects/ambient.html / ambient.js`：11設定を1つの軽量canvas描画器で共用。背景画像・武将を複製しない。最大30fps、DPR最大1.5。粒子6〜8、霞最大2層、緩い周期。新規の音・動画・大型画像なし。
- 背景→環境演出(z1)→武将(z2)→操作。HomeView既存のoverflow:hiddenで背景領域へ限定。pointer-events:none、非フォーカス、読み上げ対象外。
- 隠れたタブ・reduced-motionでは親がiframeを破棄。子もvisibility/pagehideでrequestAnimationFrameを停止しcanvasを消去、離脱時にlistener/ResizeObserverを解放。再表示は1つだけ再開し、経過時間分を高速再生しない。BFCache復帰も再登録。
- 一時的な0サイズは1px以上へ制限。ResizeObserverとresizeで表示領域へ追随する。取得失敗時に操作を遮断する追加機能は入れていない。

## 検証

`node scripts/verify_game04_b07_ambient.cjs` / `verification.json`：
- 実HomeView、375/390×664、全11背景の計22ケース。全sceneが対応どおり選択され、透明canvasに非透明画素があり、時間経過で描画が変わることを確認。
- 粒子/霞数、1iframe、人物より後ろのlayer、背景内clip、操作透過、切替で旧frame離脱を検証。
- 子のvisibilityで停止/再開、親のvisibilityで破棄/再生成、reduced-motionで破棄/再生成、SSR切替時にambient消去、画面離脱時に演出frame消去。
- visibility/pagehide/pageshowはローカルで制御したイベント試験。実端末のタブ切替・BFCache挙動は実機受入で確認する。
- pageerror 0。agent-browserでdev画面の表示・操作一覧を確認。変更TSX/TSのESLint error/warning 0、型検査・webpack production build（ローカルmock設定）成功。最終JS構文検査も実施。

## 状態

採用済み・実装/限定検証済み。統合・配信は担当へ引渡し。配信後は共通台帳のDBG-040および配信証拠を優先し、ユーザー実機確認前に解決としない。実機では、選択した背景の穏やかな動き→武将/CTAに重ならないこと→背景切替/離脱/タブ復帰で演出が重複しないことを確認する。
