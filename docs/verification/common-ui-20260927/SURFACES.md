# 全画面・状態の静的棚卸し

自動抽出したルート、部品、Dialog/Panel呼出し、状態表示。製品経路・QA・管理・到達未確定部品を含む母集団。動的な全状態の網羅や目視合格を意味しない。import到達性は実際の表示保証ではなく、動的条件・文字列生成importは未確認。具体的な適用・証跡・問題分類はREVIEW.mdを参照。

|画面／状態|導線|適用ルール|使用部品|問題|修正先|確認結果|
|---|---|---|---|---|---|---|
|route: /admin/kpi/day/[date]|管理導線|§2/3/10/18/19||未照合（静的抽出）|src/app/admin/kpi/day/[date]/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |管理導線|§2/3/10/18/19||未照合（静的抽出）|src/app/admin/kpi/game04/Game04GameplayKpi.tsx:29|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |管理導線|§2/3/10/18/19||未照合（静的抽出）|src/app/admin/kpi/game04/Game04GameplayKpi.tsx:29|未確認（個別証跡はREVIEW.md参照）|
|route: /admin/kpi/game04|管理導線|§2/3/10/18/19||未照合（静的抽出）|src/app/admin/kpi/game04/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |管理導線|§2/3/10/18/19||未照合（静的抽出）|src/app/admin/kpi/KpiDailyOverview.tsx:40|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |管理導線|§2/3/10/18/19||未照合（静的抽出）|src/app/admin/kpi/KpiDashboard.tsx:118|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |管理導線|§2/3/10/18/19||未照合（静的抽出）|src/app/admin/kpi/KpiDashboardV2.tsx:102|未確認（個別証跡はREVIEW.md参照）|
|route: /admin/kpi|管理導線|§2/3/10/18/19|./KpiDashboardShell|未照合（静的抽出）|src/app/admin/kpi/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /auth/callback|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/auth/callback/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "alertdialog" |製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/auth/callback/page.tsx:390|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/auth/callback/page.tsx:396|未確認（個別証跡はREVIEW.md参照）|
|state: div "alertdialog" |製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/auth/callback/page.tsx:402|未確認（個別証跡はREVIEW.md参照）|
|route: /auth/game04/callback|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/auth/game04/callback/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/auth/game04/callback/page.tsx:39|未確認（個別証跡はREVIEW.md参照）|
|route: /auth/game04|製品導線（静的import）|§2/3/10/18/19|@/app/components/ui/ActionButton|未照合（静的抽出）|src/app/auth/game04/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|@/app/components/ui/ActionButton|未照合（静的抽出）|src/app/auth/game04/page.tsx:61|未確認（個別証跡はREVIEW.md参照）|
|route: /billing/return|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/billing/return/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: AdvView|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/AdvView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: AttributeBadge|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/AttributeBadge.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: AuthenticationReminderModal|到達未確定|§2/3/10/18/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/AuthenticationReminderModal.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "ゲームデータを保護"|到達未確定|§12/18.13/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/AuthenticationReminderModal.tsx:34|未確認（個別証跡はREVIEW.md参照）|
|component: AuthView|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/AuthView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: AvatarRenderer|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/AvatarRenderer.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: AvatarTab|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/AvatarTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: BagTab|到達未確定|§2/3/10/18/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BagTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {selectedItem.name}|到達未確定|§12/18.13/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BagTab.tsx:164|未確認（個別証跡はREVIEW.md参照）|
|component: BattleEffectPresentation|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/battle/BattleEffectPresentation.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/battle/BattleEffectPresentation.tsx:67|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/battle/BattleEffectPresentation.tsx:104|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" {`${presentation.skillName} 攻撃演出`}|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/battle/BattleEffectPresentation.tsx:254|未確認（個別証跡はREVIEW.md参照）|
|component: BattleMatchupPresentation|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/battle/BattleMatchupPresentation.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: section "status" {`${opponentName}との対戦開始`}|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/battle/BattleMatchupPresentation.tsx:20|未確認（個別証跡はREVIEW.md参照）|
|state: section "status" {`${context?.opponentLabel \|\| opponentName}との対戦開始`}|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/battle/BattleMatchupPresentation.tsx:21|未確認（個別証跡はREVIEW.md参照）|
|component: BattleResultSummary|製品導線（静的import）|§2/3/10/18/19|../ui/OutlawButton;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/battle/BattleResultSummary.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |製品導線（静的import）|§2/3/10/18/19|../ui/OutlawButton;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/battle/BattleResultSummary.tsx:141|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/OutlawButton;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/battle/BattleResultSummary.tsx:178|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |製品導線（静的import）|§2/3/10/18/19|../ui/OutlawButton;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/battle/BattleResultSummary.tsx:204|未確認（個別証跡はREVIEW.md参照）|
|component: BattleUnitPortrait|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/battle/BattleUnitPortrait.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: ExclusiveBattlePresentation|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/battle/ExclusiveBattlePresentation.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: ModeBattleResultCard|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/battle/ModeBattleResultCard.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: QuestBattleViewer|QA導線|§2/3/10/18/19|./StreetBattleViewer|未照合（静的抽出）|src/app/components/battle/QuestBattleViewer.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |QA導線|§2/3/10/18/19|./StreetBattleViewer|未照合（静的抽出）|src/app/components/battle/QuestBattleViewer.tsx:205|未確認（個別証跡はREVIEW.md参照）|
|component: StreetBattleSetup|QA導線|§2/3/10/18/19|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleSetup.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "バトル素材を準備中"|QA導線|§2/3/10/18/19|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleSetup.tsx:37|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleSetup.tsx:37|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |QA導線|§2/3/10/18/19|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleSetup.tsx:38|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleSetup.tsx:38|未確認（個別証跡はREVIEW.md参照）|
|dialog: SkillDetailDialog |QA導線|§12/18.13/19|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleSetup.tsx:38|未確認（個別証跡はREVIEW.md参照）|
|component: StreetBattleViewer|QA導線|§2/3/10/18/19|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleViewer.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: StreetStatuses|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/battle/StreetStatuses.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: BbsTab|到達未確定|§2/3/10/18/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BbsTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "スレッド作成"|到達未確定|§12/18.13/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BbsTab.tsx:412|未確認（個別証跡はREVIEW.md参照）|
|component: BillingHistory|製品導線（静的import）|§2/3/10/18/19|./ui/OutlawButton;./ui/CanonicalDialog;./ui/OutlawCard|未照合（静的抽出）|src/app/components/BillingHistory.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "購入履歴"|製品導線（静的import）|§12/18.13/19|./ui/OutlawButton;./ui/CanonicalDialog;./ui/OutlawCard|未照合（静的抽出）|src/app/components/BillingHistory.tsx:35|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|./ui/OutlawButton;./ui/CanonicalDialog;./ui/OutlawCard|未照合（静的抽出）|src/app/components/BillingHistory.tsx:38|未確認（個別証跡はREVIEW.md参照）|
|component: BillingStatusDialog|製品導線（静的import）|§2/3/10/18/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BillingStatusDialog.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "購入状況"|製品導線（静的import）|§12/18.13/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BillingStatusDialog.tsx:67|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BillingStatusDialog.tsx:71|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" |製品導線（静的import）|§2/3/10/18/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BillingStatusDialog.tsx:72|未確認（個別証跡はREVIEW.md参照）|
|component: CardBattleView|QA導線|§2/3/10/18/19|./battle/QuestBattleViewer|未照合（静的抽出）|src/app/components/CardBattleView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "バトル終了演出"|QA導線|§2/3/10/18/19|./battle/QuestBattleViewer|未照合（静的抽出）|src/app/components/CardBattleView.tsx:174|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |QA導線|§2/3/10/18/19|./battle/QuestBattleViewer|未照合（静的抽出）|src/app/components/CardBattleView.tsx:179|未確認（個別証跡はREVIEW.md参照）|
|dialog: SkillDetailDialog |QA導線|§12/18.13/19|./battle/QuestBattleViewer|未照合（静的抽出）|src/app/components/CardBattleView.tsx:280|未確認（個別証跡はREVIEW.md参照）|
|component: CardIcon|到達未確定|§2/3/10/18/19|./AttributeBadge|未照合（静的抽出）|src/app/components/CardIcon.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: CharacterEquipment|到達未確定|§2/3/10/18/19|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterEquipment.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: section "status" |到達未確定|§2/3/10/18/19|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterEquipment.tsx:43|未確認（個別証跡はREVIEW.md参照）|
|component: CharacterHome|到達未確定|§2/3/10/18/19|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterHome.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterHome.tsx:88|未確認（個別証跡はREVIEW.md参照）|
|component: CharacterParty|到達未確定|§2/3/10/18/19|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterParty.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |到達未確定|§2/3/10/18/19|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterParty.tsx:43|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterParty.tsx:44|未確認（個別証跡はREVIEW.md参照）|
|component: CharacterPresentation|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/character/CharacterPresentation.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: CharacterStageHUD|到達未確定|§2/3/10/18/19|../ui/OutlawButton|未照合（静的抽出）|src/app/components/character/CharacterStageHUD.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: CharacterStatusBadges|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/character/CharacterStatusBadges.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: CharacterSystemV2|到達未確定|§2/3/10/18/19|../ui/CanonicalDialog;../ui/CanonicalItemIcon;../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterSystemV2.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|../ui/CanonicalDialog;../ui/CanonicalItemIcon;../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterSystemV2.tsx:227|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {assetDetail.kind === "skill" ? "スキル詳細" : "装備詳細"}|到達未確定|§12/18.13/19|../ui/CanonicalDialog;../ui/CanonicalItemIcon;../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterSystemV2.tsx:300|未確認（個別証跡はREVIEW.md参照）|
|component: GrowthExpSummary|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/character/GrowthExpSummary.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/character/GrowthExpSummary.tsx:7|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" "強化情報を取得中"|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/character/GrowthExpSummary.tsx:8|未確認（個別証跡はREVIEW.md参照）|
|component: CharacterTab|到達未確定|§2/3/10/18/19|./ui/CanonicalItemIcon;./ui/EditableSettingSection;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CharacterTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "おすすめパーティと装備を設定しますか？"|到達未確定|§12/18.13/19|./ui/CanonicalItemIcon;./ui/EditableSettingSection;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CharacterTab.tsx:352|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|./ui/CanonicalItemIcon;./ui/EditableSettingSection;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CharacterTab.tsx:366|未確認（個別証跡はREVIEW.md参照）|
|dialog: SkillDetailDialog |到達未確定|§12/18.13/19|./ui/CanonicalItemIcon;./ui/EditableSettingSection;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CharacterTab.tsx:1084|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "装備詳細"|到達未確定|§12/18.13/19|./ui/CanonicalItemIcon;./ui/EditableSettingSection;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CharacterTab.tsx:1085|未確認（個別証跡はREVIEW.md参照）|
|component: CommonModals|QA導線|§2/3/10/18/19|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {`装備選択（スロット${activeGearSlot + 1}）`}|QA導線|§12/18.13/19|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:132|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {`スキル選択（スロット${activeSkillSlot + 1}）`}|QA導線|§12/18.13/19|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:164|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "ガチャ演出を準備中"|QA導線|§2/3/10/18/19|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:201|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "ガチャ結果を表示中"|QA導線|§2/3/10/18/19|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:229|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "ガチャ抽選結果を同期中"|QA導線|§2/3/10/18/19|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:234|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "エラー"|QA導線|§12/18.13/19|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:317|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {activeGuildDetail.name}|QA導線|§12/18.13/19|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:345|未確認（個別証跡はREVIEW.md参照）|
|component: ExternalBrowserGooglePrompt|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ExternalBrowserGooglePrompt.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: Footer|QA導線|§2/3/10/18/19|./useDailyShopBadge|未照合（静的抽出）|src/app/components/Footer.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: FriendPanel|到達未確定|§2/3/10/18/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/FriendPanel.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: FullScreenPanel "友達"|到達未確定|§12/18.13/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/FriendPanel.tsx:109|未確認（個別証跡はREVIEW.md参照）|
|component: CharacterGachaPresentation|製品導線（静的import）|§2/3/10/18/19|../ui/OutlawButton|未照合（静的抽出）|src/app/components/gacha/CharacterGachaPresentation.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/OutlawButton|未照合（静的抽出）|src/app/components/gacha/CharacterGachaPresentation.tsx:95|未確認（個別証跡はREVIEW.md参照）|
|state: i "status" "ガチャ演出を準備中"|製品導線（静的import）|§2/3/10/18/19|../ui/OutlawButton|未照合（静的抽出）|src/app/components/gacha/CharacterGachaPresentation.tsx:95|未確認（個別証跡はREVIEW.md参照）|
|state: section "status" |製品導線（静的import）|§2/3/10/18/19|../ui/OutlawButton|未照合（静的抽出）|src/app/components/gacha/CharacterGachaPresentation.tsx:206|未確認（個別証跡はREVIEW.md参照）|
|component: FormalGachaHub|製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "tablist" "登用種別"|製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:84|未確認（個別証跡はREVIEW.md参照）|
|state: button "tab" |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:85|未確認（個別証跡はREVIEW.md参照）|
|state: button "tab" |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:86|未確認（個別証跡はREVIEW.md参照）|
|dialog: GachaModalPortal |製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:127|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "登用確認"|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:127|未確認（個別証跡はREVIEW.md参照）|
|dialog: GachaModalPortal |製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:132|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {surface === "NORMAL" ? "通常登用 提供割合" : `${meta.label}特選 提供割合`}|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:132|未確認（個別証跡はREVIEW.md参照）|
|dialog: GachaModalPortal |製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:139|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {`${meta.label} SSR選択交換`}|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:139|未確認（個別証跡はREVIEW.md参照）|
|component: GachaModalPortal|製品導線（静的import）|§2/3/10/18/19|../ui/dialogPresence|未照合（静的抽出）|src/app/components/gacha/GachaModalPortal.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: GachaPromotion|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/gacha/GachaPromotion.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: SengokuGateOpening|製品導線（静的import）|§2/3/10/18/19|./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/SengokuGateOpening.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: GachaModalPortal |製品導線（静的import）|§12/18.13/19|./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/SengokuGateOpening.tsx:47|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/SengokuGateOpening.tsx:73|未確認（個別証跡はREVIEW.md参照）|
|component: GachaTab|QA導線|§2/3/10/18/19|./ui/CanonicalDialog;./ui/GuideDialog|未照合（静的抽出）|src/app/components/GachaTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: GuideDialog "初心者ガイド"|QA導線|§12/18.13/19|./ui/CanonicalDialog;./ui/GuideDialog|未照合（静的抽出）|src/app/components/GachaTab.tsx:124|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |QA導線|§2/3/10/18/19|./ui/CanonicalDialog;./ui/GuideDialog|未照合（静的抽出）|src/app/components/GachaTab.tsx:161|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |QA導線|§2/3/10/18/19|./ui/CanonicalDialog;./ui/GuideDialog|未照合（静的抽出）|src/app/components/GachaTab.tsx:170|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|./ui/CanonicalDialog;./ui/GuideDialog|未照合（静的抽出）|src/app/components/GachaTab.tsx:171|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "提供割合"|QA導線|§12/18.13/19|./ui/CanonicalDialog;./ui/GuideDialog|未照合（静的抽出）|src/app/components/GachaTab.tsx:183|未確認（個別証跡はREVIEW.md参照）|
|component: GuildEmblemEditor|到達未確定|§2/3/10/18/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/guild/GuildEmblemEditor.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "エンブレム変更"|到達未確定|§12/18.13/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/guild/GuildEmblemEditor.tsx:117|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/guild/GuildEmblemEditor.tsx:122|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |到達未確定|§2/3/10/18/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/guild/GuildEmblemEditor.tsx:123|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |到達未確定|§2/3/10/18/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/guild/GuildEmblemEditor.tsx:139|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/guild/GuildEmblemEditor.tsx:140|未確認（個別証跡はREVIEW.md参照）|
|component: GuildTab|到達未確定|§2/3/10/18/19|./ui/OutlawCard;./ui/OutlawButton;./ui/EditableSettingSection|未照合（静的抽出）|src/app/components/GuildTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|./ui/OutlawCard;./ui/OutlawButton;./ui/EditableSettingSection|未照合（静的抽出）|src/app/components/GuildTab.tsx:292|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" |到達未確定|§2/3/10/18/19|./ui/OutlawCard;./ui/OutlawButton;./ui/EditableSettingSection|未照合（静的抽出）|src/app/components/GuildTab.tsx:495|未確認（個別証跡はREVIEW.md参照）|
|component: GvgMatchStatusPanel|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/GvgMatchStatusPanel.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: GvgTab|到達未確定|§2/3/10/18/19|./GvgMatchStatusPanel;./ui/HubPage;./ui/HeroPanel;./ui/Badge;./ui/OutlawButton;./ui/PeriodStatus|未照合（静的抽出）|src/app/components/GvgTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: HeroPanel |到達未確定|§12/18.13/19|./GvgMatchStatusPanel;./ui/HubPage;./ui/HeroPanel;./ui/Badge;./ui/OutlawButton;./ui/PeriodStatus|未照合（静的抽出）|src/app/components/GvgTab.tsx:222|未確認（個別証跡はREVIEW.md参照）|
|dialog: GvgMatchStatusPanel |到達未確定|§12/18.13/19|./GvgMatchStatusPanel;./ui/HubPage;./ui/HeroPanel;./ui/Badge;./ui/OutlawButton;./ui/PeriodStatus|未照合（静的抽出）|src/app/components/GvgTab.tsx:254|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|./GvgMatchStatusPanel;./ui/HubPage;./ui/HeroPanel;./ui/Badge;./ui/OutlawButton;./ui/PeriodStatus|未照合（静的抽出）|src/app/components/GvgTab.tsx:256|未確認（個別証跡はREVIEW.md参照）|
|component: Header|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/Header.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: HomeResumeShell|到達未確定|§2/3/10/18/19|./ui/PageShell|未照合（静的抽出）|src/app/components/HomeResumeShell.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: HomeTab|QA導線|§2/3/10/18/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/HomeTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "アクティビティ"|QA導線|§12/18.13/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/HomeTab.tsx:632|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "プレオープン限定 同盟総合力ランキング"|QA導線|§12/18.13/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/HomeTab.tsx:841|未確認（個別証跡はREVIEW.md参照）|
|component: InboxPanel|製品導線（静的import）|§2/3/10/18/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalDialog;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/InboxPanel.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalDialog;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/InboxPanel.tsx:91|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |製品導線（静的import）|§2/3/10/18/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalDialog;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/InboxPanel.tsx:92|未確認（個別証跡はREVIEW.md参照）|
|dialog: FullScreenPanel "受信箱"|製品導線（静的import）|§12/18.13/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalDialog;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/InboxPanel.tsx:161|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {selectedNews.title}|製品導線（静的import）|§12/18.13/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalDialog;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/InboxPanel.tsx:182|未確認（個別証跡はREVIEW.md参照）|
|component: LegalPanel|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/LegalPanel.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: LoginBonusModal|到達未確定|§2/3/10/18/19|./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/LoginBonusModal.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/LoginBonusModal.tsx:74|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/LoginBonusModal.tsx:113|未確認（個別証跡はREVIEW.md参照）|
|component: MenuTab|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/MenuTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: BeginnerMissionRewardCta|到達未確定|§2/3/10/18/19|../ui/dialogPresence|未照合（静的抽出）|src/app/components/mission/BeginnerMissionRewardCta.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: PrepMissionEventDialogController|QA導線|§2/3/10/18/19|../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/mission/PrepMissionEventDialogController.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {pending.displayName}|QA導線|§12/18.13/19|../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/mission/PrepMissionEventDialogController.tsx:159|未確認（個別証跡はREVIEW.md参照）|
|state: span "alert" |QA導線|§2/3/10/18/19|../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/mission/PrepMissionEventDialogController.tsx:174|未確認（個別証跡はREVIEW.md参照）|
|component: MissionPanel|到達未確定|§2/3/10/18/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/MissionPanel.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: FullScreenPanel "任務"|到達未確定|§12/18.13/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/MissionPanel.tsx:212|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |到達未確定|§2/3/10/18/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/MissionPanel.tsx:224|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |到達未確定|§2/3/10/18/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/MissionPanel.tsx:231|未確認（個別証跡はREVIEW.md参照）|
|component: MonthlyPassBanner|到達未確定|§2/3/10/18/19|./ui/OutlawButton|未照合（静的抽出）|src/app/components/MonthlyPassBanner.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: MoveBaseModal|QA導線|§2/3/10/18/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/MoveBaseModal.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "拠点移動"|QA導線|§12/18.13/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/MoveBaseModal.tsx:19|未確認（個別証跡はREVIEW.md参照）|
|component: PaidAssetExpiry|製品導線（静的import）|§2/3/10/18/19|./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/PaidAssetExpiry.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "購入分の有効期限"|製品導線（静的import）|§12/18.13/19|./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/PaidAssetExpiry.tsx:55|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/PaidAssetExpiry.tsx:58|未確認（個別証跡はREVIEW.md参照）|
|component: PatrolTab|到達未確定|§2/3/10/18/19|./ui/OutlawCard;./ui/OutlawButton;./ui/SubTabNav;./ui/SectionHeader;./ui/HubPage;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/PatrolTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|./ui/OutlawCard;./ui/OutlawButton;./ui/SubTabNav;./ui/SectionHeader;./ui/HubPage;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/PatrolTab.tsx:447|未確認（個別証跡はREVIEW.md参照）|
|state: small "status" |到達未確定|§2/3/10/18/19|./ui/OutlawCard;./ui/OutlawButton;./ui/SubTabNav;./ui/SectionHeader;./ui/HubPage;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/PatrolTab.tsx:478|未確認（個別証跡はREVIEW.md参照）|
|component: PCLeftChat|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/PCLeftChat.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: PCRightSidebar|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/PCRightSidebar.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: RankPresentation|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/presentation/RankPresentation.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: StatusMetric|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/presentation/StatusMetric.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: GuildIdentity|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/profile/GuildIdentity.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: PublicUserProfile|製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/profile/PublicUserProfile.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog |製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/profile/PublicUserProfile.tsx:86|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/profile/PublicUserProfile.tsx:87|未確認（個別証跡はREVIEW.md参照）|
|dialog: SkillDetailDialog |製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/profile/PublicUserProfile.tsx:109|未確認（個別証跡はREVIEW.md参照）|
|component: SeasonHonors|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/profile/SeasonHonors.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/profile/SeasonHonors.tsx:67|未確認（個別証跡はREVIEW.md参照）|
|component: UserAvatar|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/profile/UserAvatar.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: UserIdentityRow|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/profile/UserIdentityRow.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" "リーダーを読み込み中"|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/profile/UserIdentityRow.tsx:21|未確認（個別証跡はREVIEW.md参照）|
|component: BattleTopPresentation|到達未確定|§2/3/10/18/19|../ui/OutlawButton;../ui/ScreenState|未照合（静的抽出）|src/app/components/pvp/BattleTopPresentation.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: PvpBattleRewards|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/pvp/PvpBattleRewards.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: PvpDeckPresentation|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/pvp/PvpDeckPresentation.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: PvpTab|到達未確定|§2/3/10/18/19|./ui/OutlawCard;./ui/HubPage;./ui/ScreenState;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/PvpTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {deckDialog === "my" ? "MY DECK" : "RIVAL DECK"}|到達未確定|§12/18.13/19|./ui/OutlawCard;./ui/HubPage;./ui/ScreenState;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/PvpTab.tsx:297|未確認（個別証跡はREVIEW.md参照）|
|dialog: SkillDetailDialog |到達未確定|§12/18.13/19|./ui/OutlawCard;./ui/HubPage;./ui/ScreenState;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/PvpTab.tsx:314|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "BPが不足しています"|到達未確定|§12/18.13/19|./ui/OutlawCard;./ui/HubPage;./ui/ScreenState;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/PvpTab.tsx:315|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "BP回復"|到達未確定|§12/18.13/19|./ui/OutlawCard;./ui/HubPage;./ui/ScreenState;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/PvpTab.tsx:319|未確認（個別証跡はREVIEW.md参照）|
|component: QuestEncounterHomeReturn|QA導線|§2/3/10/18/19|../ui/OutlawButton|未照合（静的抽出）|src/app/components/quest/QuestEncounterHomeReturn.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/OutlawButton|未照合（静的抽出）|src/app/components/quest/QuestEncounterHomeReturn.tsx:32|未確認（個別証跡はREVIEW.md参照）|
|component: QuestPresentationV2|到達未確定|§2/3/10/18/19|../ui/HubPage;../ui/OutlawButton;../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/quest/QuestPresentationV2.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |到達未確定|§2/3/10/18/19|../ui/HubPage;../ui/OutlawButton;../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/quest/QuestPresentationV2.tsx:228|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |到達未確定|§2/3/10/18/19|../ui/HubPage;../ui/OutlawButton;../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/quest/QuestPresentationV2.tsx:242|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|../ui/HubPage;../ui/OutlawButton;../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/quest/QuestPresentationV2.tsx:282|未確認（個別証跡はREVIEW.md参照）|
|state: section "status" |到達未確定|§2/3/10/18/19|../ui/HubPage;../ui/OutlawButton;../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/quest/QuestPresentationV2.tsx:294|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "クエスト結果"|到達未確定|§12/18.13/19|../ui/HubPage;../ui/OutlawButton;../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/quest/QuestPresentationV2.tsx:299|未確認（個別証跡はREVIEW.md参照）|
|component: QuestProgressionGuide|到達未確定|§2/3/10/18/19|../ui/GuideDialog|未照合（静的抽出）|src/app/components/quest/QuestProgressionGuide.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: GuideDialog "まずはクエストを進めよう"|到達未確定|§12/18.13/19|../ui/GuideDialog|未照合（静的抽出）|src/app/components/quest/QuestProgressionGuide.tsx:51|未確認（個別証跡はREVIEW.md参照）|
|dialog: GuideDialog "初心者ガイド"|到達未確定|§12/18.13/19|../ui/GuideDialog|未照合（静的抽出）|src/app/components/quest/QuestProgressionGuide.tsx:55|未確認（個別証跡はREVIEW.md参照）|
|dialog: GuideDialog "初心者ガイド"|到達未確定|§12/18.13/19|../ui/GuideDialog|未照合（静的抽出）|src/app/components/quest/QuestProgressionGuide.tsx:63|未確認（個別証跡はREVIEW.md参照）|
|dialog: GuideDialog "初心者ガイド"|到達未確定|§12/18.13/19|../ui/GuideDialog|未照合（静的抽出）|src/app/components/quest/QuestProgressionGuide.tsx:66|未確認（個別証跡はREVIEW.md参照）|
|component: QuestRaidEncounter|到達未確定|§2/3/10/18/19|../ui/FullScreenPanel;../ui/OutlawButton;../ui/dialogPresence|未照合（静的抽出）|src/app/components/quest/QuestRaidEncounter.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |到達未確定|§2/3/10/18/19|../ui/FullScreenPanel;../ui/OutlawButton;../ui/dialogPresence|未照合（静的抽出）|src/app/components/quest/QuestRaidEncounter.tsx:48|未確認（個別証跡はREVIEW.md参照）|
|dialog: FullScreenPanel |到達未確定|§12/18.13/19|../ui/FullScreenPanel;../ui/OutlawButton;../ui/dialogPresence|未照合（静的抽出）|src/app/components/quest/QuestRaidEncounter.tsx:49|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |到達未確定|§2/3/10/18/19|../ui/FullScreenPanel;../ui/OutlawButton;../ui/dialogPresence|未照合（静的抽出）|src/app/components/quest/QuestRaidEncounter.tsx:58|未確認（個別証跡はREVIEW.md参照）|
|component: QuestTownStory|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/quest/QuestTownStory.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: QuestRaidBonus|QA導線|§2/3/10/18/19|../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/QuestRaidBonus.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: RaidApprovedVisual|製品導線（静的import）|§2/3/10/18/19|../redesign/ElementBadge|未照合（静的抽出）|src/app/components/raid/RaidApprovedVisual.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: RaidEnemyRoster|QA導線|§2/3/10/18/19|../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidEnemyRoster.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |QA導線|§2/3/10/18/19|../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidEnemyRoster.tsx:16|未確認（個別証跡はREVIEW.md参照）|
|component: RaidEnemySelection|QA導線|§2/3/10/18/19|@/domain/raidRoomDisplay;../ui/SectionHeader;../ui/OutlawButton;../ui/SubTabNav;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/raid/RaidEnemySelection.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |QA導線|§2/3/10/18/19|@/domain/raidRoomDisplay;../ui/SectionHeader;../ui/OutlawButton;../ui/SubTabNav;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/raid/RaidEnemySelection.tsx:26|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|@/domain/raidRoomDisplay;../ui/SectionHeader;../ui/OutlawButton;../ui/SubTabNav;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/raid/RaidEnemySelection.tsx:32|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|@/domain/raidRoomDisplay;../ui/SectionHeader;../ui/OutlawButton;../ui/SubTabNav;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/raid/RaidEnemySelection.tsx:34|未確認（個別証跡はREVIEW.md参照）|
|component: raidPagePresentation|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/raid/raidPagePresentation.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "通信中"|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/raid/raidPagePresentation.tsx:14|未確認（個別証跡はREVIEW.md参照）|
|component: RaidRescueLink|QA導線|§2/3/10/18/19|../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRescueLink.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" "読み込み中"|QA導線|§2/3/10/18/19|../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRescueLink.tsx:51|未確認（個別証跡はREVIEW.md参照）|
|component: RaidResultDetails|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/raid/RaidResultDetails.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: RaidRewardComparison|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/raid/RaidRewardComparison.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: RaidRewardItems|QA導線|§2/3/10/18/19|../../../domain/raidRoomDisplay;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/raid/RaidRewardItems.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: RaidRoomBrowser|QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "通信中"|QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:46|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:135|未確認（個別証跡はREVIEW.md参照）|
|state: div "tablist" "難易度"|QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:135|未確認（個別証跡はREVIEW.md参照）|
|state: OutlawButton "tab" {entry.label}|QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:136|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:152|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:160|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:172|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:180|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:194|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:197|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:198|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:199|未確認（個別証跡はREVIEW.md参照）|
|dialog: RaidRoomDialogs |QA導線|§12/18.13/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:202|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "敵情報"|QA導線|§12/18.13/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:208|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:210|未確認（個別証跡はREVIEW.md参照）|
|component: RaidRoomClearRewardPanel|到達未確定|§2/3/10/18/19|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomClearRewardPanel.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" "通信中"|到達未確定|§2/3/10/18/19|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomClearRewardPanel.tsx:51|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |到達未確定|§2/3/10/18/19|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomClearRewardPanel.tsx:52|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |到達未確定|§2/3/10/18/19|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomClearRewardPanel.tsx:53|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |到達未確定|§2/3/10/18/19|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomClearRewardPanel.tsx:55|未確認（個別証跡はREVIEW.md参照）|
|component: RaidRoomConnectedBrowser|到達未確定|§2/3/10/18/19|./RaidRoomClearRewardPanel;./RaidRoomRescueRewardPanel;./RaidRoomRescuePanel;../ui/OutlawButton;../../../domain/raidRoomDisplayClient|未照合（静的抽出）|src/app/components/raid/RaidRoomConnectedBrowser.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |到達未確定|§2/3/10/18/19|./RaidRoomClearRewardPanel;./RaidRoomRescueRewardPanel;./RaidRoomRescuePanel;../ui/OutlawButton;../../../domain/raidRoomDisplayClient|未照合（静的抽出）|src/app/components/raid/RaidRoomConnectedBrowser.tsx:110|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |到達未確定|§2/3/10/18/19|./RaidRoomClearRewardPanel;./RaidRoomRescueRewardPanel;./RaidRoomRescuePanel;../ui/OutlawButton;../../../domain/raidRoomDisplayClient|未照合（静的抽出）|src/app/components/raid/RaidRoomConnectedBrowser.tsx:110|未確認（個別証跡はREVIEW.md参照）|
|dialog: RaidRoomClearRewardPanel |到達未確定|§12/18.13/19|./RaidRoomClearRewardPanel;./RaidRoomRescueRewardPanel;./RaidRoomRescuePanel;../ui/OutlawButton;../../../domain/raidRoomDisplayClient|未照合（静的抽出）|src/app/components/raid/RaidRoomConnectedBrowser.tsx:112|未確認（個別証跡はREVIEW.md参照）|
|dialog: RaidRoomRescueRewardPanel |到達未確定|§12/18.13/19|./RaidRoomClearRewardPanel;./RaidRoomRescueRewardPanel;./RaidRoomRescuePanel;../ui/OutlawButton;../../../domain/raidRoomDisplayClient|未照合（静的抽出）|src/app/components/raid/RaidRoomConnectedBrowser.tsx:113|未確認（個別証跡はREVIEW.md参照）|
|dialog: RaidRoomRescuePanel |到達未確定|§12/18.13/19|./RaidRoomClearRewardPanel;./RaidRoomRescueRewardPanel;./RaidRoomRescuePanel;../ui/OutlawButton;../../../domain/raidRoomDisplayClient|未照合（静的抽出）|src/app/components/raid/RaidRoomConnectedBrowser.tsx:114|未確認（個別証跡はREVIEW.md参照）|
|component: RaidRoomDetail|QA導線|§2/3/10/18/19|@/domain/raidRoomDisplay;../ui/OutlawButton;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/raid/RaidRoomDetail.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "通信中"|QA導線|§2/3/10/18/19|@/domain/raidRoomDisplay;../ui/OutlawButton;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/raid/RaidRoomDetail.tsx:37|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |QA導線|§2/3/10/18/19|@/domain/raidRoomDisplay;../ui/OutlawButton;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/raid/RaidRoomDetail.tsx:85|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "救援"|QA導線|§12/18.13/19|@/domain/raidRoomDisplay;../ui/OutlawButton;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/raid/RaidRoomDetail.tsx:103|未確認（個別証跡はREVIEW.md参照）|
|component: RaidRoomDialogs|QA導線|§2/3/10/18/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {kind === 'participants' ? '参加者' : '報酬'}|QA導線|§12/18.13/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:63|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:66|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" "通信中"|QA導線|§2/3/10/18/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:67|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:69|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" "通信中"|QA導線|§2/3/10/18/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:81|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:83|未確認（個別証跡はREVIEW.md参照）|
|component: RaidRoomListCard|QA導線|§2/3/10/18/19|../ui/OutlawCard;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomListCard.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |QA導線|§2/3/10/18/19|../ui/OutlawCard;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomListCard.tsx:16|未確認（個別証跡はREVIEW.md参照）|
|component: RaidRoomRescuePanel|QA導線|§2/3/10/18/19|../ui/OutlawButton;../ui/OutlawCard|未照合（静的抽出）|src/app/components/raid/RaidRoomRescuePanel.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: RescuePanel |QA導線|§12/18.13/19|../ui/OutlawButton;../ui/OutlawCard|未照合（静的抽出）|src/app/components/raid/RaidRoomRescuePanel.tsx:11|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" "通信中"|QA導線|§2/3/10/18/19|../ui/OutlawButton;../ui/OutlawCard|未照合（静的抽出）|src/app/components/raid/RaidRoomRescuePanel.tsx:72|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |QA導線|§2/3/10/18/19|../ui/OutlawButton;../ui/OutlawCard|未照合（静的抽出）|src/app/components/raid/RaidRoomRescuePanel.tsx:85|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|../ui/OutlawButton;../ui/OutlawCard|未照合（静的抽出）|src/app/components/raid/RaidRoomRescuePanel.tsx:86|未確認（個別証跡はREVIEW.md参照）|
|component: RaidRoomRescueRewardPanel|到達未確定|§2/3/10/18/19|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomRescueRewardPanel.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" "通信中"|到達未確定|§2/3/10/18/19|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomRescueRewardPanel.tsx:46|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |到達未確定|§2/3/10/18/19|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomRescueRewardPanel.tsx:47|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |到達未確定|§2/3/10/18/19|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomRescueRewardPanel.tsx:48|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |到達未確定|§2/3/10/18/19|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomRescueRewardPanel.tsx:50|未確認（個別証跡はREVIEW.md参照）|
|component: RaidStrategySummary|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/raid/RaidStrategySummary.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: RaidTop|QA導線|§2/3/10/18/19|../ui/OutlawButton;../ui/OutlawCard;../ui/SectionHeader|未照合（静的抽出）|src/app/components/raid/RaidTop.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "通信中"|QA導線|§2/3/10/18/19|../ui/OutlawButton;../ui/OutlawCard;../ui/SectionHeader|未照合（静的抽出）|src/app/components/raid/RaidTop.tsx:24|未確認（個別証跡はREVIEW.md参照）|
|state: div {resource.status === "error" ? "alert" : "status"} |QA導線|§2/3/10/18/19|../ui/OutlawButton;../ui/OutlawCard;../ui/SectionHeader|未照合（静的抽出）|src/app/components/raid/RaidTop.tsx:57|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |QA導線|§2/3/10/18/19|../ui/OutlawButton;../ui/OutlawCard;../ui/SectionHeader|未照合（静的抽出）|src/app/components/raid/RaidTop.tsx:101|未確認（個別証跡はREVIEW.md参照）|
|component: RaidTopApproved|QA導線|§2/3/10/18/19|../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidTopApproved.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: RaidTab|到達未確定|§2/3/10/18/19|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "レイド情報を取得中"|到達未確定|§2/3/10/18/19|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:237|未確認（個別証跡はREVIEW.md参照）|
|state: div "tablist" "レイド対象"|到達未確定|§2/3/10/18/19|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:238|未確認（個別証跡はREVIEW.md参照）|
|state: button "tab" |到達未確定|§2/3/10/18/19|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:238|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "RPが不足しています"|到達未確定|§12/18.13/19|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:252|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {pendingRoomBriefingRef.current ? "チケットを使って挑戦しますか？" : "レイドチケットで回復しますか？"}|到達未確定|§12/18.13/19|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:253|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "RPの回復結果を確認してください"|到達未確定|§12/18.13/19|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:257|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "戦場を準備できませんでした"|到達未確定|§12/18.13/19|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:258|未確認（個別証跡はREVIEW.md参照）|
|component: MonthlyPowerRewardContent|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ranking/MonthlyPowerRewardContent.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ranking/MonthlyPowerRewardContent.tsx:31|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" "シーズン報酬を取得中"|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ranking/MonthlyPowerRewardContent.tsx:32|未確認（個別証跡はREVIEW.md参照）|
|component: RankingRewardDialog|到達未確定|§2/3/10/18/19|../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/ranking/RankingRewardDialog.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "ランキング報酬"|到達未確定|§12/18.13/19|../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/ranking/RankingRewardDialog.tsx:37|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" "報酬情報を取得中"|到達未確定|§2/3/10/18/19|../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/ranking/RankingRewardDialog.tsx:51|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |到達未確定|§2/3/10/18/19|../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/ranking/RankingRewardDialog.tsx:51|未確認（個別証跡はREVIEW.md参照）|
|component: RankingRewardNotificationController|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ranking/RankingRewardNotificationController.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: RankingTab|到達未確定|§2/3/10/18/19|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:414|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:429|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:439|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:440|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |到達未確定|§2/3/10/18/19|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:442|未確認（個別証跡はREVIEW.md参照）|
|dialog: RankingRewardDialog |到達未確定|§12/18.13/19|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:459|未確認（個別証跡はREVIEW.md参照）|
|component: BattleEffectLayer|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/redesign/battle-effects/BattleEffectLayer.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: BattleEffects|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/redesign/BattleEffects.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: BattleResourceDisplay|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/redesign/BattleResourceDisplay.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: BattleView|製品導線（静的import）|§2/3/10/18/19|./ElementBadge;../ui/CanonicalDialog;./BattleResourceDisplay;../ui/uiMotion;./BattleView.module.css|未照合（静的抽出）|src/app/components/redesign/BattleView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {confirmRetire ? 'リタイアしますか？' : '一時停止'}|製品導線（静的import）|§12/18.13/19|./ElementBadge;../ui/CanonicalDialog;./BattleResourceDisplay;../ui/uiMotion;./BattleView.module.css|未照合（静的抽出）|src/app/components/redesign/BattleView.tsx:204|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |製品導線（静的import）|§2/3/10/18/19|./ElementBadge;../ui/CanonicalDialog;./BattleResourceDisplay;../ui/uiMotion;./BattleView.module.css|未照合（静的抽出）|src/app/components/redesign/BattleView.tsx:210|未確認（個別証跡はREVIEW.md参照）|
|component: CommunityAuthenticationReminder|製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;../ui/dialogPresence|未照合（静的抽出）|src/app/components/redesign/CommunityAuthenticationReminder.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "ゲームデータを保護"|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;../ui/dialogPresence|未照合（静的抽出）|src/app/components/redesign/CommunityAuthenticationReminder.tsx:42|未確認（個別証跡はREVIEW.md参照）|
|component: CommunityIdentity|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/redesign/CommunityIdentity.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: CreativeCharacter|到達未確定|§2/3/10/18/19|../ui/presentationSettings|未照合（静的抽出）|src/app/components/redesign/CreativeCharacter.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: EarlyRetentionGuide|製品導線（静的import）|§2/3/10/18/19|../ui/GuideDialog|未照合（静的抽出）|src/app/components/redesign/EarlyRetentionGuide.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: GuideDialog {content.title}|製品導線（静的import）|§12/18.13/19|../ui/GuideDialog|未照合（静的抽出）|src/app/components/redesign/EarlyRetentionGuide.tsx:34|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/GuideDialog|未照合（静的抽出）|src/app/components/redesign/EarlyRetentionGuide.tsx:37|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/GuideDialog|未照合（静的抽出）|src/app/components/redesign/EarlyRetentionGuide.tsx:44|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/GuideDialog|未照合（静的抽出）|src/app/components/redesign/EarlyRetentionGuide.tsx:44|未確認（個別証跡はREVIEW.md参照）|
|component: ElementBadge|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/redesign/ElementBadge.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: FormalGachaView|製品導線（静的import）|§2/3/10/18/19|../gacha/GachaModalPortal;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/redesign/FormalGachaView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p {error ? "alert" : "status"} |製品導線（静的import）|§2/3/10/18/19|../gacha/GachaModalPortal;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/redesign/FormalGachaView.tsx:290|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../gacha/GachaModalPortal;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/redesign/FormalGachaView.tsx:296|未確認（個別証跡はREVIEW.md参照）|
|dialog: GachaModalPortal |製品導線（静的import）|§12/18.13/19|../gacha/GachaModalPortal;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/redesign/FormalGachaView.tsx:326|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "登用結果"|製品導線（静的import）|§12/18.13/19|../gacha/GachaModalPortal;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/redesign/FormalGachaView.tsx:326|未確認（個別証跡はREVIEW.md参照）|
|component: FormalLoginBonusModal|製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;../ui/Game04DataDisplay;../ui/CompactRewards|未照合（静的抽出）|src/app/components/redesign/FormalLoginBonusModal.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {`${detail}日目の報酬`}|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;../ui/Game04DataDisplay;../ui/CompactRewards|未照合（静的抽出）|src/app/components/redesign/FormalLoginBonusModal.tsx:15|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "ログインボーナス"|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;../ui/Game04DataDisplay;../ui/CompactRewards|未照合（静的抽出）|src/app/components/redesign/FormalLoginBonusModal.tsx:16|未確認（個別証跡はREVIEW.md参照）|
|component: GrowthControls|製品導線（静的import）|§2/3/10/18/19|./ElementBadge;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|./ElementBadge;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:40|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|./ElementBadge;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:40|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|./ElementBadge;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:59|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|./ElementBadge;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:59|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|./ElementBadge;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:59|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|./ElementBadge;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:59|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|./ElementBadge;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:60|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "育成アイテム"|製品導線（静的import）|§12/18.13/19|./ElementBadge;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:77|未確認（個別証跡はREVIEW.md参照）|
|component: GrowthView|製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CentralModal {title}|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:38|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:39|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:89|未確認（個別証跡はREVIEW.md参照）|
|dialog: CentralModal "読み込み中"|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:89|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal {result.title}|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:90|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "操作を確認してください"|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:90|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:90|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:96|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:97|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "魂から解放"|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:100|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal {master.name}|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:103|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "Lv育成"|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:104|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal {growthMode==='exchange'?'魂交換':'覚醒'}|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:105|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "全身鑑賞"|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:106|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal {assign.kind==='skill'?'スキルを変更':'装備を変更'}|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:107|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:109|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:111|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:112|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:113|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal {detailSkill.name}|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:116|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:116|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal {detailEquip.name}|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:117|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:117|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "装備Lv育成"|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:118|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "装備を分解"|製品導線（静的import）|§12/18.13/19|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:119|未確認（個別証跡はREVIEW.md参照）|
|component: HomeEffect|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/redesign/HomeEffect.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: HomeView|製品導線（静的import）|§2/3/10/18/19|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "活動を読み込み中"|製品導線（静的import）|§2/3/10/18/19|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:118|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:118|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |製品導線（静的import）|§2/3/10/18/19|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:135|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "表示切替"|製品導線（静的import）|§12/18.13/19|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:154|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |製品導線（静的import）|§2/3/10/18/19|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:155|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:158|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "プロフィール"|製品導線（静的import）|§12/18.13/19|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:160|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "コミュニティ"|製品導線（静的import）|§12/18.13/19|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:163|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:163|未確認（個別証跡はREVIEW.md参照）|
|component: IntegratedStart|製品導線（静的import）|§2/3/10/18/19|../ui/BrandedLoading|未照合（静的抽出）|src/app/components/redesign/IntegratedStart.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/BrandedLoading|未照合（静的抽出）|src/app/components/redesign/IntegratedStart.tsx:11|未確認（個別証跡はREVIEW.md参照）|
|component: IntegratedTutorial|製品導線（静的import）|§2/3/10/18/19|./BattleView;../ui/AssetChoice;./visual-bench/CharacterDisplays;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/IntegratedTutorial.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|./BattleView;../ui/AssetChoice;./visual-bench/CharacterDisplays;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/IntegratedTutorial.tsx:59|未確認（個別証跡はREVIEW.md参照）|
|component: InventoryView|製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/InventoryView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/InventoryView.tsx:37|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/InventoryView.tsx:37|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/InventoryView.tsx:37|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {item.name}|製品導線（静的import）|§12/18.13/19|../ui/ListControls;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/InventoryView.tsx:41|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/ListControls;../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/InventoryView.tsx:42|未確認（個別証跡はREVIEW.md参照）|
|component: MissionContent|製品導線（静的import）|§2/3/10/18/19|../ui/Game04DataDisplay;./Modal|未照合（静的抽出）|src/app/components/redesign/MissionContent.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/Game04DataDisplay;./Modal|未照合（静的抽出）|src/app/components/redesign/MissionContent.tsx:29|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/Game04DataDisplay;./Modal|未照合（静的抽出）|src/app/components/redesign/MissionContent.tsx:29|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "任務"|製品導線（静的import）|§12/18.13/19|../ui/Game04DataDisplay;./Modal|未照合（静的抽出）|src/app/components/redesign/MissionContent.tsx:32|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal {detail.rewards?'任務の報酬':'任務の条件'}|製品導線（静的import）|§12/18.13/19|../ui/Game04DataDisplay;./Modal|未照合（静的抽出）|src/app/components/redesign/MissionContent.tsx:33|未確認（個別証跡はREVIEW.md参照）|
|component: Modal|製品導線（静的import）|§2/3/10/18/19|../ui/dialogPresence|未照合（静的抽出）|src/app/components/redesign/Modal.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: NormalGachaView|到達未確定|§2/3/10/18/19|./Modal|未照合（静的抽出）|src/app/components/redesign/NormalGachaView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |到達未確定|§2/3/10/18/19|./Modal|未照合（静的抽出）|src/app/components/redesign/NormalGachaView.tsx:32|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "通常登用の確認"|到達未確定|§12/18.13/19|./Modal|未照合（静的抽出）|src/app/components/redesign/NormalGachaView.tsx:34|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |到達未確定|§2/3/10/18/19|./Modal|未照合（静的抽出）|src/app/components/redesign/NormalGachaView.tsx:34|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "登用結果"|到達未確定|§12/18.13/19|./Modal|未照合（静的抽出）|src/app/components/redesign/NormalGachaView.tsx:35|未確認（個別証跡はREVIEW.md参照）|
|component: PageTitleBanner|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/redesign/PageTitleBanner.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: PassiveDisplay|製品導線（静的import）|§2/3/10/18/19|../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/PassiveDisplay.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: PreparationModal|製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "出撃準備"|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:32|未確認（個別証跡はREVIEW.md参照）|
|state: p {assets.failed ? "alert" : "status"} |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:36|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:43|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:44|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:45|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {detail.name}|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:47|未確認（個別証跡はREVIEW.md参照）|
|component: QuestView|製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p {viewAssets.failed ? "alert" : "status"} |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:130|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:141|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {`${selectedLabel} ${formalStageName(selected) ?? selected.name}`}|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:154|未確認（個別証跡はREVIEW.md参照）|
|state: p {encounterAssets.failed ? "alert" : "status"} |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:155|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {detailPanel === 'hint' ? '攻略のヒント' : '報酬を確認'}|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:160|未確認（個別証跡はREVIEW.md参照）|
|dialog: PreparationModal {`${selectedLabel} ${formalStageName(selected) ?? ''}`.trim()}|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:163|未確認（個別証跡はREVIEW.md参照）|
|component: RaidView|製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:57|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "終了した共闘・未受取報酬"|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:68|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "敵情報"|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:69|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "参加者"|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:70|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "報酬"|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:71|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:72|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "救援依頼"|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:81|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:81|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "共闘から退出"|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:82|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:82|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "挑戦する段階"|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:83|未確認（個別証跡はREVIEW.md参照）|
|dialog: PreparationModal {`${raidDisplayTitle(master)} · ${raidEnemy(master,battleLevel??room.level).name} Lv.${raidEnemy(master,battleLevel??room.level).level} · ${raidElementLabels[raidEnemy(master,battleLevel??room.level).element]}属性`}|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:84|未確認（個別証跡はREVIEW.md参照）|
|component: RecordedBattleResult|製品導線（静的import）|§2/3/10/18/19|../ui/Game04DataDisplay;../ui/uiMotion|未照合（静的抽出）|src/app/components/redesign/RecordedBattleResult.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: RedesignApp|製品導線（静的import）|§2/3/10/18/19|./RedesignShell;./GrowthView;./InventoryView;../ui/GuideDialog;./QuestView;./RaidView;./TerritoryView;./BattleView;./FormalGachaView;../ui/BrandedLoading;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignApp.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|./RedesignShell;./GrowthView;./InventoryView;../ui/GuideDialog;./QuestView;./RaidView;./TerritoryView;./BattleView;./FormalGachaView;../ui/BrandedLoading;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignApp.tsx:254|未確認（個別証跡はREVIEW.md参照）|
|dialog: GuideDialog "戦支度"|製品導線（静的import）|§12/18.13/19|./RedesignShell;./GrowthView;./InventoryView;../ui/GuideDialog;./QuestView;./RaidView;./TerritoryView;./BattleView;./FormalGachaView;../ui/BrandedLoading;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignApp.tsx:262|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "編成・装備"|製品導線（静的import）|§12/18.13/19|./RedesignShell;./GrowthView;./InventoryView;../ui/GuideDialog;./QuestView;./RaidView;./TerritoryView;./BattleView;./FormalGachaView;../ui/BrandedLoading;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignApp.tsx:264|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|./RedesignShell;./GrowthView;./InventoryView;../ui/GuideDialog;./QuestView;./RaidView;./TerritoryView;./BattleView;./FormalGachaView;../ui/BrandedLoading;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignApp.tsx:265|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|./RedesignShell;./GrowthView;./InventoryView;../ui/GuideDialog;./QuestView;./RaidView;./TerritoryView;./BattleView;./FormalGachaView;../ui/BrandedLoading;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignApp.tsx:266|未確認（個別証跡はREVIEW.md参照）|
|component: RedesignBillingReturn|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/redesign/RedesignBillingReturn.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: BillingStatusDialog |製品導線（静的import）|§12/18.13/19||未照合（静的抽出）|src/app/components/redesign/RedesignBillingReturn.tsx:29|未確認（個別証跡はREVIEW.md参照）|
|component: RedesignCommerceOverlays|製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: FormalLoginBonusModal |製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:79|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "ガチャ演出を準備中"|製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:86|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "ガチャ結果を表示中"|製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:107|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "ガチャ抽選結果を同期中"|製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:112|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "エラー"|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:188|未確認（個別証跡はREVIEW.md参照）|
|dialog: ConfirmDialog |製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:194|未確認（個別証跡はREVIEW.md参照）|
|component: RedesignShell|製品導線（静的import）|§2/3/10/18/19|../InboxPanel;../SettingsPanel;./HomeView;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignShell.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "メニュー"|製品導線（静的import）|§12/18.13/19|../InboxPanel;../SettingsPanel;./HomeView;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignShell.tsx:72|未確認（個別証跡はREVIEW.md参照）|
|dialog: InboxPanel |製品導線（静的import）|§12/18.13/19|../InboxPanel;../SettingsPanel;./HomeView;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignShell.tsx:73|未確認（個別証跡はREVIEW.md参照）|
|dialog: SettingsPanel |製品導線（静的import）|§12/18.13/19|../InboxPanel;../SettingsPanel;./HomeView;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignShell.tsx:75|未確認（個別証跡はREVIEW.md参照）|
|component: TerritoryView|製品導線（静的import）|§2/3/10/18/19|../ui/Game04DataDisplay;../ui/ActionButton;./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" |製品導線（静的import）|§2/3/10/18/19|../ui/Game04DataDisplay;../ui/ActionButton;./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:29|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/Game04DataDisplay;../ui/ActionButton;./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:109|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|../ui/Game04DataDisplay;../ui/ActionButton;./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:112|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal {`${destination.itemName}の入手方法`}|製品導線（静的import）|§12/18.13/19|../ui/Game04DataDisplay;../ui/ActionButton;./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:141|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "侵攻確認"|製品導線（静的import）|§12/18.13/19|../ui/Game04DataDisplay;../ui/ActionButton;./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:142|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|../ui/Game04DataDisplay;../ui/ActionButton;./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:147|未確認（個別証跡はREVIEW.md参照）|
|component: TypewriterText|製品導線（静的import）|§2/3/10/18/19|../ui/uiMotion|未照合（静的抽出）|src/app/components/redesign/TypewriterText.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: CharacterDisplays|製品導線（静的import）|§2/3/10/18/19|./CharacterDisplays.module.css|未照合（静的抽出）|src/app/components/redesign/visual-bench/CharacterDisplays.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div {error?'alert':'status'} |製品導線（静的import）|§2/3/10/18/19|./CharacterDisplays.module.css|未照合（静的抽出）|src/app/components/redesign/visual-bench/CharacterDisplays.tsx:119|未確認（個別証跡はREVIEW.md参照）|
|component: CowboyDisplay|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/redesign/visual-bench/CowboyDisplay.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: SettingsPanel|製品導線（静的import）|§2/3/10/18/19|./ui/FullScreenPanel;./ui/OutlawButton;./ui/EditableSettingSection|未照合（静的抽出）|src/app/components/SettingsPanel.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: FullScreenPanel "設定 / プロフィール"|製品導線（静的import）|§12/18.13/19|./ui/FullScreenPanel;./ui/OutlawButton;./ui/EditableSettingSection|未照合（静的抽出）|src/app/components/SettingsPanel.tsx:108|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |製品導線（静的import）|§2/3/10/18/19|./ui/FullScreenPanel;./ui/OutlawButton;./ui/EditableSettingSection|未照合（静的抽出）|src/app/components/SettingsPanel.tsx:111|未確認（個別証跡はREVIEW.md参照）|
|component: SetupView|QA導線|§2/3/10/18/19|./ui/OutlawButton|未照合（静的抽出）|src/app/components/SetupView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |QA導線|§2/3/10/18/19|./ui/OutlawButton|未照合（静的抽出）|src/app/components/SetupView.tsx:159|未確認（個別証跡はREVIEW.md参照）|
|state: div "alertdialog" |QA導線|§2/3/10/18/19|./ui/OutlawButton|未照合（静的抽出）|src/app/components/SetupView.tsx:206|未確認（個別証跡はREVIEW.md参照）|
|component: ShopExchangePanel|製品導線（静的import）|§2/3/10/18/19|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "活力丸を使用"|製品導線（静的import）|§12/18.13/19|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:60|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |製品導線（静的import）|§2/3/10/18/19|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:67|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:68|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {`${labels[selected]}を交換`}|製品導線（静的import）|§12/18.13/19|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:72|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:74|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {usedMedicine ? "回復完了" : "交換完了"}|製品導線（静的import）|§12/18.13/19|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:76|未確認（個別証跡はREVIEW.md参照）|
|component: ShopTab|製品導線（静的import）|§2/3/10/18/19|./ui/SubTabNav;./ui/ProductRow;./ui/CanonicalItemIcon;./ui/Game04DataDisplay;./ui/OutlawButton;./ShopExchangePanel|未照合（静的抽出）|src/app/components/ShopTab.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |製品導線（静的import）|§2/3/10/18/19|./ui/SubTabNav;./ui/ProductRow;./ui/CanonicalItemIcon;./ui/Game04DataDisplay;./ui/OutlawButton;./ShopExchangePanel|未照合（静的抽出）|src/app/components/ShopTab.tsx:154|未確認（個別証跡はREVIEW.md参照）|
|dialog: ShopExchangePanel |製品導線（静的import）|§12/18.13/19|./ui/SubTabNav;./ui/ProductRow;./ui/CanonicalItemIcon;./ui/Game04DataDisplay;./ui/OutlawButton;./ShopExchangePanel|未照合（静的抽出）|src/app/components/ShopTab.tsx:162|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |製品導線（静的import）|§2/3/10/18/19|./ui/SubTabNav;./ui/ProductRow;./ui/CanonicalItemIcon;./ui/Game04DataDisplay;./ui/OutlawButton;./ShopExchangePanel|未照合（静的抽出）|src/app/components/ShopTab.tsx:171|未確認（個別証跡はREVIEW.md参照）|
|component: SkillPresentation|製品導線（静的import）|§2/3/10/18/19|../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/skill/SkillPresentation.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "スキル詳細"|製品導線（静的import）|§12/18.13/19|../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/skill/SkillPresentation.tsx:40|未確認（個別証跡はREVIEW.md参照）|
|component: SpecialGachaOffer|QA導線|§2/3/10/18/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:38|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "登用情報を確認中"|QA導線|§2/3/10/18/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:39|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {SPECIAL_GACHA_COPY[selected.id].title}|QA導線|§12/18.13/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:60|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {`${SPECIAL_GACHA_COPY[rates.id].title} 提供割合`}|QA導線|§12/18.13/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:74|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {`${SPECIAL_GACHA_COPY[exchangeOpen.id].title} SSR交換`}|QA導線|§12/18.13/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:77|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "交換完了"|QA導線|§12/18.13/19|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:81|未確認（個別証跡はREVIEW.md参照）|
|component: TitleLegalFooter|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/TitleLegalFooter.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: TitleView|製品導線（静的import）|§2/3/10/18/19|./ui/BrandedLoading;./ui/ConfirmDialog|未照合（静的抽出）|src/app/components/TitleView.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: small "status" |製品導線（静的import）|§2/3/10/18/19|./ui/BrandedLoading;./ui/ConfirmDialog|未照合（静的抽出）|src/app/components/TitleView.tsx:100|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |製品導線（静的import）|§2/3/10/18/19|./ui/BrandedLoading;./ui/ConfirmDialog|未照合（静的抽出）|src/app/components/TitleView.tsx:101|未確認（個別証跡はREVIEW.md参照）|
|dialog: ConfirmDialog |製品導線（静的import）|§12/18.13/19|./ui/BrandedLoading;./ui/ConfirmDialog|未照合（静的抽出）|src/app/components/TitleView.tsx:107|未確認（個別証跡はREVIEW.md参照）|
|component: TribeChatModal|到達未確定|§2/3/10/18/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/TribeChatModal.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: FullScreenPanel {chatChannel === "GUILD" ? `${userGuild?.name \|\| "同盟"} チャット` : "チャット"}|到達未確定|§12/18.13/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/TribeChatModal.tsx:148|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" |到達未確定|§2/3/10/18/19|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/TribeChatModal.tsx:345|未確認（個別証跡はREVIEW.md参照）|
|component: TypewriterText|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/tutorial/TypewriterText.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: TutorialAuthentication|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/TutorialAuthentication.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/TutorialAuthentication.tsx:536|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/TutorialAuthentication.tsx:577|未確認（個別証跡はREVIEW.md参照）|
|component: TutorialBattlePrompt|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/TutorialBattlePrompt.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/TutorialBattlePrompt.tsx:76|未確認（個別証跡はREVIEW.md参照）|
|component: TutorialFreeInstant|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/TutorialFreeInstant.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: TutorialNavigator|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/TutorialNavigator.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: TutorialRuleGuide|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/TutorialRuleGuide.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/TutorialRuleGuide.tsx:88|未確認（個別証跡はREVIEW.md参照）|
|component: TutorialWorldIntro|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/TutorialWorldIntro.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: ActionButton|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/ActionButton.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: AssetChoice|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/AssetChoice.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: Badge|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/Badge.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: BrandedLoading|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/BrandedLoading.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: CanonicalDialog|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/CanonicalDialog.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: CanonicalItemIcon|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/CanonicalItemIcon.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: CompactRewards|製品導線（静的import）|§2/3/10/18/19|./Game04DataDisplay|未照合（静的抽出）|src/app/components/ui/CompactRewards.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: ConfirmDialog|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/ConfirmDialog.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {title}|製品導線（静的import）|§12/18.13/19||未照合（静的抽出）|src/app/components/ui/ConfirmDialog.tsx:98|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/ConfirmDialog.tsx:110|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/ConfirmDialog.tsx:124|未確認（個別証跡はREVIEW.md参照）|
|component: EditableSettingSection|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/EditableSettingSection.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: FullScreenPanel|製品導線（静的import）|§2/3/10/18/19|./ModalShell|未照合（静的抽出）|src/app/components/ui/FullScreenPanel.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: ModalShell {title}|製品導線（静的import）|§12/18.13/19|./ModalShell|未照合（静的抽出）|src/app/components/ui/FullScreenPanel.tsx:31|未確認（個別証跡はREVIEW.md参照）|
|component: Game04DataDisplay|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/Game04DataDisplay.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: Game04Loading|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/Game04Loading.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" {label}|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/Game04Loading.tsx:10|未確認（個別証跡はREVIEW.md参照）|
|component: GlobalInteractionBlocker|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/GlobalInteractionBlocker.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "処理中"|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/GlobalInteractionBlocker.tsx:23|未確認（個別証跡はREVIEW.md参照）|
|component: GuideDialog|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/GuideDialog.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {title}|製品導線（静的import）|§12/18.13/19||未照合（静的抽出）|src/app/components/ui/GuideDialog.tsx:25|未確認（個別証跡はREVIEW.md参照）|
|component: HeroPanel|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/HeroPanel.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: HubPage|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/HubPage.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: ListControls|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/ListControls.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: span "status" |製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/ListControls.tsx:9|未確認（個別証跡はREVIEW.md参照）|
|component: ListRow|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/ListRow.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: LoadingSpinner|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/LoadingSpinner.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: ModalShell|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/ModalShell.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: OutlawButton|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/OutlawButton.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: OutlawCard|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/OutlawCard.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: PageHeader|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/PageHeader.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: PageShell|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/PageShell.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: PeriodStatus|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/PeriodStatus.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: ProductRow|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/ProductRow.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: RarityFrame|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/RarityFrame.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: ResourceDisplay|到達未確定|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/ResourceDisplay.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: RewardReceipt|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/RewardReceipt.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: ScreenReadinessBoundary|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/ScreenReadinessBoundary.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: ScreenState|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/ScreenState.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: section {kind === "error" \|\| kind === "forbidden" ? "alert" : "status"} |QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/ScreenState.tsx:43|未確認（個別証跡はREVIEW.md参照）|
|component: SectionHeader|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/SectionHeader.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|component: SubTabNav|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/components/ui/SubTabNav.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /legal/age-rating|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/legal/age-rating/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /legal/commercial|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/legal/commercial/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /legal/contact|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/legal/contact/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /legal/cookies|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/legal/cookies/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /legal/payments|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/legal/payments/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /legal/privacy|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/legal/privacy/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /legal/rights|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/legal/rights/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /legal/terms|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/legal/terms/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /legal/tokusho|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/legal/tokusho/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /open|製品導線（静的import）|§2/3/10/18/19||未照合（静的抽出）|src/app/open/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /|製品導線（静的import）|§2/3/10/18/19|./components/TitleView;./components/AuthView;./components/ui/BrandedLoading|未照合（静的抽出）|src/app/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |製品導線（静的import）|§2/3/10/18/19|./components/TitleView;./components/AuthView;./components/ui/BrandedLoading|未照合（静的抽出）|src/app/page.tsx:25|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/audio|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/audio/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/b03-integration|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/b03-integration/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/b03-result|QA導線|§2/3/10/18/19|@/app/components/redesign/QuestView|未照合（静的抽出）|src/app/qa/b03-result/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/b07|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/b07/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: FormalLoginBonusModal |QA導線|§12/18.13/19|@/app/components/redesign/FormalLoginBonusModal;@/app/components/redesign/RedesignShell|未照合（静的抽出）|src/app/qa/b07/Samples.tsx:28|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "任務"|QA導線|§12/18.13/19|@/app/components/redesign/Modal;@/app/components/redesign/BattleView;@/app/components/redesign/BattleResourceDisplay|未照合（静的抽出）|src/app/qa/b08-local/Harness.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/b08-local|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/b08-local/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/b09-local|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/b09-local/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/b10-local|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/b10-local/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: PreparationModal "B13 出撃準備"|QA導線|§12/18.13/19|@/app/components/redesign/GrowthView;@/app/components/redesign/RedesignShell;@/app/components/redesign/RaidView;@/app/components/redesign/PreparationModal|未照合（静的抽出）|src/app/qa/b13-local/Harness.tsx:39|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/b13-local|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/b13-local/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/b13-missions|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/b13-missions/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/b14-local|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/b14-local/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: FormalLoginBonusModal |QA導線|§12/18.13/19|@/app/components/redesign/RedesignShell;@/app/components/redesign/TerritoryView;@/app/components/redesign/GrowthView;@/app/components/redesign/FormalLoginBonusModal|未照合（静的抽出）|src/app/qa/b14-ui/Harness.tsx:21|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/b14-ui|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/b14-ui/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/battle-additions|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/battle-additions/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/battle-common|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/battle-common/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/battle-effects16|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/battle-effects16/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/battle-flow-v3/BattleFlowMock.tsx:84|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/battle-flow-v3/BattleFlowMock.tsx:87|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/battle-flow-v3|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/battle-flow-v3/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/battle-full-skill-load|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/battle-full-skill-load/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/battle-live|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/battle-live/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/battle-presentation-v3|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/battle-presentation-v3/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/common-ui|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/common-ui/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: GuideDialog "次の戦へ"|QA導線|§12/18.13/19|@/app/components/ui/CanonicalDialog;@/app/components/ui/GuideDialog;@/app/components/ui/Game04DataDisplay;@/app/components/ui/Game04Loading|未照合（静的抽出）|src/app/qa/common-ui/Samples.tsx:12|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "出陣の準備"|QA導線|§12/18.13/19|@/app/components/ui/CanonicalDialog;@/app/components/ui/GuideDialog;@/app/components/ui/Game04DataDisplay;@/app/components/ui/Game04Loading|未照合（静的抽出）|src/app/qa/common-ui/Samples.tsx:13|未確認（個別証跡はREVIEW.md参照）|
|dialog: ShopExchangePanel |QA導線|§12/18.13/19|@/app/components/redesign/RedesignShell;@/app/components/redesign/GrowthView;@/app/components/ShopExchangePanel;@/app/components/ui/ActionButton;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/ui/AssetChoice;@/app/components/ui/ScreenState;@/app/components/redesign/ElementBadge|未照合（静的抽出）|src/app/qa/common-ui-audit/Harness.tsx:19|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "長い説明・多数件"|QA導線|§12/18.13/19|@/app/components/redesign/RedesignShell;@/app/components/redesign/GrowthView;@/app/components/ShopExchangePanel;@/app/components/ui/ActionButton;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/ui/AssetChoice;@/app/components/ui/ScreenState;@/app/components/redesign/ElementBadge|未照合（静的抽出）|src/app/qa/common-ui-audit/Harness.tsx:20|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/common-ui-audit|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/common-ui-audit/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/community|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/community/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/device-debug|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/device-debug/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/g3-gacha|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/g3-gacha/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/home-live-viewport|QA導線|§2/3/10/18/19|./TimingViewport|未照合（静的抽出）|src/app/qa/home-live-viewport/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/home-state|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/home-state/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/identity|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/identity/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/invasion-approved|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/invasion-approved/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/presentation|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/presentation/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |QA導線|§2/3/10/18/19|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:128|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" "キャラクター登場演出中"|QA導線|§2/3/10/18/19|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:128|未確認（個別証跡はREVIEW.md参照）|
|state: div "alertdialog" |QA導線|§2/3/10/18/19|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:135|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |QA導線|§2/3/10/18/19|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:141|未確認（個別証跡はREVIEW.md参照）|
|dialog: SkillDetailDialog |QA導線|§12/18.13/19|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:186|未確認（個別証跡はREVIEW.md参照）|
|dialog: CommonModals |QA導線|§12/18.13/19|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:331|未確認（個別証跡はREVIEW.md参照）|
|dialog: CommonModals |QA導線|§12/18.13/19|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:367|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |QA導線|§2/3/10/18/19|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:367|未確認（個別証跡はREVIEW.md参照）|
|dialog: CommonModals |QA導線|§12/18.13/19|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:397|未確認（個別証跡はREVIEW.md参照）|
|dialog: MoveBaseModal |QA導線|§12/18.13/19|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:559|未確認（個別証跡はREVIEW.md参照）|
|dialog: PrepMissionEventDialogController |QA導線|§12/18.13/19|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:560|未確認（個別証跡はREVIEW.md参照）|
|state: div "status" |QA導線|§2/3/10/18/19|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:616|未確認（個別証跡はREVIEW.md参照）|
|state: p "alert" |QA導線|§2/3/10/18/19|@/app/components/redesign/RedesignShell;@/app/components/redesign/InventoryView;@/app/components/ui/CanonicalDialog;@/app/components/ui/ConfirmDialog|未照合（静的抽出）|src/app/qa/profile-inventory/Harness.tsx:24|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {confirm.title}|QA導線|§12/18.13/19|@/app/components/redesign/RedesignShell;@/app/components/redesign/InventoryView;@/app/components/ui/CanonicalDialog;@/app/components/ui/ConfirmDialog|未照合（静的抽出）|src/app/qa/profile-inventory/Harness.tsx:24|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/profile-inventory|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/profile-inventory/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/quest-live-viewport|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/quest-live-viewport/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/quest65|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/quest65/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/raid-approved|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/raid-approved/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/raid-detail|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/raid-detail/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: RaidRoomDialogs |到達未確定|§12/18.13/19|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/raid/RaidRoomClearRewardPanel;@/app/components/raid/RaidRoomRescueRewardPanel|未照合（静的抽出）|src/app/qa/raid-detail/RaidDetailHarness.tsx:31|未確認（個別証跡はREVIEW.md参照）|
|dialog: RaidRoomClearRewardPanel |到達未確定|§12/18.13/19|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/raid/RaidRoomClearRewardPanel;@/app/components/raid/RaidRoomRescueRewardPanel|未照合（静的抽出）|src/app/qa/raid-detail/RaidDetailHarness.tsx:31|未確認（個別証跡はREVIEW.md参照）|
|dialog: RaidRoomRescueRewardPanel |到達未確定|§12/18.13/19|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/raid/RaidRoomClearRewardPanel;@/app/components/raid/RaidRoomRescueRewardPanel|未照合（静的抽出）|src/app/qa/raid-detail/RaidDetailHarness.tsx:31|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "導線確認（Mock）"|到達未確定|§12/18.13/19|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/raid/RaidRoomClearRewardPanel;@/app/components/raid/RaidRoomRescueRewardPanel|未照合（静的抽出）|src/app/qa/raid-detail/RaidDetailHarness.tsx:33|未確認（個別証跡はREVIEW.md参照）|
|dialog: RaidRoomClearRewardPanel |到達未確定|§12/18.13/19|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/raid/RaidRoomClearRewardPanel;@/app/components/raid/RaidRoomRescueRewardPanel|未照合（静的抽出）|src/app/qa/raid-detail/RaidDetailHarness.tsx:44|未確認（個別証跡はREVIEW.md参照）|
|dialog: RaidRoomRescueRewardPanel |到達未確定|§12/18.13/19|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/raid/RaidRoomClearRewardPanel;@/app/components/raid/RaidRoomRescueRewardPanel|未照合（静的抽出）|src/app/qa/raid-detail/RaidDetailHarness.tsx:44|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/raid-integrated|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/raid-integrated/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |QA導線|§2/3/10/18/19|@/app/components/redesign/RedesignShell;@/app/components/redesign/RaidView;@/app/components/redesign/BattleView|未照合（静的抽出）|src/app/qa/raid-integrated/RaidIntegratedPreview.tsx:36|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/raid-live-viewport|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/raid-live-viewport/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: RaidRoomRescuePanel |QA導線|§12/18.13/19|@/app/components/raid/RaidRoomRescuePanel|未照合（静的抽出）|src/app/qa/raid-pages/IntegratedPages.tsx:37|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/raid-pages|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/raid-pages/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: RaidRoomRescuePanel |QA導線|§12/18.13/19|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/raid/RaidRoomRescuePanel|未照合（静的抽出）|src/app/qa/raid-pages/RaidPagesHarness.tsx:73|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/raid-room|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/raid-room/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "戦闘への受け渡し確認"|QA導線|§12/18.13/19|@/app/components/ui/GlobalInteractionBlocker;@/app/components/ui/CanonicalDialog|未照合（静的抽出）|src/app/qa/raid-room/RaidRoomHarness.tsx:24|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/raid-top|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/raid-top/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog "導線確認（Mock）"|到達未確定|§12/18.13/19|@/app/components/ui/HubPage;@/app/components/ui/CanonicalDialog;@/app/components/ui/OutlawButton|未照合（静的抽出）|src/app/qa/raid-top/RaidTopHarness.tsx:25|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/recovery-live|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/recovery-live/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/redesign|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/redesign/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/shop-ui|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/shop-ui/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: InboxPanel |QA導線|§12/18.13/19|@/app/components/InboxPanel;@/app/components/ui/CanonicalDialog|未照合（静的抽出）|src/app/qa/shop-ui/ShopUiHarness.tsx:66|未確認（個別証跡はREVIEW.md参照）|
|dialog: CanonicalDialog {dialog.title}|QA導線|§12/18.13/19|@/app/components/InboxPanel;@/app/components/ui/CanonicalDialog|未照合（静的抽出）|src/app/qa/shop-ui/ShopUiHarness.tsx:67|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/tutorial|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/tutorial/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal {title}|QA導線|§12/18.13/19|@/app/components/redesign/BattleView;@/app/components/redesign/HomeView;@/app/components/redesign/QuestView;@/app/components/redesign/GrowthView;@/app/components/redesign/Modal|未照合（静的抽出）|src/app/qa/tutorial/TutorialPreview.tsx:32|未確認（個別証跡はREVIEW.md参照）|
|state: p "status" |QA導線|§2/3/10/18/19|@/app/components/redesign/BattleView;@/app/components/redesign/HomeView;@/app/components/redesign/QuestView;@/app/components/redesign/GrowthView;@/app/components/redesign/Modal|未照合（静的抽出）|src/app/qa/tutorial/TutorialPreview.tsx:132|未確認（個別証跡はREVIEW.md参照）|
|dialog: Modal "任務"|QA導線|§12/18.13/19|@/app/components/redesign/BattleView;@/app/components/redesign/HomeView;@/app/components/redesign/QuestView;@/app/components/redesign/GrowthView;@/app/components/redesign/Modal|未照合（静的抽出）|src/app/qa/tutorial/TutorialPreview.tsx:169|未確認（個別証跡はREVIEW.md参照）|
|state: div "alert" |製品導線（静的import）|§2/3/10/18/19|@/app/components/ui/BrandedLoading|未照合（静的抽出）|src/app/qa/tutorial/TutorialSceneAssets.tsx:27|未確認（個別証跡はREVIEW.md参照）|
|route: /qa/visual-parts|QA導線|§2/3/10/18/19||未照合（静的抽出）|src/app/qa/visual-parts/page.tsx:1|未確認（個別証跡はREVIEW.md参照）|
