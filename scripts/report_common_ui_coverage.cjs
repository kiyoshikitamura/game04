/* Combine recorded evidence, not inferred passes from component imports. */
const fs=require('fs');const dir='docs/verification/common-ui-20260927',ev=dir+'/evidence/continuation';
const cases=[];
const add=(id,surface,rule,components,mode,evidence,dimensions,notes='',status='適用確認済み')=>cases.push({id,surface,rule,components,mode,evidence,dimensions,status,notes});
for(const [group,file,surface,parts,mode] of [
 ['battle-name','battle-name-report.json','戦闘操作・名前重複','BattleView / CanonicalDialog / IntegratedTutorial','合成状態・実部品'],
 ['member-dialogs','member-dialogs-report.json','他ユーザー関連の確認','RaidView / HomeView / CanonicalDialog','合成状態・実部品'],
 ['entry-consumers','consumer-states-report.json','起動・タイトル・序盤・準備・確認','Game04EntryState / TitleView / EarlyRetentionGuide / PreparationModal / ConfirmDialog','合成状態'],
 ['storage-states','storage-states-report.json','BOX・お知らせ・所持品の状態','InboxPanel / InventoryView / CanonicalDialog','合成API応答・実部品'],
 ['home-states','home-states-report.json','本陣交流の失敗・回復','HomeView / ActionButton / Modal','合成API応答・実部品'],
 ['growth','categories-report.json','育成一覧・選択','GrowthView / ListControls / AssetChoice / ElementBadge / RarityBadge','合成状態'],
 ['growth-detail','growth-states-report.json','育成詳細・処理結果','GrowthView / GrowthControls / Modal / ActionButton','合成状態'],
 ['secondary','secondary-report.json','出撃準備/共闘/SSR選択交換','PreparationModal / RaidView / FormalGachaHub / CanonicalDialog','合成状態'],
 ['other','remaining-report.json','実利用導線','QuestView / RaidView / ShopTab / InboxPanel / CanonicalDialog','合成状態・公開route'],
 ['live','live-browser-report.json','製品本体','RedesignApp / RedesignShell / HomeView / InventoryView / InboxPanel','専用ユーザー・実API']
]){const rows=JSON.parse(fs.readFileSync(ev+'/'+file));for(const state of [...new Set(rows.map(r=>r.state))]){const own=rows.filter(r=>r.state===state);add(group+':'+state,surface+' / '+state,'§19',parts,mode,file,own.map(r=>`${r.width}×${r.height}`).join(', '),'該当画面の表示・横溢れ・導線確認。全分岐を意味しない。');}}
const fixed=[
 ['gacha-live','通常無料10連確認→開門SKIP→10件結果→利用済み','FormalGachaView / RarityBadge / CanonicalDialog','専用QAユーザー実API','gacha-report.json','375/390×480'],
 ['shared','共通通常/長名/空/失敗/無効/保存中/未解放・30行末尾','ActionButton / ScreenState / CanonicalDialog','合成状態','../representatives.json','375/390×600'],
 ['profile-save','自己紹介 保存→再取得/失敗時入力保持','SettingsPanel / EditableSettingSection / FullScreenPanel','実保存＋合成503','profile-report.json','375/390×480'],
 ['dm','DM 会話表示/送信/相手受信','HomeView / Modal / ActionButton','専用2ユーザー実API','dm-report.json','375/390×480'],
 ['community','活動生成→保存→相手表示、全体送受信・同一request重複なし','HomeView / community feed','専用2ユーザー実API','community-live.json','API＋製品UI'],
 ['present','BOX単独/一括・再取得・同時/再実行・他人/期限切れ拒否','InboxPanel / useInventory / 正式state','実RPC・専用ユーザー','presents-live.json','API＋375×600 BOX→所持品'],
 ['present-boundary','正式7素材・初期growthInventory欠落・通貨/券上限拒否','claim_present / game04_paid_item_path','Preview SQL・rollback','../../present-boundary-check.sql','非表示ロジック'],
 ['gem-exchange','既存輝石商品交換・所持反映・同一request再実行','ShopExchangePanel / ProductRow / CanonicalDialog','実API・専用ユーザー','shop-live.json','API＋375/390×600'],
 ['tutorial-scenes','チュートリアル各場面・画像読込失敗/再試行','IntegratedTutorial / TutorialSceneAssets','合成状態','intro.json','375/390×600'],
 ['tutorial-save','模擬戦途中再取得/完了保存失敗/再試行/二重操作/保存後復帰','IntegratedTutorial / BattleView','合成状態','local-tutorial-browser.json','375/390×600'],
 ['missions','任務 未着手/進行/達成/受取済み/一括/部分失敗/応答不明/日付境界','MissionContent / CompactRewards / ActionButton','合成状態','missions-verification.json','375/390×664'],
 ['b14','侵攻 通常/次未解放/開始/最終・魂不足/充足・ログイン30日/全報酬・登用4分類','TerritoryView / CompactRewards / FormalGachaHub','合成状態','b14-browser.json','375/390×600'],
 ['result','戦闘結果/戦績MVP/報酬展開・ガイド/読込・文字送り','RecordedBattleResult / CanonicalDialog / TypewriterText','合成状態','common-and-result-verification.json','375/390×664'],
];for(const [id,surface,parts,mode,evidence,dimensions] of fixed)add(id,surface,'§18/19',parts,mode,evidence,dimensions);
for(const [id,surface,parts,reason] of [
 ['oauth','Google外部認証完了/実メール認証完了','AuthView / callbacks','アカウント操作は未実行。入口・入力・コードなし戻りのみ表示確認。'],
 ['billing','実決済成立→有償BOX/VIP・購入取消/返金','ShopTab / BillingStatusDialog','実決済は未実行。既存承認商品の表示・購入確認と輝石交換は別ケース。'],
 ['paid-expiry','有償lotの120日経過・失効ジョブ','PaidAssetExpiry / billing_asset_lots','元期限を保持する実装を確認。実購入・日数経過は未実行。'],
 ['live-battle','全クエスト/共闘/侵攻・任務/ログインの実報酬条件','QuestView / RaidView / MissionContent','今回の共通UI是正で計算・報酬条件を変更しない。表示・既存合成回帰と実APIの全条件は区別。'],
 ['device','実iOS/Androidのブラウザバー・ソフトキーボード','全利用画面','375/390pxのブラウザ検証は済み。実端末固有挙動は端末確認が必要。'],
 ])add(id,surface,'§19.7',parts,'未実施','', '',reason,'未確認');
add('admin','管理KPI認証後の画面','製品UIとは別用途','admin routes','対象外','','','ゲーム内の導線なし。管理権限を取得・迂回せず、認証後の管理業務UIは変更しない。','対象外');
const counts=cases.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{});fs.writeFileSync(dir+'/consumer-cases.json',JSON.stringify({counts,definition:'画面・状態のケース。幅違いを重複加算せず、全画面数を意味しない。合成/実APIを区別。',cases},null,2));
const esc=v=>String(v).replaceAll('|','\\|').replaceAll('\n',' ');fs.writeFileSync(dir+'/consumer-cases.md','# 画面・状態の適用確認表\n\n'+JSON.stringify(counts)+'。静的抽出項目はこの合格数に加算しない。ケースごとに確認範囲を限定し、同じ画面でも合成と実APIは別記録。\n\n|ID / 画面・状態|正本 / 使用部品|確認方法・寸法|状態|証跡 / 限界|\n|---|---|---|---|---|\n'+cases.map(r=>`|${esc(r.id+' / '+r.surface)}|${esc(r.rule+' / '+r.components)}|${esc(r.mode+' '+r.dimensions)}|${r.status}|${esc(r.evidence+' '+r.notes)}|`).join('\n')+'\n');console.log(counts);
