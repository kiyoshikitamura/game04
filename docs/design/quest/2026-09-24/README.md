# GAME04 出陣 UI／演出再仕上げ

状態：専用Preview配信・検証記録保存済み。素材対応・装飾再現の未解消事項があるため、ビジュアル完全受入としては未完了。過去の仮クローズはビジュアル受入ではない。

最終記録：`VERIFICATION.md`、配信：`DEPLOYMENT.json`、比較：`comparison/mock-vs-live-300.jpg`。

## 作業基準

- 基準：`dce0bda37f353c2706e5566fba6333fbdc2c393c`、`work/game04-raid-final-evidence-20260923`。
- ローカル保存履歴 `65f38238e12417b8cfc1a29b06fdd063bf563a50` とは全5636ファイルのGit tree一致を確認。tree `aac7e43e21daf4d63fc8968ae57bbea67d03bddd`。
- 専用Branch：`work/game04-quest-finish-20260924`。他ラインの作業ツリーは読取のみ。
- 共通Header／Footerのみ本陣保存 `70a3b6fe467d9c983f949f2689bc830ac96e65b1` の RedesignShell.tsx / ShellChrome.css を局所統合。本陣本体の改修は取り込まない。
- 原本：`quest-approved-mock.jpeg`。添付JPEGを無加工で保存。
- 正本：UI／MASTER／GROWTH／BATTLE各2026-09-21版と、本陣HOME_MOCK_REQUIREMENTS_FIX。数値変更なし。

## 訂正済み比較基準

| 画面 | 必須の配置・内容 |
|---|---|
| エリア一覧 | 背景主体の大型カード、名称・正式説明、縦札の攻略中／未解放 |
| ステージ一覧 | エリア見出し、金の進行線・番号独立列、正式名称、実消費行動力、状態 |
| 挑戦前 | 中央Dialog、正式ステージ名、最終Wave正式ボスを大きく、属性は名前付近、Wave／行動力、ヒント／報酬、朱CTA |
| 出撃準備 | 実編成・行動順、最大5人、画像／レアリティ／属性／名前／Lv／HPを通常フローで分離、共通SP開始0・上限400 |
| 武将詳細 | 選択した実武将と装着スキル、解放状態に応じた空き枠、共通カード比率保持 |
| ヒント／報酬 | 既存中央Dialog、正式データ接続。モック仮数値・物語名を追加しない |

Footer：本陣／出陣／武将／共闘／召喚。Header：本陣確定情報、顔にLv、右側未認証、メニュー、銭／輝石／行動力。総合力・RP・経験値・回復時間は追加しない。

中央Dialogは暗転・背面操作抑止、内部金色スクロール、低い画面でも閉じる／末尾CTAへ到達。必要画像の準備中は操作抑止。画像変形・旧GAME03代用品・独自再設計禁止。

## 所有範囲

- 表示担当：QuestView.tsx / QuestView.css / PreparationModal.tsx、出陣限定補助と素材対応表。
- 接続担当：RedesignApp.tsxの編成往復、実API検証スクリプトとデータ不足記録。
- 独立検証担当：比較・差戻し。実装ファイルは編集しない。
- 親：共通Header局所統合、BossDisplayの出陣表示variant、Git保存、専用Preview、最終記録。

## 保持・検証範囲

正式10エリア65面、最大6Wave、敵開始SP／上限分離、解放／進行／報酬／消費、戦闘結果・帰還・再挑戦を保持。requestId／同期lock／API二重処理保護を維持。編成保存後は同じステージの準備へ最新状態で帰還。

390px、375×640、モック同幅300pxを区別。fixture・静的／ドメイン・実API・配信後本体を別に記録。HTTP200・型・Buildのみでは完成扱いにしない。

Production公開・Production環境変更・mainマージ・DB／API再配信なし。
