# 全画面・状態の静的棚卸し

自動抽出したルート、部品、Dialog/Panel呼出し、状態表示。製品経路・QA・管理・旧未到達部品を含む母集団。動的な全状態の網羅や目視合格を意味しない。到達性・承認見本との照合は別途記録する。

|画面／状態|適用ルール|使用部品|問題|修正先|確認結果|
|---|---|---|---|---|---|
|route: /admin/kpi/day/[date]|§2/3/10/18||未照合（静的抽出）|src/app/admin/kpi/day/[date]/page.tsx:1|未確認|
|state: p "status" |§2/3/10/18||未照合（静的抽出）|src/app/admin/kpi/game04/Game04GameplayKpi.tsx:29|未確認|
|state: p "alert" |§2/3/10/18||未照合（静的抽出）|src/app/admin/kpi/game04/Game04GameplayKpi.tsx:29|未確認|
|route: /admin/kpi/game04|§2/3/10/18||未照合（静的抽出）|src/app/admin/kpi/game04/page.tsx:1|未確認|
|state: div "alert" |§2/3/10/18||未照合（静的抽出）|src/app/admin/kpi/KpiDailyOverview.tsx:40|未確認|
|state: div "status" |§2/3/10/18||未照合（静的抽出）|src/app/admin/kpi/KpiDashboard.tsx:118|未確認|
|state: div "alert" |§2/3/10/18||未照合（静的抽出）|src/app/admin/kpi/KpiDashboardV2.tsx:102|未確認|
|route: /admin/kpi|§2/3/10/18|./KpiDashboardShell|未照合（静的抽出）|src/app/admin/kpi/page.tsx:1|未確認|
|route: /auth/callback|§2/3/10/18||未照合（静的抽出）|src/app/auth/callback/page.tsx:1|未確認|
|state: div "alertdialog" |§2/3/10/18||未照合（静的抽出）|src/app/auth/callback/page.tsx:390|未確認|
|state: div "alert" |§2/3/10/18||未照合（静的抽出）|src/app/auth/callback/page.tsx:396|未確認|
|state: div "alertdialog" |§2/3/10/18||未照合（静的抽出）|src/app/auth/callback/page.tsx:402|未確認|
|route: /auth/game04/callback|§2/3/10/18||未照合（静的抽出）|src/app/auth/game04/callback/page.tsx:1|未確認|
|state: p "status" |§2/3/10/18||未照合（静的抽出）|src/app/auth/game04/callback/page.tsx:39|未確認|
|route: /auth/game04|§2/3/10/18||未照合（静的抽出）|src/app/auth/game04/page.tsx:1|未確認|
|state: p "status" |§2/3/10/18||未照合（静的抽出）|src/app/auth/game04/page.tsx:60|未確認|
|route: /billing/return|§2/3/10/18||未照合（静的抽出）|src/app/billing/return/page.tsx:1|未確認|
|component: AdvView|§2/3/10/18||未照合（静的抽出）|src/app/components/AdvView.tsx:1|未確認|
|component: AttributeBadge|§2/3/10/18||未照合（静的抽出）|src/app/components/AttributeBadge.tsx:1|未確認|
|component: AuthenticationReminderModal|§2/3/10/18|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/AuthenticationReminderModal.tsx:1|未確認|
|dialog: CanonicalDialog "ゲームデータを保護"|§12/18.13|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/AuthenticationReminderModal.tsx:34|未確認|
|component: AuthView|§2/3/10/18||未照合（静的抽出）|src/app/components/AuthView.tsx:1|未確認|
|component: AvatarRenderer|§2/3/10/18||未照合（静的抽出）|src/app/components/AvatarRenderer.tsx:1|未確認|
|component: AvatarTab|§2/3/10/18||未照合（静的抽出）|src/app/components/AvatarTab.tsx:1|未確認|
|component: BagTab|§2/3/10/18|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BagTab.tsx:1|未確認|
|dialog: CanonicalDialog {selectedItem.name}|§12/18.13|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BagTab.tsx:164|未確認|
|component: BattleEffectPresentation|§2/3/10/18||未照合（静的抽出）|src/app/components/battle/BattleEffectPresentation.tsx:1|未確認|
|state: div "status" |§2/3/10/18||未照合（静的抽出）|src/app/components/battle/BattleEffectPresentation.tsx:67|未確認|
|state: div "status" |§2/3/10/18||未照合（静的抽出）|src/app/components/battle/BattleEffectPresentation.tsx:104|未確認|
|state: div "status" {`${presentation.skillName} 攻撃演出`}|§2/3/10/18||未照合（静的抽出）|src/app/components/battle/BattleEffectPresentation.tsx:254|未確認|
|component: BattleMatchupPresentation|§2/3/10/18||未照合（静的抽出）|src/app/components/battle/BattleMatchupPresentation.tsx:1|未確認|
|state: section "status" {`${opponentName}との対戦開始`}|§2/3/10/18||未照合（静的抽出）|src/app/components/battle/BattleMatchupPresentation.tsx:20|未確認|
|state: section "status" {`${context?.opponentLabel \|\| opponentName}との対戦開始`}|§2/3/10/18||未照合（静的抽出）|src/app/components/battle/BattleMatchupPresentation.tsx:21|未確認|
|component: BattleResultSummary|§2/3/10/18|../ui/OutlawButton;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/battle/BattleResultSummary.tsx:1|未確認|
|state: div "status" |§2/3/10/18|../ui/OutlawButton;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/battle/BattleResultSummary.tsx:141|未確認|
|state: p "status" |§2/3/10/18|../ui/OutlawButton;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/battle/BattleResultSummary.tsx:178|未確認|
|state: div "status" |§2/3/10/18|../ui/OutlawButton;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/battle/BattleResultSummary.tsx:204|未確認|
|component: BattleUnitPortrait|§2/3/10/18||未照合（静的抽出）|src/app/components/battle/BattleUnitPortrait.tsx:1|未確認|
|component: ExclusiveBattlePresentation|§2/3/10/18||未照合（静的抽出）|src/app/components/battle/ExclusiveBattlePresentation.tsx:1|未確認|
|component: ModeBattleResultCard|§2/3/10/18||未照合（静的抽出）|src/app/components/battle/ModeBattleResultCard.tsx:1|未確認|
|component: QuestBattleViewer|§2/3/10/18|./StreetBattleViewer|未照合（静的抽出）|src/app/components/battle/QuestBattleViewer.tsx:1|未確認|
|state: div "status" |§2/3/10/18|./StreetBattleViewer|未照合（静的抽出）|src/app/components/battle/QuestBattleViewer.tsx:205|未確認|
|component: StreetBattleSetup|§2/3/10/18|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleSetup.tsx:1|未確認|
|state: div "status" "バトル素材を準備中"|§2/3/10/18|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleSetup.tsx:37|未確認|
|state: p "alert" |§2/3/10/18|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleSetup.tsx:37|未確認|
|state: p "status" |§2/3/10/18|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleSetup.tsx:38|未確認|
|state: p "alert" |§2/3/10/18|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleSetup.tsx:38|未確認|
|dialog: SkillDetailDialog |§12/18.13|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleSetup.tsx:38|未確認|
|component: StreetBattleViewer|§2/3/10/18|./QuestBattleViewer|未照合（静的抽出）|src/app/components/battle/StreetBattleViewer.tsx:1|未確認|
|component: StreetStatuses|§2/3/10/18||未照合（静的抽出）|src/app/components/battle/StreetStatuses.tsx:1|未確認|
|component: BbsTab|§2/3/10/18|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BbsTab.tsx:1|未確認|
|dialog: CanonicalDialog "スレッド作成"|§12/18.13|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BbsTab.tsx:412|未確認|
|component: BillingHistory|§2/3/10/18|./ui/OutlawButton;./ui/CanonicalDialog;./ui/OutlawCard|未照合（静的抽出）|src/app/components/BillingHistory.tsx:1|未確認|
|dialog: CanonicalDialog "購入履歴"|§12/18.13|./ui/OutlawButton;./ui/CanonicalDialog;./ui/OutlawCard|未照合（静的抽出）|src/app/components/BillingHistory.tsx:35|未確認|
|state: p "status" |§2/3/10/18|./ui/OutlawButton;./ui/CanonicalDialog;./ui/OutlawCard|未照合（静的抽出）|src/app/components/BillingHistory.tsx:38|未確認|
|component: BillingStatusDialog|§2/3/10/18|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BillingStatusDialog.tsx:1|未確認|
|dialog: CanonicalDialog "購入状況"|§12/18.13|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BillingStatusDialog.tsx:67|未確認|
|state: p "status" |§2/3/10/18|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BillingStatusDialog.tsx:71|未確認|
|state: span "status" |§2/3/10/18|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/BillingStatusDialog.tsx:72|未確認|
|component: CardBattleView|§2/3/10/18|./battle/QuestBattleViewer|未照合（静的抽出）|src/app/components/CardBattleView.tsx:1|未確認|
|state: div "status" "バトル終了演出"|§2/3/10/18|./battle/QuestBattleViewer|未照合（静的抽出）|src/app/components/CardBattleView.tsx:174|未確認|
|state: div "status" |§2/3/10/18|./battle/QuestBattleViewer|未照合（静的抽出）|src/app/components/CardBattleView.tsx:179|未確認|
|dialog: SkillDetailDialog |§12/18.13|./battle/QuestBattleViewer|未照合（静的抽出）|src/app/components/CardBattleView.tsx:280|未確認|
|component: CardIcon|§2/3/10/18|./AttributeBadge|未照合（静的抽出）|src/app/components/CardIcon.tsx:1|未確認|
|component: CharacterEquipment|§2/3/10/18|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterEquipment.tsx:1|未確認|
|state: section "status" |§2/3/10/18|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterEquipment.tsx:43|未確認|
|component: CharacterHome|§2/3/10/18|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterHome.tsx:1|未確認|
|state: div "status" |§2/3/10/18|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterHome.tsx:88|未確認|
|component: CharacterParty|§2/3/10/18|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterParty.tsx:1|未確認|
|state: div "alert" |§2/3/10/18|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterParty.tsx:43|未確認|
|state: div "status" |§2/3/10/18|../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterParty.tsx:44|未確認|
|component: CharacterPresentation|§2/3/10/18||未照合（静的抽出）|src/app/components/character/CharacterPresentation.tsx:1|未確認|
|component: CharacterStageHUD|§2/3/10/18|../ui/OutlawButton|未照合（静的抽出）|src/app/components/character/CharacterStageHUD.tsx:1|未確認|
|component: CharacterStatusBadges|§2/3/10/18||未照合（静的抽出）|src/app/components/character/CharacterStatusBadges.tsx:1|未確認|
|component: CharacterSystemV2|§2/3/10/18|../ui/CanonicalDialog;../ui/CanonicalItemIcon;../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterSystemV2.tsx:1|未確認|
|state: div "status" |§2/3/10/18|../ui/CanonicalDialog;../ui/CanonicalItemIcon;../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterSystemV2.tsx:227|未確認|
|dialog: CanonicalDialog {assetDetail.kind === "skill" ? "スキル詳細" : "装備詳細"}|§12/18.13|../ui/CanonicalDialog;../ui/CanonicalItemIcon;../ui/OutlawButton;./CharacterStatusBadges|未照合（静的抽出）|src/app/components/character/CharacterSystemV2.tsx:300|未確認|
|component: GrowthExpSummary|§2/3/10/18||未照合（静的抽出）|src/app/components/character/GrowthExpSummary.tsx:1|未確認|
|state: div "status" |§2/3/10/18||未照合（静的抽出）|src/app/components/character/GrowthExpSummary.tsx:7|未確認|
|state: span "status" "強化情報を取得中"|§2/3/10/18||未照合（静的抽出）|src/app/components/character/GrowthExpSummary.tsx:8|未確認|
|component: CharacterTab|§2/3/10/18|./ui/CanonicalItemIcon;./ui/EditableSettingSection;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CharacterTab.tsx:1|未確認|
|dialog: CanonicalDialog "おすすめパーティと装備を設定しますか？"|§12/18.13|./ui/CanonicalItemIcon;./ui/EditableSettingSection;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CharacterTab.tsx:352|未確認|
|state: div "status" |§2/3/10/18|./ui/CanonicalItemIcon;./ui/EditableSettingSection;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CharacterTab.tsx:366|未確認|
|dialog: SkillDetailDialog |§12/18.13|./ui/CanonicalItemIcon;./ui/EditableSettingSection;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CharacterTab.tsx:1084|未確認|
|dialog: CanonicalDialog "装備詳細"|§12/18.13|./ui/CanonicalItemIcon;./ui/EditableSettingSection;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CharacterTab.tsx:1085|未確認|
|component: CommonModals|§2/3/10/18|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:1|未確認|
|dialog: CanonicalDialog {`装備選択（スロット${activeGearSlot + 1}）`}|§12/18.13|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:132|未確認|
|dialog: CanonicalDialog {`スキル選択（スロット${activeSkillSlot + 1}）`}|§12/18.13|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:164|未確認|
|state: div "status" "ガチャ演出を準備中"|§2/3/10/18|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:201|未確認|
|state: div "status" "ガチャ結果を表示中"|§2/3/10/18|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:229|未確認|
|state: div "status" "ガチャ抽選結果を同期中"|§2/3/10/18|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:234|未確認|
|dialog: CanonicalDialog "エラー"|§12/18.13|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:317|未確認|
|dialog: CanonicalDialog {activeGuildDetail.name}|§12/18.13|./ui/OutlawButton;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/CommonModals.tsx:345|未確認|
|component: ExternalBrowserGooglePrompt|§2/3/10/18||未照合（静的抽出）|src/app/components/ExternalBrowserGooglePrompt.tsx:1|未確認|
|component: Footer|§2/3/10/18|./useDailyShopBadge|未照合（静的抽出）|src/app/components/Footer.tsx:1|未確認|
|component: FriendPanel|§2/3/10/18|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/FriendPanel.tsx:1|未確認|
|dialog: FullScreenPanel "友達"|§12/18.13|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/FriendPanel.tsx:109|未確認|
|component: CharacterGachaPresentation|§2/3/10/18|../ui/OutlawButton|未照合（静的抽出）|src/app/components/gacha/CharacterGachaPresentation.tsx:1|未確認|
|state: p "status" |§2/3/10/18|../ui/OutlawButton|未照合（静的抽出）|src/app/components/gacha/CharacterGachaPresentation.tsx:95|未確認|
|state: i "status" "ガチャ演出を準備中"|§2/3/10/18|../ui/OutlawButton|未照合（静的抽出）|src/app/components/gacha/CharacterGachaPresentation.tsx:95|未確認|
|state: section "status" |§2/3/10/18|../ui/OutlawButton|未照合（静的抽出）|src/app/components/gacha/CharacterGachaPresentation.tsx:206|未確認|
|component: FormalGachaHub|§2/3/10/18|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:1|未確認|
|state: div "tablist" "登用種別"|§2/3/10/18|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:84|未確認|
|state: button "tab" |§2/3/10/18|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:85|未確認|
|state: button "tab" |§2/3/10/18|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:86|未確認|
|dialog: GachaModalPortal |§12/18.13|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:127|未確認|
|dialog: CanonicalDialog "登用確認"|§12/18.13|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:127|未確認|
|dialog: GachaModalPortal |§12/18.13|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:132|未確認|
|dialog: CanonicalDialog {surface === "NORMAL" ? "通常登用 提供割合" : `${meta.label}特選 提供割合`}|§12/18.13|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:132|未確認|
|dialog: GachaModalPortal |§12/18.13|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:139|未確認|
|dialog: CanonicalDialog {`${meta.label} SSR選択交換`}|§12/18.13|../ui/CanonicalDialog;./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/FormalGachaHub.tsx:139|未確認|
|component: GachaModalPortal|§2/3/10/18|../ui/dialogPresence|未照合（静的抽出）|src/app/components/gacha/GachaModalPortal.tsx:1|未確認|
|component: GachaPromotion|§2/3/10/18||未照合（静的抽出）|src/app/components/gacha/GachaPromotion.tsx:1|未確認|
|component: SengokuGateOpening|§2/3/10/18|./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/SengokuGateOpening.tsx:1|未確認|
|dialog: GachaModalPortal |§12/18.13|./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/SengokuGateOpening.tsx:47|未確認|
|state: p "status" |§2/3/10/18|./GachaModalPortal|未照合（静的抽出）|src/app/components/gacha/SengokuGateOpening.tsx:73|未確認|
|component: GachaTab|§2/3/10/18|./ui/CanonicalDialog;./ui/GuideDialog|未照合（静的抽出）|src/app/components/GachaTab.tsx:1|未確認|
|dialog: GuideDialog "初心者ガイド"|§12/18.13|./ui/CanonicalDialog;./ui/GuideDialog|未照合（静的抽出）|src/app/components/GachaTab.tsx:124|未確認|
|state: p "status" |§2/3/10/18|./ui/CanonicalDialog;./ui/GuideDialog|未照合（静的抽出）|src/app/components/GachaTab.tsx:161|未確認|
|state: p "status" |§2/3/10/18|./ui/CanonicalDialog;./ui/GuideDialog|未照合（静的抽出）|src/app/components/GachaTab.tsx:170|未確認|
|state: p "alert" |§2/3/10/18|./ui/CanonicalDialog;./ui/GuideDialog|未照合（静的抽出）|src/app/components/GachaTab.tsx:171|未確認|
|dialog: CanonicalDialog "提供割合"|§12/18.13|./ui/CanonicalDialog;./ui/GuideDialog|未照合（静的抽出）|src/app/components/GachaTab.tsx:183|未確認|
|component: GuildEmblemEditor|§2/3/10/18|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/guild/GuildEmblemEditor.tsx:1|未確認|
|dialog: CanonicalDialog "エンブレム変更"|§12/18.13|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/guild/GuildEmblemEditor.tsx:117|未確認|
|state: div "status" |§2/3/10/18|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/guild/GuildEmblemEditor.tsx:122|未確認|
|state: div "alert" |§2/3/10/18|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/guild/GuildEmblemEditor.tsx:123|未確認|
|state: p "alert" |§2/3/10/18|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/guild/GuildEmblemEditor.tsx:139|未確認|
|state: div "status" |§2/3/10/18|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/guild/GuildEmblemEditor.tsx:140|未確認|
|component: GuildTab|§2/3/10/18|./ui/OutlawCard;./ui/OutlawButton;./ui/EditableSettingSection|未照合（静的抽出）|src/app/components/GuildTab.tsx:1|未確認|
|state: div "status" |§2/3/10/18|./ui/OutlawCard;./ui/OutlawButton;./ui/EditableSettingSection|未照合（静的抽出）|src/app/components/GuildTab.tsx:292|未確認|
|state: span "status" |§2/3/10/18|./ui/OutlawCard;./ui/OutlawButton;./ui/EditableSettingSection|未照合（静的抽出）|src/app/components/GuildTab.tsx:495|未確認|
|component: GvgMatchStatusPanel|§2/3/10/18||未照合（静的抽出）|src/app/components/GvgMatchStatusPanel.tsx:1|未確認|
|component: GvgTab|§2/3/10/18|./GvgMatchStatusPanel;./ui/HubPage;./ui/HeroPanel;./ui/Badge;./ui/OutlawButton;./ui/PeriodStatus|未照合（静的抽出）|src/app/components/GvgTab.tsx:1|未確認|
|dialog: HeroPanel |§12/18.13|./GvgMatchStatusPanel;./ui/HubPage;./ui/HeroPanel;./ui/Badge;./ui/OutlawButton;./ui/PeriodStatus|未照合（静的抽出）|src/app/components/GvgTab.tsx:222|未確認|
|dialog: GvgMatchStatusPanel |§12/18.13|./GvgMatchStatusPanel;./ui/HubPage;./ui/HeroPanel;./ui/Badge;./ui/OutlawButton;./ui/PeriodStatus|未照合（静的抽出）|src/app/components/GvgTab.tsx:254|未確認|
|state: div "status" |§2/3/10/18|./GvgMatchStatusPanel;./ui/HubPage;./ui/HeroPanel;./ui/Badge;./ui/OutlawButton;./ui/PeriodStatus|未照合（静的抽出）|src/app/components/GvgTab.tsx:256|未確認|
|component: Header|§2/3/10/18||未照合（静的抽出）|src/app/components/Header.tsx:1|未確認|
|component: HomeResumeShell|§2/3/10/18|./ui/PageShell|未照合（静的抽出）|src/app/components/HomeResumeShell.tsx:1|未確認|
|component: HomeTab|§2/3/10/18|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/HomeTab.tsx:1|未確認|
|dialog: CanonicalDialog "アクティビティ"|§12/18.13|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/HomeTab.tsx:632|未確認|
|dialog: CanonicalDialog "プレオープン限定 同盟総合力ランキング"|§12/18.13|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/HomeTab.tsx:841|未確認|
|component: InboxPanel|§2/3/10/18|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalDialog;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/InboxPanel.tsx:1|未確認|
|state: p "status" |§2/3/10/18|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalDialog;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/InboxPanel.tsx:91|未確認|
|state: div "alert" |§2/3/10/18|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalDialog;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/InboxPanel.tsx:92|未確認|
|dialog: FullScreenPanel "受信箱"|§12/18.13|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalDialog;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/InboxPanel.tsx:161|未確認|
|dialog: CanonicalDialog {selectedNews.title}|§12/18.13|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalDialog;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/InboxPanel.tsx:182|未確認|
|component: LegalPanel|§2/3/10/18||未照合（静的抽出）|src/app/components/LegalPanel.tsx:1|未確認|
|component: LoginBonusModal|§2/3/10/18|./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/LoginBonusModal.tsx:1|未確認|
|state: div "status" |§2/3/10/18|./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/LoginBonusModal.tsx:74|未確認|
|state: div "status" |§2/3/10/18|./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/LoginBonusModal.tsx:113|未確認|
|component: MenuTab|§2/3/10/18||未照合（静的抽出）|src/app/components/MenuTab.tsx:1|未確認|
|component: BeginnerMissionRewardCta|§2/3/10/18|../ui/dialogPresence|未照合（静的抽出）|src/app/components/mission/BeginnerMissionRewardCta.tsx:1|未確認|
|component: PrepMissionEventDialogController|§2/3/10/18|../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/mission/PrepMissionEventDialogController.tsx:1|未確認|
|dialog: CanonicalDialog {pending.displayName}|§12/18.13|../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/mission/PrepMissionEventDialogController.tsx:159|未確認|
|state: span "alert" |§2/3/10/18|../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/mission/PrepMissionEventDialogController.tsx:174|未確認|
|component: MissionPanel|§2/3/10/18|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/MissionPanel.tsx:1|未確認|
|dialog: FullScreenPanel "任務"|§12/18.13|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/MissionPanel.tsx:212|未確認|
|state: p "status" |§2/3/10/18|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/MissionPanel.tsx:224|未確認|
|state: p "status" |§2/3/10/18|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/MissionPanel.tsx:231|未確認|
|component: MonthlyPassBanner|§2/3/10/18|./ui/OutlawButton|未照合（静的抽出）|src/app/components/MonthlyPassBanner.tsx:1|未確認|
|component: MoveBaseModal|§2/3/10/18|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/MoveBaseModal.tsx:1|未確認|
|dialog: CanonicalDialog "拠点移動"|§12/18.13|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/MoveBaseModal.tsx:19|未確認|
|component: PaidAssetExpiry|§2/3/10/18|./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/PaidAssetExpiry.tsx:1|未確認|
|dialog: CanonicalDialog "購入分の有効期限"|§12/18.13|./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/PaidAssetExpiry.tsx:55|未確認|
|state: p "alert" |§2/3/10/18|./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/PaidAssetExpiry.tsx:58|未確認|
|component: PatrolTab|§2/3/10/18|./ui/OutlawCard;./ui/OutlawButton;./ui/SubTabNav;./ui/SectionHeader;./ui/HubPage;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/PatrolTab.tsx:1|未確認|
|state: div "status" |§2/3/10/18|./ui/OutlawCard;./ui/OutlawButton;./ui/SubTabNav;./ui/SectionHeader;./ui/HubPage;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/PatrolTab.tsx:447|未確認|
|state: small "status" |§2/3/10/18|./ui/OutlawCard;./ui/OutlawButton;./ui/SubTabNav;./ui/SectionHeader;./ui/HubPage;./ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/PatrolTab.tsx:478|未確認|
|component: PCLeftChat|§2/3/10/18||未照合（静的抽出）|src/app/components/PCLeftChat.tsx:1|未確認|
|component: PCRightSidebar|§2/3/10/18||未照合（静的抽出）|src/app/components/PCRightSidebar.tsx:1|未確認|
|component: RankPresentation|§2/3/10/18||未照合（静的抽出）|src/app/components/presentation/RankPresentation.tsx:1|未確認|
|component: StatusMetric|§2/3/10/18||未照合（静的抽出）|src/app/components/presentation/StatusMetric.tsx:1|未確認|
|component: GuildIdentity|§2/3/10/18||未照合（静的抽出）|src/app/components/profile/GuildIdentity.tsx:1|未確認|
|component: PublicUserProfile|§2/3/10/18|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/profile/PublicUserProfile.tsx:1|未確認|
|dialog: CanonicalDialog |§12/18.13|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/profile/PublicUserProfile.tsx:86|未確認|
|state: div "status" |§2/3/10/18|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/profile/PublicUserProfile.tsx:87|未確認|
|dialog: SkillDetailDialog |§12/18.13|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/profile/PublicUserProfile.tsx:109|未確認|
|component: SeasonHonors|§2/3/10/18||未照合（静的抽出）|src/app/components/profile/SeasonHonors.tsx:1|未確認|
|state: p "alert" |§2/3/10/18||未照合（静的抽出）|src/app/components/profile/SeasonHonors.tsx:67|未確認|
|component: UserAvatar|§2/3/10/18||未照合（静的抽出）|src/app/components/profile/UserAvatar.tsx:1|未確認|
|component: UserIdentityRow|§2/3/10/18||未照合（静的抽出）|src/app/components/profile/UserIdentityRow.tsx:1|未確認|
|state: span "status" "リーダーを読み込み中"|§2/3/10/18||未照合（静的抽出）|src/app/components/profile/UserIdentityRow.tsx:21|未確認|
|component: BattleTopPresentation|§2/3/10/18|../ui/OutlawButton;../ui/ScreenState|未照合（静的抽出）|src/app/components/pvp/BattleTopPresentation.tsx:1|未確認|
|component: PvpBattleRewards|§2/3/10/18||未照合（静的抽出）|src/app/components/pvp/PvpBattleRewards.tsx:1|未確認|
|component: PvpDeckPresentation|§2/3/10/18||未照合（静的抽出）|src/app/components/pvp/PvpDeckPresentation.tsx:1|未確認|
|component: PvpTab|§2/3/10/18|./ui/OutlawCard;./ui/HubPage;./ui/ScreenState;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/PvpTab.tsx:1|未確認|
|dialog: CanonicalDialog {deckDialog === "my" ? "MY DECK" : "RIVAL DECK"}|§12/18.13|./ui/OutlawCard;./ui/HubPage;./ui/ScreenState;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/PvpTab.tsx:297|未確認|
|dialog: SkillDetailDialog |§12/18.13|./ui/OutlawCard;./ui/HubPage;./ui/ScreenState;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/PvpTab.tsx:314|未確認|
|dialog: CanonicalDialog "BPが不足しています"|§12/18.13|./ui/OutlawCard;./ui/HubPage;./ui/ScreenState;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/PvpTab.tsx:315|未確認|
|dialog: CanonicalDialog "BP回復"|§12/18.13|./ui/OutlawCard;./ui/HubPage;./ui/ScreenState;./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/PvpTab.tsx:319|未確認|
|component: QuestEncounterHomeReturn|§2/3/10/18|../ui/OutlawButton|未照合（静的抽出）|src/app/components/quest/QuestEncounterHomeReturn.tsx:1|未確認|
|state: p "alert" |§2/3/10/18|../ui/OutlawButton|未照合（静的抽出）|src/app/components/quest/QuestEncounterHomeReturn.tsx:32|未確認|
|component: QuestPresentationV2|§2/3/10/18|../ui/HubPage;../ui/OutlawButton;../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/quest/QuestPresentationV2.tsx:1|未確認|
|state: p "status" |§2/3/10/18|../ui/HubPage;../ui/OutlawButton;../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/quest/QuestPresentationV2.tsx:228|未確認|
|state: p "status" |§2/3/10/18|../ui/HubPage;../ui/OutlawButton;../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/quest/QuestPresentationV2.tsx:242|未確認|
|state: div "status" |§2/3/10/18|../ui/HubPage;../ui/OutlawButton;../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/quest/QuestPresentationV2.tsx:282|未確認|
|state: section "status" |§2/3/10/18|../ui/HubPage;../ui/OutlawButton;../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/quest/QuestPresentationV2.tsx:294|未確認|
|dialog: CanonicalDialog "クエスト結果"|§12/18.13|../ui/HubPage;../ui/OutlawButton;../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/quest/QuestPresentationV2.tsx:299|未確認|
|component: QuestProgressionGuide|§2/3/10/18|../ui/GuideDialog|未照合（静的抽出）|src/app/components/quest/QuestProgressionGuide.tsx:1|未確認|
|dialog: GuideDialog "まずはクエストを進めよう"|§12/18.13|../ui/GuideDialog|未照合（静的抽出）|src/app/components/quest/QuestProgressionGuide.tsx:51|未確認|
|dialog: GuideDialog "初心者ガイド"|§12/18.13|../ui/GuideDialog|未照合（静的抽出）|src/app/components/quest/QuestProgressionGuide.tsx:55|未確認|
|dialog: GuideDialog "初心者ガイド"|§12/18.13|../ui/GuideDialog|未照合（静的抽出）|src/app/components/quest/QuestProgressionGuide.tsx:63|未確認|
|dialog: GuideDialog "初心者ガイド"|§12/18.13|../ui/GuideDialog|未照合（静的抽出）|src/app/components/quest/QuestProgressionGuide.tsx:66|未確認|
|component: QuestRaidEncounter|§2/3/10/18|../ui/FullScreenPanel;../ui/OutlawButton;../ui/dialogPresence|未照合（静的抽出）|src/app/components/quest/QuestRaidEncounter.tsx:1|未確認|
|state: div "alert" |§2/3/10/18|../ui/FullScreenPanel;../ui/OutlawButton;../ui/dialogPresence|未照合（静的抽出）|src/app/components/quest/QuestRaidEncounter.tsx:48|未確認|
|dialog: FullScreenPanel |§12/18.13|../ui/FullScreenPanel;../ui/OutlawButton;../ui/dialogPresence|未照合（静的抽出）|src/app/components/quest/QuestRaidEncounter.tsx:49|未確認|
|state: p "alert" |§2/3/10/18|../ui/FullScreenPanel;../ui/OutlawButton;../ui/dialogPresence|未照合（静的抽出）|src/app/components/quest/QuestRaidEncounter.tsx:58|未確認|
|component: QuestTownStory|§2/3/10/18||未照合（静的抽出）|src/app/components/quest/QuestTownStory.tsx:1|未確認|
|component: QuestRaidBonus|§2/3/10/18|../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/QuestRaidBonus.tsx:1|未確認|
|component: RaidApprovedVisual|§2/3/10/18||未照合（静的抽出）|src/app/components/raid/RaidApprovedVisual.tsx:1|未確認|
|component: RaidEnemyRoster|§2/3/10/18|../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidEnemyRoster.tsx:1|未確認|
|state: div "alert" |§2/3/10/18|../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidEnemyRoster.tsx:16|未確認|
|component: RaidEnemySelection|§2/3/10/18|@/domain/raidRoomDisplay;../ui/SectionHeader;../ui/OutlawButton;../ui/SubTabNav;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/raid/RaidEnemySelection.tsx:1|未確認|
|state: div "alert" |§2/3/10/18|@/domain/raidRoomDisplay;../ui/SectionHeader;../ui/OutlawButton;../ui/SubTabNav;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/raid/RaidEnemySelection.tsx:26|未確認|
|state: p "alert" |§2/3/10/18|@/domain/raidRoomDisplay;../ui/SectionHeader;../ui/OutlawButton;../ui/SubTabNav;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/raid/RaidEnemySelection.tsx:32|未確認|
|state: p "alert" |§2/3/10/18|@/domain/raidRoomDisplay;../ui/SectionHeader;../ui/OutlawButton;../ui/SubTabNav;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/raid/RaidEnemySelection.tsx:34|未確認|
|component: raidPagePresentation|§2/3/10/18||未照合（静的抽出）|src/app/components/raid/raidPagePresentation.tsx:1|未確認|
|state: div "status" "通信中"|§2/3/10/18||未照合（静的抽出）|src/app/components/raid/raidPagePresentation.tsx:14|未確認|
|component: RaidRescueLink|§2/3/10/18|../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRescueLink.tsx:1|未確認|
|state: span "status" "読み込み中"|§2/3/10/18|../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRescueLink.tsx:51|未確認|
|component: RaidResultDetails|§2/3/10/18||未照合（静的抽出）|src/app/components/raid/RaidResultDetails.tsx:1|未確認|
|component: RaidRewardComparison|§2/3/10/18||未照合（静的抽出）|src/app/components/raid/RaidRewardComparison.tsx:1|未確認|
|component: RaidRewardItems|§2/3/10/18|../../../domain/raidRoomDisplay;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/raid/RaidRewardItems.tsx:1|未確認|
|component: RaidRoomBrowser|§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:1|未確認|
|state: div "status" "通信中"|§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:46|未確認|
|state: p "alert" |§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:135|未確認|
|state: div "tablist" "難易度"|§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:135|未確認|
|state: OutlawButton "tab" {entry.label}|§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:136|未確認|
|state: p "alert" |§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:152|未確認|
|state: p "alert" |§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:160|未確認|
|state: p "alert" |§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:172|未確認|
|state: p "alert" |§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:180|未確認|
|state: p "status" |§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:194|未確認|
|state: p "alert" |§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:197|未確認|
|state: p "alert" |§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:198|未確認|
|state: p "alert" |§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:199|未確認|
|dialog: RaidRoomDialogs |§12/18.13|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:202|未確認|
|dialog: CanonicalDialog "敵情報"|§12/18.13|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:208|未確認|
|state: p "alert" |§2/3/10/18|../ui/SectionHeader;../ui/OutlawButton;../ui/CanonicalDialog;./useRaidRoomDisplay;../../../domain/raidRoomDisplayClient;../../../domain/raidRoomDisplay|未照合（静的抽出）|src/app/components/raid/RaidRoomBrowser.tsx:210|未確認|
|component: RaidRoomClearRewardPanel|§2/3/10/18|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomClearRewardPanel.tsx:1|未確認|
|state: span "status" "通信中"|§2/3/10/18|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomClearRewardPanel.tsx:51|未確認|
|state: p "alert" |§2/3/10/18|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomClearRewardPanel.tsx:52|未確認|
|state: p "alert" |§2/3/10/18|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomClearRewardPanel.tsx:53|未確認|
|state: p "status" |§2/3/10/18|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomClearRewardPanel.tsx:55|未確認|
|component: RaidRoomConnectedBrowser|§2/3/10/18|./RaidRoomClearRewardPanel;./RaidRoomRescueRewardPanel;./RaidRoomRescuePanel;../ui/OutlawButton;../../../domain/raidRoomDisplayClient|未照合（静的抽出）|src/app/components/raid/RaidRoomConnectedBrowser.tsx:1|未確認|
|state: div "alert" |§2/3/10/18|./RaidRoomClearRewardPanel;./RaidRoomRescueRewardPanel;./RaidRoomRescuePanel;../ui/OutlawButton;../../../domain/raidRoomDisplayClient|未照合（静的抽出）|src/app/components/raid/RaidRoomConnectedBrowser.tsx:110|未確認|
|state: p "alert" |§2/3/10/18|./RaidRoomClearRewardPanel;./RaidRoomRescueRewardPanel;./RaidRoomRescuePanel;../ui/OutlawButton;../../../domain/raidRoomDisplayClient|未照合（静的抽出）|src/app/components/raid/RaidRoomConnectedBrowser.tsx:110|未確認|
|dialog: RaidRoomClearRewardPanel |§12/18.13|./RaidRoomClearRewardPanel;./RaidRoomRescueRewardPanel;./RaidRoomRescuePanel;../ui/OutlawButton;../../../domain/raidRoomDisplayClient|未照合（静的抽出）|src/app/components/raid/RaidRoomConnectedBrowser.tsx:112|未確認|
|dialog: RaidRoomRescueRewardPanel |§12/18.13|./RaidRoomClearRewardPanel;./RaidRoomRescueRewardPanel;./RaidRoomRescuePanel;../ui/OutlawButton;../../../domain/raidRoomDisplayClient|未照合（静的抽出）|src/app/components/raid/RaidRoomConnectedBrowser.tsx:113|未確認|
|dialog: RaidRoomRescuePanel |§12/18.13|./RaidRoomClearRewardPanel;./RaidRoomRescueRewardPanel;./RaidRoomRescuePanel;../ui/OutlawButton;../../../domain/raidRoomDisplayClient|未照合（静的抽出）|src/app/components/raid/RaidRoomConnectedBrowser.tsx:114|未確認|
|component: RaidRoomDetail|§2/3/10/18|@/domain/raidRoomDisplay;../ui/OutlawButton;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/raid/RaidRoomDetail.tsx:1|未確認|
|state: div "status" "通信中"|§2/3/10/18|@/domain/raidRoomDisplay;../ui/OutlawButton;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/raid/RaidRoomDetail.tsx:37|未確認|
|state: div "alert" |§2/3/10/18|@/domain/raidRoomDisplay;../ui/OutlawButton;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/raid/RaidRoomDetail.tsx:85|未確認|
|dialog: CanonicalDialog "救援"|§12/18.13|@/domain/raidRoomDisplay;../ui/OutlawButton;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/raid/RaidRoomDetail.tsx:103|未確認|
|component: RaidRoomDialogs|§2/3/10/18|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:1|未確認|
|dialog: CanonicalDialog {kind === 'participants' ? '参加者' : '報酬'}|§12/18.13|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:63|未確認|
|state: p "alert" |§2/3/10/18|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:66|未確認|
|state: span "status" "通信中"|§2/3/10/18|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:67|未確認|
|state: p "alert" |§2/3/10/18|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:69|未確認|
|state: span "status" "通信中"|§2/3/10/18|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:81|未確認|
|state: p "alert" |§2/3/10/18|../ui/CanonicalDialog;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomDialogs.tsx:83|未確認|
|component: RaidRoomListCard|§2/3/10/18|../ui/OutlawCard;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomListCard.tsx:1|未確認|
|state: div "alert" |§2/3/10/18|../ui/OutlawCard;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomListCard.tsx:16|未確認|
|component: RaidRoomRescuePanel|§2/3/10/18|../ui/OutlawButton;../ui/OutlawCard|未照合（静的抽出）|src/app/components/raid/RaidRoomRescuePanel.tsx:1|未確認|
|dialog: RescuePanel |§12/18.13|../ui/OutlawButton;../ui/OutlawCard|未照合（静的抽出）|src/app/components/raid/RaidRoomRescuePanel.tsx:11|未確認|
|state: span "status" "通信中"|§2/3/10/18|../ui/OutlawButton;../ui/OutlawCard|未照合（静的抽出）|src/app/components/raid/RaidRoomRescuePanel.tsx:72|未確認|
|state: p "status" |§2/3/10/18|../ui/OutlawButton;../ui/OutlawCard|未照合（静的抽出）|src/app/components/raid/RaidRoomRescuePanel.tsx:85|未確認|
|state: p "alert" |§2/3/10/18|../ui/OutlawButton;../ui/OutlawCard|未照合（静的抽出）|src/app/components/raid/RaidRoomRescuePanel.tsx:86|未確認|
|component: RaidRoomRescueRewardPanel|§2/3/10/18|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomRescueRewardPanel.tsx:1|未確認|
|state: span "status" "通信中"|§2/3/10/18|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomRescueRewardPanel.tsx:46|未確認|
|state: p "alert" |§2/3/10/18|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomRescueRewardPanel.tsx:47|未確認|
|state: p "alert" |§2/3/10/18|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomRescueRewardPanel.tsx:48|未確認|
|state: p "status" |§2/3/10/18|../../../domain/raidRoomDisplay;../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidRoomRescueRewardPanel.tsx:50|未確認|
|component: RaidStrategySummary|§2/3/10/18||未照合（静的抽出）|src/app/components/raid/RaidStrategySummary.tsx:1|未確認|
|component: RaidTop|§2/3/10/18|../ui/OutlawButton;../ui/OutlawCard;../ui/SectionHeader|未照合（静的抽出）|src/app/components/raid/RaidTop.tsx:1|未確認|
|state: div "status" "通信中"|§2/3/10/18|../ui/OutlawButton;../ui/OutlawCard;../ui/SectionHeader|未照合（静的抽出）|src/app/components/raid/RaidTop.tsx:24|未確認|
|state: div {resource.status === "error" ? "alert" : "status"} |§2/3/10/18|../ui/OutlawButton;../ui/OutlawCard;../ui/SectionHeader|未照合（静的抽出）|src/app/components/raid/RaidTop.tsx:57|未確認|
|state: div "alert" |§2/3/10/18|../ui/OutlawButton;../ui/OutlawCard;../ui/SectionHeader|未照合（静的抽出）|src/app/components/raid/RaidTop.tsx:101|未確認|
|component: RaidTopApproved|§2/3/10/18|../ui/OutlawButton|未照合（静的抽出）|src/app/components/raid/RaidTopApproved.tsx:1|未確認|
|component: RaidTab|§2/3/10/18|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:1|未確認|
|state: div "status" "レイド情報を取得中"|§2/3/10/18|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:237|未確認|
|state: div "tablist" "レイド対象"|§2/3/10/18|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:238|未確認|
|state: button "tab" |§2/3/10/18|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:238|未確認|
|dialog: CanonicalDialog "RPが不足しています"|§12/18.13|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:252|未確認|
|dialog: CanonicalDialog {pendingRoomBriefingRef.current ? "チケットを使って挑戦しますか？" : "レイドチケットで回復しますか？"}|§12/18.13|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:253|未確認|
|dialog: CanonicalDialog "RPの回復結果を確認してください"|§12/18.13|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:257|未確認|
|dialog: CanonicalDialog "戦場を準備できませんでした"|§12/18.13|./ui/Badge;./ui/CanonicalDialog;./ui/GlobalInteractionBlocker;./ui/HubPage;./ui/OutlawButton;./ui/OutlawCard|未照合（静的抽出）|src/app/components/RaidTab.tsx:258|未確認|
|component: MonthlyPowerRewardContent|§2/3/10/18||未照合（静的抽出）|src/app/components/ranking/MonthlyPowerRewardContent.tsx:1|未確認|
|state: div "alert" |§2/3/10/18||未照合（静的抽出）|src/app/components/ranking/MonthlyPowerRewardContent.tsx:31|未確認|
|state: span "status" "シーズン報酬を取得中"|§2/3/10/18||未照合（静的抽出）|src/app/components/ranking/MonthlyPowerRewardContent.tsx:32|未確認|
|component: RankingRewardDialog|§2/3/10/18|../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/ranking/RankingRewardDialog.tsx:1|未確認|
|dialog: CanonicalDialog "ランキング報酬"|§12/18.13|../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/ranking/RankingRewardDialog.tsx:37|未確認|
|state: span "status" "報酬情報を取得中"|§2/3/10/18|../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/ranking/RankingRewardDialog.tsx:51|未確認|
|state: div "alert" |§2/3/10/18|../ui/CanonicalDialog;../ui/CanonicalItemIcon|未照合（静的抽出）|src/app/components/ranking/RankingRewardDialog.tsx:51|未確認|
|component: RankingRewardNotificationController|§2/3/10/18||未照合（静的抽出）|src/app/components/ranking/RankingRewardNotificationController.tsx:1|未確認|
|component: RankingTab|§2/3/10/18|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:1|未確認|
|state: div "status" |§2/3/10/18|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:414|未確認|
|state: div "status" |§2/3/10/18|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:429|未確認|
|state: div "status" |§2/3/10/18|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:439|未確認|
|state: div "status" |§2/3/10/18|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:440|未確認|
|state: div "alert" |§2/3/10/18|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:442|未確認|
|dialog: RankingRewardDialog |§12/18.13|./ui/HubPage;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/RankingTab.tsx:459|未確認|
|component: BattleEffectLayer|§2/3/10/18||未照合（静的抽出）|src/app/components/redesign/battle-effects/BattleEffectLayer.tsx:1|未確認|
|component: BattleEffects|§2/3/10/18||未照合（静的抽出）|src/app/components/redesign/BattleEffects.tsx:1|未確認|
|component: BattleResourceDisplay|§2/3/10/18||未照合（静的抽出）|src/app/components/redesign/BattleResourceDisplay.tsx:1|未確認|
|component: BattleView|§2/3/10/18|../ui/CanonicalDialog;./BattleResourceDisplay;../ui/uiMotion;./BattleView.module.css|未照合（静的抽出）|src/app/components/redesign/BattleView.tsx:1|未確認|
|dialog: CanonicalDialog {confirmRetire ? 'リタイアしますか？' : '一時停止'}|§12/18.13|../ui/CanonicalDialog;./BattleResourceDisplay;../ui/uiMotion;./BattleView.module.css|未照合（静的抽出）|src/app/components/redesign/BattleView.tsx:203|未確認|
|state: div "status" |§2/3/10/18|../ui/CanonicalDialog;./BattleResourceDisplay;../ui/uiMotion;./BattleView.module.css|未照合（静的抽出）|src/app/components/redesign/BattleView.tsx:209|未確認|
|component: CommunityAuthenticationReminder|§2/3/10/18|../ui/CanonicalDialog;../ui/dialogPresence|未照合（静的抽出）|src/app/components/redesign/CommunityAuthenticationReminder.tsx:1|未確認|
|dialog: CanonicalDialog "ゲームデータを保護"|§12/18.13|../ui/CanonicalDialog;../ui/dialogPresence|未照合（静的抽出）|src/app/components/redesign/CommunityAuthenticationReminder.tsx:42|未確認|
|component: CommunityIdentity|§2/3/10/18||未照合（静的抽出）|src/app/components/redesign/CommunityIdentity.tsx:1|未確認|
|component: CreativeCharacter|§2/3/10/18|../ui/presentationSettings|未照合（静的抽出）|src/app/components/redesign/CreativeCharacter.tsx:1|未確認|
|component: EarlyRetentionGuide|§2/3/10/18|../ui/GuideDialog|未照合（静的抽出）|src/app/components/redesign/EarlyRetentionGuide.tsx:1|未確認|
|dialog: GuideDialog {content.title}|§12/18.13|../ui/GuideDialog|未照合（静的抽出）|src/app/components/redesign/EarlyRetentionGuide.tsx:34|未確認|
|state: p "alert" |§2/3/10/18|../ui/GuideDialog|未照合（静的抽出）|src/app/components/redesign/EarlyRetentionGuide.tsx:37|未確認|
|state: p "alert" |§2/3/10/18|../ui/GuideDialog|未照合（静的抽出）|src/app/components/redesign/EarlyRetentionGuide.tsx:44|未確認|
|state: p "status" |§2/3/10/18|../ui/GuideDialog|未照合（静的抽出）|src/app/components/redesign/EarlyRetentionGuide.tsx:44|未確認|
|component: ElementBadge|§2/3/10/18||未照合（静的抽出）|src/app/components/redesign/ElementBadge.tsx:1|未確認|
|component: FormalGachaView|§2/3/10/18|../gacha/GachaModalPortal;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/redesign/FormalGachaView.tsx:1|未確認|
|state: p {error ? "alert" : "status"} |§2/3/10/18|../gacha/GachaModalPortal;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/redesign/FormalGachaView.tsx:290|未確認|
|state: p "alert" |§2/3/10/18|../gacha/GachaModalPortal;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/redesign/FormalGachaView.tsx:296|未確認|
|dialog: GachaModalPortal |§12/18.13|../gacha/GachaModalPortal;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/redesign/FormalGachaView.tsx:326|未確認|
|dialog: CanonicalDialog "登用結果"|§12/18.13|../gacha/GachaModalPortal;../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/redesign/FormalGachaView.tsx:326|未確認|
|component: FormalLoginBonusModal|§2/3/10/18|../ui/CanonicalDialog;../ui/Game04DataDisplay;../ui/CompactRewards|未照合（静的抽出）|src/app/components/redesign/FormalLoginBonusModal.tsx:1|未確認|
|dialog: CanonicalDialog {`${detail}日目の報酬`}|§12/18.13|../ui/CanonicalDialog;../ui/Game04DataDisplay;../ui/CompactRewards|未照合（静的抽出）|src/app/components/redesign/FormalLoginBonusModal.tsx:15|未確認|
|dialog: CanonicalDialog "ログインボーナス"|§12/18.13|../ui/CanonicalDialog;../ui/Game04DataDisplay;../ui/CompactRewards|未照合（静的抽出）|src/app/components/redesign/FormalLoginBonusModal.tsx:16|未確認|
|component: GrowthControls|§2/3/10/18|../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:1|未確認|
|state: p "status" |§2/3/10/18|../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:39|未確認|
|state: p "status" |§2/3/10/18|../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:39|未確認|
|state: p "status" |§2/3/10/18|../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:58|未確認|
|state: p "status" |§2/3/10/18|../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:58|未確認|
|state: p "status" |§2/3/10/18|../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:58|未確認|
|state: p "status" |§2/3/10/18|../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:58|未確認|
|state: p "status" |§2/3/10/18|../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:59|未確認|
|dialog: CanonicalDialog "育成アイテム"|§12/18.13|../ui/CanonicalDialog;../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/GrowthControls.tsx:76|未確認|
|component: GrowthView|§2/3/10/18|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:1|未確認|
|dialog: CentralModal {title}|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:38|未確認|
|state: p "alert" |§2/3/10/18|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:39|未確認|
|state: div "alert" |§2/3/10/18|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:89|未確認|
|dialog: CentralModal "読み込み中"|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:89|未確認|
|dialog: Modal {result.title}|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:90|未確認|
|dialog: Modal "操作を確認してください"|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:90|未確認|
|state: p "alert" |§2/3/10/18|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:90|未確認|
|state: p "status" |§2/3/10/18|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:96|未確認|
|state: p "status" |§2/3/10/18|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:97|未確認|
|dialog: Modal "魂から解放"|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:100|未確認|
|dialog: Modal {master.name}|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:103|未確認|
|dialog: Modal "Lv育成"|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:104|未確認|
|dialog: Modal {growthMode==='exchange'?'魂交換':'覚醒'}|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:105|未確認|
|dialog: Modal "全身鑑賞"|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:106|未確認|
|dialog: Modal {assign.kind==='skill'?'スキルを変更':'装備を変更'}|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:107|未確認|
|state: p "status" |§2/3/10/18|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:109|未確認|
|state: p "status" |§2/3/10/18|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:111|未確認|
|state: p "status" |§2/3/10/18|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:112|未確認|
|state: p "status" |§2/3/10/18|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:113|未確認|
|dialog: Modal {detailSkill.name}|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:116|未確認|
|state: p "status" |§2/3/10/18|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:116|未確認|
|dialog: Modal {detailEquip.name}|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:117|未確認|
|state: p "status" |§2/3/10/18|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:117|未確認|
|dialog: Modal "装備Lv育成"|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:118|未確認|
|dialog: Modal "装備を分解"|§12/18.13|../ui/ListControls;./ElementBadge;../ui/AssetChoice;./PassiveDisplay;./Modal;../ui/BrandedLoading;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/GrowthView.tsx:119|未確認|
|component: HomeEffect|§2/3/10/18||未照合（静的抽出）|src/app/components/redesign/HomeEffect.tsx:1|未確認|
|component: HomeView|§2/3/10/18|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:1|未確認|
|state: div "status" "活動を読み込み中"|§2/3/10/18|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:118|未確認|
|state: div "alert" |§2/3/10/18|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:118|未確認|
|state: div "status" |§2/3/10/18|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:135|未確認|
|dialog: Modal "表示切替"|§12/18.13|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:154|未確認|
|state: div "status" |§2/3/10/18|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:155|未確認|
|state: p "alert" |§2/3/10/18|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:158|未確認|
|dialog: Modal "プロフィール"|§12/18.13|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:160|未確認|
|dialog: Modal "コミュニティ"|§12/18.13|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:163|未確認|
|state: p "status" |§2/3/10/18|../ui/ActionButton;./Modal;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/HomeView.tsx:163|未確認|
|component: IntegratedStart|§2/3/10/18|../ui/BrandedLoading|未照合（静的抽出）|src/app/components/redesign/IntegratedStart.tsx:1|未確認|
|state: p "alert" |§2/3/10/18|../ui/BrandedLoading|未照合（静的抽出）|src/app/components/redesign/IntegratedStart.tsx:11|未確認|
|component: IntegratedTutorial|§2/3/10/18|./BattleView;../ui/AssetChoice;./visual-bench/CharacterDisplays;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/IntegratedTutorial.tsx:1|未確認|
|state: p "alert" |§2/3/10/18|./BattleView;../ui/AssetChoice;./visual-bench/CharacterDisplays;./visual-bench/CowboyDisplay|未照合（静的抽出）|src/app/components/redesign/IntegratedTutorial.tsx:59|未確認|
|component: MissionContent|§2/3/10/18|../ui/Game04DataDisplay;./Modal|未照合（静的抽出）|src/app/components/redesign/MissionContent.tsx:1|未確認|
|state: p "status" |§2/3/10/18|../ui/Game04DataDisplay;./Modal|未照合（静的抽出）|src/app/components/redesign/MissionContent.tsx:29|未確認|
|state: p "alert" |§2/3/10/18|../ui/Game04DataDisplay;./Modal|未照合（静的抽出）|src/app/components/redesign/MissionContent.tsx:29|未確認|
|dialog: Modal "任務"|§12/18.13|../ui/Game04DataDisplay;./Modal|未照合（静的抽出）|src/app/components/redesign/MissionContent.tsx:32|未確認|
|dialog: Modal {detail.rewards?'任務の報酬':'任務の条件'}|§12/18.13|../ui/Game04DataDisplay;./Modal|未照合（静的抽出）|src/app/components/redesign/MissionContent.tsx:33|未確認|
|component: Modal|§2/3/10/18|../ui/dialogPresence|未照合（静的抽出）|src/app/components/redesign/Modal.tsx:1|未確認|
|component: NormalGachaView|§2/3/10/18|./Modal|未照合（静的抽出）|src/app/components/redesign/NormalGachaView.tsx:1|未確認|
|state: p "alert" |§2/3/10/18|./Modal|未照合（静的抽出）|src/app/components/redesign/NormalGachaView.tsx:32|未確認|
|dialog: Modal "通常登用の確認"|§12/18.13|./Modal|未照合（静的抽出）|src/app/components/redesign/NormalGachaView.tsx:34|未確認|
|state: p "alert" |§2/3/10/18|./Modal|未照合（静的抽出）|src/app/components/redesign/NormalGachaView.tsx:34|未確認|
|dialog: Modal "登用結果"|§12/18.13|./Modal|未照合（静的抽出）|src/app/components/redesign/NormalGachaView.tsx:35|未確認|
|component: PageTitleBanner|§2/3/10/18||未照合（静的抽出）|src/app/components/redesign/PageTitleBanner.tsx:1|未確認|
|component: PassiveDisplay|§2/3/10/18|../ui/Game04DataDisplay|未照合（静的抽出）|src/app/components/redesign/PassiveDisplay.tsx:1|未確認|
|component: PreparationModal|§2/3/10/18|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:1|未確認|
|dialog: CanonicalDialog "出撃準備"|§12/18.13|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:32|未確認|
|state: p {assets.failed ? "alert" : "status"} |§2/3/10/18|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:36|未確認|
|state: p "alert" |§2/3/10/18|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:43|未確認|
|state: p "alert" |§2/3/10/18|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:44|未確認|
|state: p "alert" |§2/3/10/18|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:45|未確認|
|dialog: CanonicalDialog {detail.name}|§12/18.13|../ui/CanonicalDialog;../ui/LoadingSpinner;./ElementBadge;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/PreparationModal.tsx:47|未確認|
|component: QuestView|§2/3/10/18|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:1|未確認|
|state: p {viewAssets.failed ? "alert" : "status"} |§2/3/10/18|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:130|未確認|
|state: p "alert" |§2/3/10/18|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:141|未確認|
|dialog: CanonicalDialog {`${selectedLabel} ${formalStageName(selected) ?? selected.name}`}|§12/18.13|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:154|未確認|
|state: p {encounterAssets.failed ? "alert" : "status"} |§2/3/10/18|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:155|未確認|
|dialog: CanonicalDialog {detailPanel === 'hint' ? '攻略のヒント' : '報酬を確認'}|§12/18.13|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:160|未確認|
|dialog: PreparationModal {`${selectedLabel} ${formalStageName(selected) ?? ''}`.trim()}|§12/18.13|../ui/CanonicalDialog;./PreparationModal;./BattleView;./ElementBadge;../ui/LoadingSpinner;../ui/Game04DataDisplay;./visual-bench/CharacterDisplays|未照合（静的抽出）|src/app/components/redesign/QuestView.tsx:163|未確認|
|component: RaidView|§2/3/10/18|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:1|未確認|
|state: p "alert" |§2/3/10/18|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:57|未確認|
|dialog: CanonicalDialog "終了した共闘・未受取報酬"|§12/18.13|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:68|未確認|
|dialog: CanonicalDialog "敵情報"|§12/18.13|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:69|未確認|
|dialog: CanonicalDialog "参加者"|§12/18.13|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:70|未確認|
|dialog: CanonicalDialog "報酬"|§12/18.13|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:71|未確認|
|state: p "alert" |§2/3/10/18|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:72|未確認|
|dialog: CanonicalDialog "救援依頼"|§12/18.13|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:81|未確認|
|state: p "alert" |§2/3/10/18|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:81|未確認|
|dialog: CanonicalDialog "共闘から退出"|§12/18.13|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:82|未確認|
|state: p "alert" |§2/3/10/18|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:82|未確認|
|dialog: CanonicalDialog "挑戦する段階"|§12/18.13|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:83|未確認|
|dialog: PreparationModal {`${raidDisplayTitle(master)} · ${raidEnemy(master,battleLevel??room.level).name} Lv.${raidEnemy(master,battleLevel??room.level).level} · ${raidElementLabels[raidEnemy(master,battleLevel??room.level).element]}属性`}|§12/18.13|../ui/CanonicalDialog;./PreparationModal|未照合（静的抽出）|src/app/components/redesign/RaidView.tsx:84|未確認|
|component: RecordedBattleResult|§2/3/10/18|../ui/Game04DataDisplay;../ui/uiMotion|未照合（静的抽出）|src/app/components/redesign/RecordedBattleResult.tsx:1|未確認|
|component: RedesignApp|§2/3/10/18|./RedesignShell;./GrowthView;../ui/GuideDialog;./QuestView;./RaidView;./TerritoryView;./BattleView;./FormalGachaView;../ui/BrandedLoading;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignApp.tsx:1|未確認|
|state: p "alert" |§2/3/10/18|./RedesignShell;./GrowthView;../ui/GuideDialog;./QuestView;./RaidView;./TerritoryView;./BattleView;./FormalGachaView;../ui/BrandedLoading;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignApp.tsx:253|未確認|
|dialog: GuideDialog "戦支度"|§12/18.13|./RedesignShell;./GrowthView;../ui/GuideDialog;./QuestView;./RaidView;./TerritoryView;./BattleView;./FormalGachaView;../ui/BrandedLoading;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignApp.tsx:261|未確認|
|dialog: Modal "編成・装備"|§12/18.13|./RedesignShell;./GrowthView;../ui/GuideDialog;./QuestView;./RaidView;./TerritoryView;./BattleView;./FormalGachaView;../ui/BrandedLoading;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignApp.tsx:263|未確認|
|state: p "status" |§2/3/10/18|./RedesignShell;./GrowthView;../ui/GuideDialog;./QuestView;./RaidView;./TerritoryView;./BattleView;./FormalGachaView;../ui/BrandedLoading;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignApp.tsx:264|未確認|
|state: p "alert" |§2/3/10/18|./RedesignShell;./GrowthView;../ui/GuideDialog;./QuestView;./RaidView;./TerritoryView;./BattleView;./FormalGachaView;../ui/BrandedLoading;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignApp.tsx:265|未確認|
|component: RedesignBillingReturn|§2/3/10/18||未照合（静的抽出）|src/app/components/redesign/RedesignBillingReturn.tsx:1|未確認|
|dialog: BillingStatusDialog |§12/18.13||未照合（静的抽出）|src/app/components/redesign/RedesignBillingReturn.tsx:29|未確認|
|component: RedesignCommerceOverlays|§2/3/10/18|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:1|未確認|
|dialog: FormalLoginBonusModal |§12/18.13|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:79|未確認|
|state: div "status" "ガチャ演出を準備中"|§2/3/10/18|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:86|未確認|
|state: div "status" "ガチャ結果を表示中"|§2/3/10/18|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:107|未確認|
|state: div "status" "ガチャ抽選結果を同期中"|§2/3/10/18|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:112|未確認|
|dialog: CanonicalDialog "エラー"|§12/18.13|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:188|未確認|
|dialog: ConfirmDialog |§12/18.13|../ui/CanonicalDialog;./FormalLoginBonusModal;../ui/ConfirmDialog;../ui/GlobalInteractionBlocker|未照合（静的抽出）|src/app/components/redesign/RedesignCommerceOverlays.tsx:194|未確認|
|component: RedesignShell|§2/3/10/18|../InboxPanel;../SettingsPanel;./HomeView;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignShell.tsx:1|未確認|
|dialog: Modal "メニュー"|§12/18.13|../InboxPanel;../SettingsPanel;./HomeView;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignShell.tsx:72|未確認|
|dialog: InboxPanel |§12/18.13|../InboxPanel;../SettingsPanel;./HomeView;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignShell.tsx:73|未確認|
|dialog: SettingsPanel |§12/18.13|../InboxPanel;../SettingsPanel;./HomeView;./Modal|未照合（静的抽出）|src/app/components/redesign/RedesignShell.tsx:75|未確認|
|component: TerritoryView|§2/3/10/18|./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:1|未確認|
|state: span "status" |§2/3/10/18|./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:27|未確認|
|state: p "status" |§2/3/10/18|./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:106|未確認|
|state: p "status" |§2/3/10/18|./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:109|未確認|
|dialog: Modal {`${destination.itemName}の入手方法`}|§12/18.13|./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:137|未確認|
|dialog: Modal "侵攻確認"|§12/18.13|./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:138|未確認|
|state: p "alert" |§2/3/10/18|./Modal;./ElementBadge|未照合（静的抽出）|src/app/components/redesign/TerritoryView.tsx:143|未確認|
|component: TypewriterText|§2/3/10/18|../ui/uiMotion|未照合（静的抽出）|src/app/components/redesign/TypewriterText.tsx:1|未確認|
|component: CharacterDisplays|§2/3/10/18|./CharacterDisplays.module.css|未照合（静的抽出）|src/app/components/redesign/visual-bench/CharacterDisplays.tsx:1|未確認|
|state: div {error?'alert':'status'} |§2/3/10/18|./CharacterDisplays.module.css|未照合（静的抽出）|src/app/components/redesign/visual-bench/CharacterDisplays.tsx:119|未確認|
|component: CowboyDisplay|§2/3/10/18||未照合（静的抽出）|src/app/components/redesign/visual-bench/CowboyDisplay.tsx:1|未確認|
|component: SettingsPanel|§2/3/10/18|./ui/FullScreenPanel;./ui/OutlawButton;./ui/EditableSettingSection|未照合（静的抽出）|src/app/components/SettingsPanel.tsx:1|未確認|
|dialog: FullScreenPanel "設定 / プロフィール"|§12/18.13|./ui/FullScreenPanel;./ui/OutlawButton;./ui/EditableSettingSection|未照合（静的抽出）|src/app/components/SettingsPanel.tsx:108|未確認|
|component: SetupView|§2/3/10/18|./ui/OutlawButton|未照合（静的抽出）|src/app/components/SetupView.tsx:1|未確認|
|state: div "status" |§2/3/10/18|./ui/OutlawButton|未照合（静的抽出）|src/app/components/SetupView.tsx:159|未確認|
|state: div "alertdialog" |§2/3/10/18|./ui/OutlawButton|未照合（静的抽出）|src/app/components/SetupView.tsx:206|未確認|
|component: ShopExchangePanel|§2/3/10/18|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:1|未確認|
|dialog: CanonicalDialog "活力丸を使用"|§12/18.13|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:60|未確認|
|state: p "status" |§2/3/10/18|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:67|未確認|
|state: p "alert" |§2/3/10/18|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:68|未確認|
|dialog: CanonicalDialog {`${labels[selected]}を交換`}|§12/18.13|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:72|未確認|
|state: p "alert" |§2/3/10/18|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:74|未確認|
|dialog: CanonicalDialog {usedMedicine ? "回復完了" : "交換完了"}|§12/18.13|./ui/ProductRow;./ui/CanonicalItemIcon;./ui/CanonicalDialog;./ui/OutlawButton|未照合（静的抽出）|src/app/components/ShopExchangePanel.tsx:76|未確認|
|component: ShopTab|§2/3/10/18|./ui/SubTabNav;./ui/ProductRow;./ui/CanonicalItemIcon;./ui/OutlawButton;./ShopExchangePanel|未照合（静的抽出）|src/app/components/ShopTab.tsx:1|未確認|
|state: div "status" |§2/3/10/18|./ui/SubTabNav;./ui/ProductRow;./ui/CanonicalItemIcon;./ui/OutlawButton;./ShopExchangePanel|未照合（静的抽出）|src/app/components/ShopTab.tsx:156|未確認|
|dialog: ShopExchangePanel |§12/18.13|./ui/SubTabNav;./ui/ProductRow;./ui/CanonicalItemIcon;./ui/OutlawButton;./ShopExchangePanel|未照合（静的抽出）|src/app/components/ShopTab.tsx:164|未確認|
|state: div "status" |§2/3/10/18|./ui/SubTabNav;./ui/ProductRow;./ui/CanonicalItemIcon;./ui/OutlawButton;./ShopExchangePanel|未照合（静的抽出）|src/app/components/ShopTab.tsx:173|未確認|
|component: SkillPresentation|§2/3/10/18|../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/skill/SkillPresentation.tsx:1|未確認|
|dialog: CanonicalDialog "スキル詳細"|§12/18.13|../ui/CanonicalDialog|未照合（静的抽出）|src/app/components/skill/SkillPresentation.tsx:40|未確認|
|component: SpecialGachaOffer|§2/3/10/18|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:1|未確認|
|state: p "alert" |§2/3/10/18|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:38|未確認|
|state: div "status" "登用情報を確認中"|§2/3/10/18|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:39|未確認|
|dialog: CanonicalDialog {SPECIAL_GACHA_COPY[selected.id].title}|§12/18.13|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:60|未確認|
|dialog: CanonicalDialog {`${SPECIAL_GACHA_COPY[rates.id].title} 提供割合`}|§12/18.13|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:74|未確認|
|dialog: CanonicalDialog {`${SPECIAL_GACHA_COPY[exchangeOpen.id].title} SSR交換`}|§12/18.13|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:77|未確認|
|dialog: CanonicalDialog "交換完了"|§12/18.13|./ui/CanonicalDialog|未照合（静的抽出）|src/app/components/SpecialGachaOffer.tsx:81|未確認|
|component: TitleLegalFooter|§2/3/10/18||未照合（静的抽出）|src/app/components/TitleLegalFooter.tsx:1|未確認|
|component: TitleView|§2/3/10/18|./ui/BrandedLoading;./ui/ConfirmDialog|未照合（静的抽出）|src/app/components/TitleView.tsx:1|未確認|
|state: small "status" |§2/3/10/18|./ui/BrandedLoading;./ui/ConfirmDialog|未照合（静的抽出）|src/app/components/TitleView.tsx:100|未確認|
|state: div "alert" |§2/3/10/18|./ui/BrandedLoading;./ui/ConfirmDialog|未照合（静的抽出）|src/app/components/TitleView.tsx:101|未確認|
|dialog: ConfirmDialog |§12/18.13|./ui/BrandedLoading;./ui/ConfirmDialog|未照合（静的抽出）|src/app/components/TitleView.tsx:107|未確認|
|component: TribeChatModal|§2/3/10/18|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/TribeChatModal.tsx:1|未確認|
|dialog: FullScreenPanel {chatChannel === "GUILD" ? `${userGuild?.name \|\| "同盟"} チャット` : "チャット"}|§12/18.13|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/TribeChatModal.tsx:148|未確認|
|state: span "status" |§2/3/10/18|./ui/FullScreenPanel;./ui/SubTabNav;./ui/OutlawButton|未照合（静的抽出）|src/app/components/TribeChatModal.tsx:345|未確認|
|component: TypewriterText|§2/3/10/18||未照合（静的抽出）|src/app/components/tutorial/TypewriterText.tsx:1|未確認|
|component: TutorialAuthentication|§2/3/10/18||未照合（静的抽出）|src/app/components/TutorialAuthentication.tsx:1|未確認|
|state: div "alert" |§2/3/10/18||未照合（静的抽出）|src/app/components/TutorialAuthentication.tsx:536|未確認|
|state: div "status" |§2/3/10/18||未照合（静的抽出）|src/app/components/TutorialAuthentication.tsx:577|未確認|
|component: TutorialBattlePrompt|§2/3/10/18||未照合（静的抽出）|src/app/components/TutorialBattlePrompt.tsx:1|未確認|
|state: div "alert" |§2/3/10/18||未照合（静的抽出）|src/app/components/TutorialBattlePrompt.tsx:76|未確認|
|component: TutorialFreeInstant|§2/3/10/18||未照合（静的抽出）|src/app/components/TutorialFreeInstant.tsx:1|未確認|
|component: TutorialNavigator|§2/3/10/18||未照合（静的抽出）|src/app/components/TutorialNavigator.tsx:1|未確認|
|component: TutorialRuleGuide|§2/3/10/18||未照合（静的抽出）|src/app/components/TutorialRuleGuide.tsx:1|未確認|
|state: div "alert" |§2/3/10/18||未照合（静的抽出）|src/app/components/TutorialRuleGuide.tsx:88|未確認|
|component: TutorialWorldIntro|§2/3/10/18||未照合（静的抽出）|src/app/components/TutorialWorldIntro.tsx:1|未確認|
|component: ActionButton|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/ActionButton.tsx:1|未確認|
|component: AssetChoice|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/AssetChoice.tsx:1|未確認|
|component: Badge|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/Badge.tsx:1|未確認|
|component: BrandedLoading|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/BrandedLoading.tsx:1|未確認|
|component: CanonicalDialog|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/CanonicalDialog.tsx:1|未確認|
|component: CanonicalItemIcon|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/CanonicalItemIcon.tsx:1|未確認|
|component: CompactRewards|§2/3/10/18|./Game04DataDisplay|未照合（静的抽出）|src/app/components/ui/CompactRewards.tsx:1|未確認|
|component: ConfirmDialog|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/ConfirmDialog.tsx:1|未確認|
|dialog: CanonicalDialog {title}|§12/18.13||未照合（静的抽出）|src/app/components/ui/ConfirmDialog.tsx:98|未確認|
|state: p "alert" |§2/3/10/18||未照合（静的抽出）|src/app/components/ui/ConfirmDialog.tsx:110|未確認|
|state: p "alert" |§2/3/10/18||未照合（静的抽出）|src/app/components/ui/ConfirmDialog.tsx:124|未確認|
|component: EditableSettingSection|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/EditableSettingSection.tsx:1|未確認|
|component: FullScreenPanel|§2/3/10/18|./ModalShell|未照合（静的抽出）|src/app/components/ui/FullScreenPanel.tsx:1|未確認|
|dialog: ModalShell {title}|§12/18.13|./ModalShell|未照合（静的抽出）|src/app/components/ui/FullScreenPanel.tsx:31|未確認|
|component: Game04DataDisplay|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/Game04DataDisplay.tsx:1|未確認|
|component: Game04Loading|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/Game04Loading.tsx:1|未確認|
|state: span "status" {label}|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/Game04Loading.tsx:10|未確認|
|component: GlobalInteractionBlocker|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/GlobalInteractionBlocker.tsx:1|未確認|
|state: div "status" "処理中"|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/GlobalInteractionBlocker.tsx:23|未確認|
|component: GuideDialog|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/GuideDialog.tsx:1|未確認|
|dialog: CanonicalDialog {title}|§12/18.13||未照合（静的抽出）|src/app/components/ui/GuideDialog.tsx:25|未確認|
|component: HeroPanel|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/HeroPanel.tsx:1|未確認|
|component: HubPage|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/HubPage.tsx:1|未確認|
|component: ListControls|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/ListControls.tsx:1|未確認|
|state: span "status" |§2/3/10/18||未照合（静的抽出）|src/app/components/ui/ListControls.tsx:9|未確認|
|component: ListRow|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/ListRow.tsx:1|未確認|
|component: LoadingSpinner|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/LoadingSpinner.tsx:1|未確認|
|component: ModalShell|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/ModalShell.tsx:1|未確認|
|component: OutlawButton|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/OutlawButton.tsx:1|未確認|
|component: OutlawCard|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/OutlawCard.tsx:1|未確認|
|component: PageHeader|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/PageHeader.tsx:1|未確認|
|component: PageShell|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/PageShell.tsx:1|未確認|
|component: PeriodStatus|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/PeriodStatus.tsx:1|未確認|
|component: ProductRow|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/ProductRow.tsx:1|未確認|
|component: RarityFrame|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/RarityFrame.tsx:1|未確認|
|component: ResourceDisplay|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/ResourceDisplay.tsx:1|未確認|
|component: RewardReceipt|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/RewardReceipt.tsx:1|未確認|
|component: ScreenReadinessBoundary|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/ScreenReadinessBoundary.tsx:1|未確認|
|component: ScreenState|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/ScreenState.tsx:1|未確認|
|state: section {kind === "error" \|\| kind === "forbidden" ? "alert" : "status"} |§2/3/10/18||未照合（静的抽出）|src/app/components/ui/ScreenState.tsx:43|未確認|
|component: SectionHeader|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/SectionHeader.tsx:1|未確認|
|component: SubTabNav|§2/3/10/18||未照合（静的抽出）|src/app/components/ui/SubTabNav.tsx:1|未確認|
|route: /legal/age-rating|§2/3/10/18||未照合（静的抽出）|src/app/legal/age-rating/page.tsx:1|未確認|
|route: /legal/commercial|§2/3/10/18||未照合（静的抽出）|src/app/legal/commercial/page.tsx:1|未確認|
|route: /legal/contact|§2/3/10/18||未照合（静的抽出）|src/app/legal/contact/page.tsx:1|未確認|
|route: /legal/cookies|§2/3/10/18||未照合（静的抽出）|src/app/legal/cookies/page.tsx:1|未確認|
|route: /legal/payments|§2/3/10/18||未照合（静的抽出）|src/app/legal/payments/page.tsx:1|未確認|
|route: /legal/privacy|§2/3/10/18||未照合（静的抽出）|src/app/legal/privacy/page.tsx:1|未確認|
|route: /legal/rights|§2/3/10/18||未照合（静的抽出）|src/app/legal/rights/page.tsx:1|未確認|
|route: /legal/terms|§2/3/10/18||未照合（静的抽出）|src/app/legal/terms/page.tsx:1|未確認|
|route: /legal/tokusho|§2/3/10/18||未照合（静的抽出）|src/app/legal/tokusho/page.tsx:1|未確認|
|route: /open|§2/3/10/18||未照合（静的抽出）|src/app/open/page.tsx:1|未確認|
|route: /|§2/3/10/18|./components/TitleView;./components/AuthView;./components/ui/BrandedLoading|未照合（静的抽出）|src/app/page.tsx:1|未確認|
|state: p "alert" |§2/3/10/18|./components/TitleView;./components/AuthView;./components/ui/BrandedLoading|未照合（静的抽出）|src/app/page.tsx:25|未確認|
|route: /qa/audio|§2/3/10/18||未照合（静的抽出）|src/app/qa/audio/page.tsx:1|未確認|
|route: /qa/b03-integration|§2/3/10/18||未照合（静的抽出）|src/app/qa/b03-integration/page.tsx:1|未確認|
|route: /qa/b03-result|§2/3/10/18|@/app/components/redesign/QuestView|未照合（静的抽出）|src/app/qa/b03-result/page.tsx:1|未確認|
|route: /qa/b07|§2/3/10/18||未照合（静的抽出）|src/app/qa/b07/page.tsx:1|未確認|
|dialog: FormalLoginBonusModal |§12/18.13|@/app/components/redesign/FormalLoginBonusModal;@/app/components/redesign/RedesignShell|未照合（静的抽出）|src/app/qa/b07/Samples.tsx:28|未確認|
|dialog: Modal "任務"|§12/18.13|@/app/components/redesign/Modal;@/app/components/redesign/BattleView;@/app/components/redesign/BattleResourceDisplay|未照合（静的抽出）|src/app/qa/b08-local/Harness.tsx:1|未確認|
|route: /qa/b08-local|§2/3/10/18||未照合（静的抽出）|src/app/qa/b08-local/page.tsx:1|未確認|
|route: /qa/b09-local|§2/3/10/18||未照合（静的抽出）|src/app/qa/b09-local/page.tsx:1|未確認|
|route: /qa/b10-local|§2/3/10/18||未照合（静的抽出）|src/app/qa/b10-local/page.tsx:1|未確認|
|dialog: PreparationModal "B13 出撃準備"|§12/18.13|@/app/components/redesign/GrowthView;@/app/components/redesign/RedesignShell;@/app/components/redesign/RaidView;@/app/components/redesign/PreparationModal|未照合（静的抽出）|src/app/qa/b13-local/Harness.tsx:39|未確認|
|route: /qa/b13-local|§2/3/10/18||未照合（静的抽出）|src/app/qa/b13-local/page.tsx:1|未確認|
|route: /qa/b13-missions|§2/3/10/18||未照合（静的抽出）|src/app/qa/b13-missions/page.tsx:1|未確認|
|route: /qa/b14-local|§2/3/10/18||未照合（静的抽出）|src/app/qa/b14-local/page.tsx:1|未確認|
|dialog: FormalLoginBonusModal |§12/18.13|@/app/components/redesign/RedesignShell;@/app/components/redesign/TerritoryView;@/app/components/redesign/GrowthView;@/app/components/redesign/FormalLoginBonusModal|未照合（静的抽出）|src/app/qa/b14-ui/Harness.tsx:21|未確認|
|route: /qa/b14-ui|§2/3/10/18||未照合（静的抽出）|src/app/qa/b14-ui/page.tsx:1|未確認|
|route: /qa/battle-additions|§2/3/10/18||未照合（静的抽出）|src/app/qa/battle-additions/page.tsx:1|未確認|
|route: /qa/battle-common|§2/3/10/18||未照合（静的抽出）|src/app/qa/battle-common/page.tsx:1|未確認|
|route: /qa/battle-effects16|§2/3/10/18||未照合（静的抽出）|src/app/qa/battle-effects16/page.tsx:1|未確認|
|state: p "status" |§2/3/10/18||未照合（静的抽出）|src/app/qa/battle-flow-v3/BattleFlowMock.tsx:84|未確認|
|state: p "status" |§2/3/10/18||未照合（静的抽出）|src/app/qa/battle-flow-v3/BattleFlowMock.tsx:87|未確認|
|route: /qa/battle-flow-v3|§2/3/10/18||未照合（静的抽出）|src/app/qa/battle-flow-v3/page.tsx:1|未確認|
|route: /qa/battle-full-skill-load|§2/3/10/18||未照合（静的抽出）|src/app/qa/battle-full-skill-load/page.tsx:1|未確認|
|route: /qa/battle-live|§2/3/10/18||未照合（静的抽出）|src/app/qa/battle-live/page.tsx:1|未確認|
|route: /qa/battle-presentation-v3|§2/3/10/18||未照合（静的抽出）|src/app/qa/battle-presentation-v3/page.tsx:1|未確認|
|route: /qa/common-ui|§2/3/10/18||未照合（静的抽出）|src/app/qa/common-ui/page.tsx:1|未確認|
|dialog: GuideDialog "次の戦へ"|§12/18.13|@/app/components/ui/CanonicalDialog;@/app/components/ui/GuideDialog;@/app/components/ui/Game04DataDisplay;@/app/components/ui/Game04Loading|未照合（静的抽出）|src/app/qa/common-ui/Samples.tsx:12|未確認|
|dialog: CanonicalDialog "出陣の準備"|§12/18.13|@/app/components/ui/CanonicalDialog;@/app/components/ui/GuideDialog;@/app/components/ui/Game04DataDisplay;@/app/components/ui/Game04Loading|未照合（静的抽出）|src/app/qa/common-ui/Samples.tsx:13|未確認|
|dialog: ShopExchangePanel |§12/18.13|@/app/components/redesign/RedesignShell;@/app/components/redesign/GrowthView;@/app/components/ShopExchangePanel;@/app/components/ui/ActionButton;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/ui/AssetChoice;@/app/components/ui/ScreenState;@/app/components/redesign/ElementBadge|未照合（静的抽出）|src/app/qa/common-ui-audit/Harness.tsx:19|未確認|
|dialog: CanonicalDialog "長い説明・多数件"|§12/18.13|@/app/components/redesign/RedesignShell;@/app/components/redesign/GrowthView;@/app/components/ShopExchangePanel;@/app/components/ui/ActionButton;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/ui/AssetChoice;@/app/components/ui/ScreenState;@/app/components/redesign/ElementBadge|未照合（静的抽出）|src/app/qa/common-ui-audit/Harness.tsx:20|未確認|
|route: /qa/common-ui-audit|§2/3/10/18||未照合（静的抽出）|src/app/qa/common-ui-audit/page.tsx:1|未確認|
|route: /qa/community|§2/3/10/18||未照合（静的抽出）|src/app/qa/community/page.tsx:1|未確認|
|route: /qa/device-debug|§2/3/10/18||未照合（静的抽出）|src/app/qa/device-debug/page.tsx:1|未確認|
|route: /qa/g3-gacha|§2/3/10/18||未照合（静的抽出）|src/app/qa/g3-gacha/page.tsx:1|未確認|
|route: /qa/home-live-viewport|§2/3/10/18|./TimingViewport|未照合（静的抽出）|src/app/qa/home-live-viewport/page.tsx:1|未確認|
|route: /qa/home-state|§2/3/10/18||未照合（静的抽出）|src/app/qa/home-state/page.tsx:1|未確認|
|route: /qa/identity|§2/3/10/18||未照合（静的抽出）|src/app/qa/identity/page.tsx:1|未確認|
|route: /qa/invasion-approved|§2/3/10/18||未照合（静的抽出）|src/app/qa/invasion-approved/page.tsx:1|未確認|
|route: /qa/presentation|§2/3/10/18||未照合（静的抽出）|src/app/qa/presentation/page.tsx:1|未確認|
|state: div "status" |§2/3/10/18|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:128|未確認|
|state: div "status" "キャラクター登場演出中"|§2/3/10/18|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:128|未確認|
|state: div "alertdialog" |§2/3/10/18|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:135|未確認|
|state: p "status" |§2/3/10/18|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:141|未確認|
|dialog: SkillDetailDialog |§12/18.13|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:186|未確認|
|dialog: CommonModals |§12/18.13|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:331|未確認|
|dialog: CommonModals |§12/18.13|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:367|未確認|
|state: p "status" |§2/3/10/18|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:367|未確認|
|dialog: CommonModals |§12/18.13|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:397|未確認|
|dialog: MoveBaseModal |§12/18.13|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:559|未確認|
|dialog: PrepMissionEventDialogController |§12/18.13|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:560|未確認|
|state: div "status" |§2/3/10/18|@/app/components/battle/QuestBattleViewer;@/app/components/CommonModals;@/app/components/MoveBaseModal;@/app/components/ui/PageShell;@/app/components/SetupView|未照合（静的抽出）|src/app/qa/presentation/QaPresentationHarness.tsx:616|未確認|
|route: /qa/quest-live-viewport|§2/3/10/18||未照合（静的抽出）|src/app/qa/quest-live-viewport/page.tsx:1|未確認|
|route: /qa/quest65|§2/3/10/18||未照合（静的抽出）|src/app/qa/quest65/page.tsx:1|未確認|
|route: /qa/raid-approved|§2/3/10/18||未照合（静的抽出）|src/app/qa/raid-approved/page.tsx:1|未確認|
|route: /qa/raid-detail|§2/3/10/18||未照合（静的抽出）|src/app/qa/raid-detail/page.tsx:1|未確認|
|dialog: RaidRoomDialogs |§12/18.13|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/raid/RaidRoomClearRewardPanel;@/app/components/raid/RaidRoomRescueRewardPanel|未照合（静的抽出）|src/app/qa/raid-detail/RaidDetailHarness.tsx:31|未確認|
|dialog: RaidRoomClearRewardPanel |§12/18.13|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/raid/RaidRoomClearRewardPanel;@/app/components/raid/RaidRoomRescueRewardPanel|未照合（静的抽出）|src/app/qa/raid-detail/RaidDetailHarness.tsx:31|未確認|
|dialog: RaidRoomRescueRewardPanel |§12/18.13|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/raid/RaidRoomClearRewardPanel;@/app/components/raid/RaidRoomRescueRewardPanel|未照合（静的抽出）|src/app/qa/raid-detail/RaidDetailHarness.tsx:31|未確認|
|dialog: CanonicalDialog "導線確認（Mock）"|§12/18.13|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/raid/RaidRoomClearRewardPanel;@/app/components/raid/RaidRoomRescueRewardPanel|未照合（静的抽出）|src/app/qa/raid-detail/RaidDetailHarness.tsx:33|未確認|
|dialog: RaidRoomClearRewardPanel |§12/18.13|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/raid/RaidRoomClearRewardPanel;@/app/components/raid/RaidRoomRescueRewardPanel|未照合（静的抽出）|src/app/qa/raid-detail/RaidDetailHarness.tsx:44|未確認|
|dialog: RaidRoomRescueRewardPanel |§12/18.13|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/ui/CanonicalDialog;@/app/components/raid/RaidRoomClearRewardPanel;@/app/components/raid/RaidRoomRescueRewardPanel|未照合（静的抽出）|src/app/qa/raid-detail/RaidDetailHarness.tsx:44|未確認|
|route: /qa/raid-integrated|§2/3/10/18||未照合（静的抽出）|src/app/qa/raid-integrated/page.tsx:1|未確認|
|state: p "status" |§2/3/10/18|@/app/components/redesign/RedesignShell;@/app/components/redesign/RaidView;@/app/components/redesign/BattleView|未照合（静的抽出）|src/app/qa/raid-integrated/RaidIntegratedPreview.tsx:36|未確認|
|route: /qa/raid-live-viewport|§2/3/10/18||未照合（静的抽出）|src/app/qa/raid-live-viewport/page.tsx:1|未確認|
|dialog: RaidRoomRescuePanel |§12/18.13|@/app/components/raid/RaidRoomRescuePanel|未照合（静的抽出）|src/app/qa/raid-pages/IntegratedPages.tsx:37|未確認|
|route: /qa/raid-pages|§2/3/10/18||未照合（静的抽出）|src/app/qa/raid-pages/page.tsx:1|未確認|
|dialog: RaidRoomRescuePanel |§12/18.13|@/app/components/ui/HubPage;@/app/components/ui/OutlawButton;@/app/components/raid/RaidRoomRescuePanel|未照合（静的抽出）|src/app/qa/raid-pages/RaidPagesHarness.tsx:73|未確認|
|route: /qa/raid-room|§2/3/10/18||未照合（静的抽出）|src/app/qa/raid-room/page.tsx:1|未確認|
|dialog: CanonicalDialog "戦闘への受け渡し確認"|§12/18.13|@/app/components/ui/GlobalInteractionBlocker;@/app/components/ui/CanonicalDialog|未照合（静的抽出）|src/app/qa/raid-room/RaidRoomHarness.tsx:24|未確認|
|route: /qa/raid-top|§2/3/10/18||未照合（静的抽出）|src/app/qa/raid-top/page.tsx:1|未確認|
|dialog: CanonicalDialog "導線確認（Mock）"|§12/18.13|@/app/components/ui/HubPage;@/app/components/ui/CanonicalDialog;@/app/components/ui/OutlawButton|未照合（静的抽出）|src/app/qa/raid-top/RaidTopHarness.tsx:25|未確認|
|route: /qa/recovery-live|§2/3/10/18||未照合（静的抽出）|src/app/qa/recovery-live/page.tsx:1|未確認|
|route: /qa/redesign|§2/3/10/18||未照合（静的抽出）|src/app/qa/redesign/page.tsx:1|未確認|
|route: /qa/shop-ui|§2/3/10/18||未照合（静的抽出）|src/app/qa/shop-ui/page.tsx:1|未確認|
|dialog: InboxPanel |§12/18.13|@/app/components/InboxPanel;@/app/components/ui/CanonicalDialog|未照合（静的抽出）|src/app/qa/shop-ui/ShopUiHarness.tsx:66|未確認|
|dialog: CanonicalDialog {dialog.title}|§12/18.13|@/app/components/InboxPanel;@/app/components/ui/CanonicalDialog|未照合（静的抽出）|src/app/qa/shop-ui/ShopUiHarness.tsx:67|未確認|
|route: /qa/tutorial|§2/3/10/18||未照合（静的抽出）|src/app/qa/tutorial/page.tsx:1|未確認|
|dialog: Modal {title}|§12/18.13|@/app/components/redesign/BattleView;@/app/components/redesign/HomeView;@/app/components/redesign/QuestView;@/app/components/redesign/GrowthView;@/app/components/redesign/Modal|未照合（静的抽出）|src/app/qa/tutorial/TutorialPreview.tsx:32|未確認|
|state: p "status" |§2/3/10/18|@/app/components/redesign/BattleView;@/app/components/redesign/HomeView;@/app/components/redesign/QuestView;@/app/components/redesign/GrowthView;@/app/components/redesign/Modal|未照合（静的抽出）|src/app/qa/tutorial/TutorialPreview.tsx:132|未確認|
|dialog: Modal "任務"|§12/18.13|@/app/components/redesign/BattleView;@/app/components/redesign/HomeView;@/app/components/redesign/QuestView;@/app/components/redesign/GrowthView;@/app/components/redesign/Modal|未照合（静的抽出）|src/app/qa/tutorial/TutorialPreview.tsx:169|未確認|
|state: div "alert" |§2/3/10/18|@/app/components/ui/BrandedLoading|未照合（静的抽出）|src/app/qa/tutorial/TutorialSceneAssets.tsx:27|未確認|
|route: /qa/visual-parts|§2/3/10/18||未照合（静的抽出）|src/app/qa/visual-parts/page.tsx:1|未確認|
