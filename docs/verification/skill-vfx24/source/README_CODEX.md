# GAME04 スキル演出24種｜Codex実装引継ぎ

## ユーザー指示・到達点
味方・敵双方の斬撃／全体攻撃のバリエーション追加、SSRスキル固有演出を実装する。
全素材生成後にPreviewで実際の動きを見て最終確認する。途中の個別素材承認は不要。
最初の6種（01〜06）はユーザーが画像として問題なしと確認済み。残り18種は生成済み、最終確認はPreview。
ユーザーの最新指示で実装をCodexへ移管した。このパッケージを使い、素材配置・アニメーション・既存戦闘への接続・限定検証・Git保存・Preview配信まで進める。
本番／mainへの変更・配信は今回の対象外。数値・効果・ターゲット・ヒット数・発動条件は変更しない。

## 同梱物
- assets/: 24枚のPNG原本（各演出2パーツ構成、計48パーツ相当）。独立48ファイルではない。
- manifest.json: 原本SHA256・サイズ・透過情報・左右の内容・スキル割当案・演出順。
- skill-mapping.csv: 正式スキルID別の割り当て案。36の直接攻撃のうち35に新規演出、SKD026は既存飛び道具を保持。
- 全PNGにアルファチャンネルと透明画素があることを確認済み。ただし実ゲーム背景での見え方・輪郭・切り出しは未検証。

## 開始時の確認と並走保護
Repository: kiyoshikitamura/game04。Issue #44と最新の関連PR／保存成果を先に確認する。
mainは古い可能性があり、本番正本と決めつけない。最新Productionの実SHAと並走成果を確認して専用ブランチ／worktreeを作成。
本チャットの演出調査は8694a62e423dd8b725712f5a6539060965de6203のローカル保存成果を使用。
work/game04-stage-exp-20260928上の分類処理、renderer、balance-v2.json、formal-skill-presentation.jsonとの一致を調査時点で確認。
直近ローカル別worktreeでは22fd968（raid balance production verification）が見えているが、それを最新Productionと断定しない。
このチャットではアプリコード変更・Gitコミット・配信は一切していない。
既存ローカル環境 /workspace/scratch/de470dda6753/game04 には他担当の未コミット変更（quest65、raid-supply、territory、API等）がある。触らず独立作業する。
過去のクローズ済みタスクや全機能監査を再開しない。最新の説明文・報酬・レイド等の並走変更を保持する。
接続先の参考: Preview DB `znakrkaazliexzwihxge`。正確な既存設定で確認すること。今回DB変更は不要。

## 現行実装の入口
- src/app/components/redesign/battleEffectPresentation.ts: 16系統、技名の正規表現＋対象による分類。
- src/app/components/redesign/battle-effects/assets.json: 現行素材。
- src/app/components/redesign/battle-effects/settings.ts: 時間・サイズ。
- src/app/components/redesign/battle-effects/renderer.ts: DOM画像レイヤー・コマ・seek再生。
- src/app/components/redesign/battle-effects/BattleEffectLayer.tsx: 対象側別のグループ化、停止／速度同期。
- src/app/components/redesign/battle-effects/recordedEffects.ts: 最短フレーム時間と素材参照。
- src/app/components/redesign/battle-effects/tutorialEffects.ts: SSR10＋SR15の武将カットイン、連撃素材、最短時間。
- src/app/components/redesign/BattleView.tsx: 実戦接続。
- src/domain/presentation/recordedBattlePresentation.ts: 戦闘記録→表示。
- src/domain/redesign/data/formal-skill-presentation.json / balance-v2.json: 正式72スキル、SSR14種。
- src/domain/redesign/raidFormalSkills.ts / formalOwnedSkills.ts: 正式スキル生成。
- src/app/qa/sr-cutins 等の既存Preview専用QAを参考にする。

## 素材処理
原本はそのまま保持し、コピーを切り出し・透過維持・必要な余白付与・WebP等へ適正圧縮する。
各シートの左右は均等幅ではない。manifestの左／右内容を見ながら個別に切り出す。単純な中央分割や自動半分分割は禁止。
細い残光、半透明、飛沫を消さない。黒抜き・白抜き・アルファ二値化で輪郭を壊さない。
広いグロー（特に慈愛の大祈祷）は背景に重ねて確認する。必要に応じ余白・ブレンド・不透明度で調整。
生成素材は連番アニメではない。移動・回転・スケール・マスクによる出現・消失・複製・粒子で動きを作る。
新たな素材生成や大幅な意匠変更が必要なら、その箇所だけ明示。原本を勝手に差し替えない。
ファイル名は英数字のeffect_idを使用し、素材と演出設定の対応を管理する。

## 接続方針
1. 武将カットインはSSR10名／SR15名の既存成果を保持。カットイン＝武将、攻撃・補助VFX＝使用スキル。
2. 技名判定に頼らず、正式skillId→effectIdの明示マッピングを優先。敵も同じIDで同じ演出を使用。
3. 未割当・旧保存戦闘・未知IDは既存演出へフォールバック。通常攻撃も既存を保持。
4. 敵／味方は実際の対象アンカーへ着弾。横方向の技は必要に応じ反転、降下や地割れは上下反転しない。
5. 全体攻撃を全画面固定位置に描かず、記録された対象群の中心／範囲に合わせる。対象外や死亡済みへの成功表示を足さない。
6. 複数軌跡の見た目で実際のHIT数・ダメージ回数を増やさない。数値は記録に厳密に合わせる。
7. 解除・状態付与は成功したイベント時だけ成功演出。スキル発動の予備動作と結果の成功演出を分離する。
8. 破陣撃・破勢の一閃は既存の解除→攻撃順を保持。解除不成立時に破壊成功を描かない。
9. 迎撃の構えは付与時の構えであり、その場で反撃ダメージを出さない。
10. 現行16系統にはshield／taunt／counter付与／cleanse成功の専用VFX分岐が不足。SSR047/050/056/071/072を単にdamageへ分類しない。実際の記録イベントを確認して必要な表示分岐を足す。
11. 武将カットイン→連撃表示→攻撃／効果の既存再生順、BURST中の割り込み抑止、pause／倍速／SKIP／リタイアの同期を保持。
12. 同一SSR演出を各効果フレームで丸ごと重複再生しない。発動単位の予備動作＋各結果イベントの着弾という構成にする。
13. 長い静止絵表示にしない。SSRでも着弾を主役に短くまとめ、周回のテンポを維持。時間はPreviewで最終調整。
14. 使用戦闘に必要な素材を事前読込。タイトルで全24種を一括ロードしない。pause・skip後の残留DOM／音／タイマーを残さない。

## 割当の扱い
CSVは本チャットで整理した実装案。正式IDと現行名を再照合し、割当根拠をコードに固定する。
通常単体の属性差は既存属性情報を使い、例えば炎断に必要な炎のアクセントは既存今回素材の合成で表現可。
敵ボスであるという理由だけでSSRスキルへ置換しない。例えば遭遇レイド伊達のSKD022は風の薙ぎ、上杉のSKD014は蒼波一閃。
サウンドは既存の割当・再生制御を維持。未依頼の新BGM／SE生成は不要。

## Preview受入
専用QA（例 /qa/skill-vfx24）で24種を選択、味方発動／敵発動、再生、一時停止、速度、再生し直しを操作できるようにする。
実際のBattleView・演出レイヤーを使い、通常ゲームにも同じマッピングが接続される形にする。QAだけ別実装で済ませない。
QAの戦闘fixtureは資産・報酬・進捗に書き込まず、既存Preview専用ガードを踏襲する。
375／390pxとPCで単体・全体・補助・解除の位置、サイズ、透過、ダメージ／HPの見やすさを確認。
24種×味方／敵の参照と再生、複合効果の順序、解除不成立、倍速・停止・SKIP・リタイア、既存カットイン／連撃を限定検証。
型検査・ビルド・素材欠落と404を確認。不要な全機能監査や既存タスクの再開はしない。
Git保存後、Preview用の環境で配信。Readyとコミット対応、配信先の実動作を確認する。
完了報告は保存SHA・ブランチ・直接開けるQA Preview URL・通常ゲームPreview URL・確認済み項目・残る見た目調整点。
ユーザーはそのPreviewで動きを見て最終確認する。本番反映はその後の別指示。
