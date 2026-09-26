# DBG-053 改訂案3 承認・実装（2026-09-27）

ユーザーの「承認します」によりmission-v3を実装。旧提案の未承認記録は履歴として保持する。

- 実MissionContentを短名/進捗バー・現在目標・残数/正式報酬と右操作の3段へ変更。達成は満了バーと達成、受取済みチェック。デイリー/ノーマル件数、対象順、受取済み折りたたみ、固定一括/閉じる。報酬2件＋N件から個別/全報酬詳細へ。重要条件は省略せず自然高、必要時の条件詳細あり。
- 正式201任務（デイリー10）へ表示名・単位・分類・挑戦先を対応付け。正式名が短くても対象が不明なものは武将/スキル/装備/共闘/侵攻を補足。閾値・対象・初回・資格付き等を保持。資格付き任務の詳細は既存missionRaidProgressの討伐報酬資格を説明。presentation-map.jsonは表示対応確認であり、201行すべての実機受入ではない。
- RedesignShellの単独/一括受取は同じrefロック。一括開始時の選択タブのIDだけを順次既存onAction('claim_mission')へ渡し、毎応答の最新missionsで残る対象を確認。既存RedesignAppの永続リクエストID・正式応答setData・再取得と、サーバーのgetClaimableMission/game04_commit_mission_rewardを共用。DB/Edge Functions/報酬計算の変更なし。
- 部分失敗では停止して正式状態を再取得。受取確認済み件数とエラーを表示し、応答不明分を未付与と断定しない。再試行は再投影された未受取だけ。日付付きIDは変更せずサーバー判定を優先。初期導線のearly_missions_openedと表示再確認を保持。
- 挑戦は正式条件に対応する出陣/武将/召喚/共闘/領土侵攻へ。デイリー達成数任務はデイリー一覧先頭へ。未知条件は推測せず詳細表示。

## 検証

- `verify_b13_mission_master.cjs`: 201件の分類/単位/挑戦先と報酬画像の存在、デイリー10件、正式マスター不変。
- `verify_b13_missions.cjs`: 実RedesignShell/MissionContent/正式getClaimableMission・grantRewardを使う合成状態。375/390×664の0/3・1/3・3/3・受取済み・複数報酬・一括受取。通常行109px、初期3件完全表示、タップ44px、横はみ出し0、pageerror0。
- 単独/一括、連打/Escapeロック、他タブ保持、2件目失敗→残2件再試行、保存後応答切断→再取得→残2件、日付境界拒否、挑戦遷移、正式全報酬詳細、複雑条件全文を確認。合成状態であり実ユーザー所持品/報酬を変更しない。
- `npm run typecheck`、`npm run build`成功。Reactレビュー: hook順序・refロック・最新応答参照・既存Modalのfocus/portal/閉じる保持、未知条件の非推測を確認。
- QAはdevelopment/Previewのみ。本番はnotFound。実DB同時実行試験・端末実機受入は未実施。既存サーバー二重付与防止の契約を変更せず共用している。

共通正本/台帳へ反映。DBG-047/68面監査/main/本番/GAME03は未変更。固有名案DBG-054の承認とは別扱い。

## 共通Preview配信確定

2026-09-27: 6538d8139b6a2fe95d1c67449487690028f89a88、Preview dpl_6EMcFiAXLXgEiDETPn42Sti9uJEM Ready。配信先でも375/390の同一限定検証が合格（deployed/verification.json）。切替前fetchでPRブランチとの差0/0を確認し、共通aliasへ反映。切替後/api/qa/deploymentでもSHA/branch/preview一致。実機確認待ち。
