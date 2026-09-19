# GAME04 領土侵攻 実装監査・統合台帳

監査基準: `2ebc36a152c91d3edcdfc23e47a108c41a0cc9b7`。
正本: `docs/product/GAME04_TERRITORY_INVASION_AUTHORITY_2026-09-20.md`。
対象ブランチ: `codex/game04-upstream-20260918`。
変更可能DB: GAME04 dev `lrgyllgzcdcphlbmkknc` のみ。

## 現実装の監査

9/20領土侵攻正本を、9/19のUnlock開催導線・主催者成長に優先する。確定事項は機構の実装対象、未FIXの数値は仮Masterとの接続対象に分ける。

| 分類 | 基準SHA時点の状態 | 今回の処置 |
|---|---|---|
| KEEP | 共有ボスLv・個別敵HP・WIN/LOSE・勝利加算・開始時Lv保存 | 個別戦闘と共有HPを維持。旧Lv結果を新Lvへ流用しない |
| KEEP | Raid全体3勝資格、参加前/資格前Lv報酬の非遡及、joinedLevel、個人Checkpoint廃止 | 領土侵攻経験値と既存討伐報酬を別管理し、資格や非遡及を維持 |
| KEEP | 基本3日/20人/救援6時間3回、appearanceLevels、終了Roomの結果・報酬入口 | 正本が変更していない仕様と既存受取権を保持 |
| MODIFY | HomeはQuest CTAのみ、Raid一覧にUnlock開催カードと解禁Dialog | Home横並びCTA・専用トップへ移動。一覧は参加/救援/再開の入口に整理 |
| MODIFY | UIは「解禁」「任意解禁レイド」、開催中Roomを1件だけfind | ユーザー表示を「領土侵攻」に統一。主催中複数件を識別して再開 |
| MODIFY | `raid_unlock` は材料1消費＋Room新規作成。領土侵攻Lv/開催枠判定なし | レベル・横断開催枠・アイテムをサーバーで判定し、消費/枠確保/Room作成を一体化 |
| MODIFY | RoomはmasterIdのみ保持し、毎回現行Masterを参照 | 開催時の期間/敵/報酬/最終Lv/経験値等の版を固定し、途中変更を防止 |
| NEW | ユーザー領土侵攻経験値/レベルは未存在 | 永続化と成長/解放Master参照を追加。共有ボスLvと別表示 |
| NEW | 最終クリア主催者経験値の台帳は未存在 | クリア確定時の主催者3勝条件、画面不在での自動一度付与、複数Room同時加算を追加 |

基準時点の参照箇所: `src/domain/redesign/raid.ts` / `types.ts`、`supabase/functions/game04-redesign-api/source.ts`、`HomeView.tsx` / `RaidView.tsx`。

## 担当と実装単位

| ID | 実装単位 | 現在地 |
|---|---|---|
| TI-01 | Home CTA、領土侵攻トップ、一覧/詳細/救援の名称・導線 | Preview反映済（接続実装） |
| TI-02 | 主催者経験値/レベル永続化、成長表/解放条件参照 | Preview反映済（接続実装） |
| TI-03 | 開催枠/必要Lv/アイテムの原子的判定、開催時Master固定 | Preview反映済（接続実装） |
| TI-04 | 最終クリア主催者3勝経験値、終了枠解放、結果/未受取入口 | Preview反映済（接続実装） |
| TI-05 | 境界条件/並行処理/既存個別戦闘の統合受入 | Preview反映済（限定統合受入） |

並行担当: Domain / DB / UI / Edge統合を分離。正本そのものは変更しない。

## 受入条件と検証記録

以下は確認した手段ごとの受入記録。正式数値・素材・全Lvバランスの承認ではない。

| 対象 | 必要な確認 | 結果 |
|---|---|---|
| 導線 | アイテム0でもトップへ遷移、開始だけ不可。理由/入手方法表示 | 360px offline fixtureで実操作PASS。物理実機未受入 |
| 開催 | レベル不足/枠満杯で部分消費なし。同時開催は上限内、同request再送同結果 | DB rollback PASS。実API Lv1/Lv2の並行2要求で200/400・枠上限/一度消費を確認 |
| 主催者成長 | 中間Lvは経験値なし、最終クリア時2勝なし/3勝一度付与 | 実API PASS。専用開始済fixtureをEdge計算 |
| 確定順 | 最終討伐の3勝目を含める。クリア後の遅延3勝目は遡及なし | 実API PASS |
| 他者クリア | 主催者不在でも自動付与、救援者には経験値なし | 実API PASS。主催累計400、救援各0 |
| 並行クリア | 同一主催者の複数侵攻で加算欠落なし/各侵攻一度 | 実API PASS。別救援者2Room同時clear計200 |
| 枠/解放 | クリア/時間切れで枠解放、未受取保持。Lv上昇で枠/対象解放 | DB rollback expired枠解放・実API期限切れclaim/Lv2開催PASS |
| 固定版 | 開催後Master更新で期間/敵/報酬/クリア経験値不変 | DB rollbackでsnapshot更新拒否・現Master変更後も既Room不変PASS |
| 既存回帰 | 個別勝敗/3勝報酬/非遡及/Lv強化/旧Lv精算/中央スクロール | 実API通常開始WIN/行動力5/旧Lv精算/敵HP6500→7475 PASS。専用Lv14 LOSE/勝利数不増PASS。360px fixtureの中央Dialog・CTA・再開・報酬受取操作PASS |

## 配信と未決事項

- 実装commit: `a74304373f6ee026b50234a879102f1f99b4306e` push済み。
- 型検査 / Build: ローカルPASS。
- dev migrations `20260919151837_territory_invasion` / `20260919152135_territory_item_label`: 適用済み。
- 現行Edge `game04-redesign-api` version 5 ACTIVE / verify_jwt=true。動作境界・実API受入はversion 4の履歴として保持。最終Repository bundleの領土侵攻札表示名同期でv5へ再配信し、v5 get_state smoke 200、territoryLevel 3 / experience 400 / active 0 / itemName「領土侵攻札」を確認しPASS。
- 最終Preview: `f539ba0c92484c6e2c0e446567555311f6265fd2` Vercel success。TI-01〜05を接続実装・限定統合受入scopeのPreview反映済とし、完了にはしない。
- URL: https://game04-git-codex-game04-upstream-20260918-kiyoshi-kitamura.vercel.app/
- 正式経験値表、初期/移行値、上限、侵攻先別経験値、開催上限、必要Lv、開催アイテム/必要数、敵/報酬量は未FIX。独自に正式値を決めない。
- 既存/仮素材を利用し、素材の正式受入はロジック受入と分離する。
- ランキング・領地所有・内政・継続収益・Production公開は今回対象外。
- 最新進捗JSONは旧42件にTI5件が加わった47件の実装サブセット。全体141件/未FIX35件は前回引継ぎ申告値のままであり、今回47件から全体率を算出しない。

## 開催受入の詳細

DB rollbackでアイテム0・必要Lv不足・枠満杯・失敗時部分消費/Room残存なし、同ID再送同Room・異payload再送拒否、開催時snapshot固定、Master更新時既Room不変、expired active Roomの枠解放と履歴保持、null Master拒否を確認。

実APIは専用QAで、Lv1並行2要求が200/400枠満杯、同ID再送Room一致、アイテム1→0。Lv2はQA fixtureで経験値100/アイテム3/既存1開催から並行2要求が200/400、合計2開催・アイテム2。正式な成長値の承認ではない。今回ホスト検証に単発通信エラーなし。

証跡: `GAME04_TERRITORY_HOST_ACCEPTANCE_20260920.json` / `GAME04_TERRITORY_DB_20260920.md`。

## クリア経験値の実API確認

開始済みbattle input/seedは専用QA SQL fixtureで準備し、Edge自身がsimulateして精算した。7境界PASS: 途中Lv討伐0、主催2勝で救援最終討伐0、主催3勝不在時100、主催最終3勝目100、クリア後に遅延3勝目非遡及、別救援者による2Room並行clear計200、再送で追加なし。主催累計400/救援各0。これらは検証用仮数量であり正式値ではない。

追加実APIでは期限切れ未受取claim、新規通常開始WIN/行動力5消費/共有Lv1→2、保存旧Lv1戦闘精算時の新HP不加算、次開始敵HP6500→7475、battleRulesのDBsnapshot一致を確認。専用Lv14の通常開始LOSE/勝利数不増もPASS。DB receipts6件（eligible4/ineligible2）の合計400と照合。3勝討伐報酬と非遡及もPASS。

最終API証跡: `GAME04_TERRITORY_API_ACCEPTANCE_20260920.json` / `GAME04_TERRITORY_ACCEPTANCE_20260920.md`。正式バランス・最終実機受入は別工程。

## 360px Preview UI受入

確認SHA: `f539ba0c92484c6e2c0e446567555311f6265fd2`。ブラウザ内360px iframeのoffline fixtureを使用し、以下を実clickで確認。dev実APIのDB/Edge受入とは別試験であり、物理スマホ実機・正式バランスの受入ではない。

- Homeの横並びCTAは各157px・同一top。横overflowなし。
- アイテム0でもトップ閲覧可、不足表示・開催不可。
- 開催確認は中央Dialog（幅326 / 高さ330）。
- 開催→Raid詳細→出撃準備（幅334 / 高さ614）へ遷移し、CTAは画面内。
- 複数侵攻をshort IDで識別して再開。
- 終了一覧→結果→報酬→受取待ち1→0と受取ボタンdisabledを確認。

TI-01〜05は同SHAでPreview反映済。数値/素材の正式承認、全Lvバランス、大規模負荷、物理スマホ実機の最終受入は未実施。全体率は更新しない。
