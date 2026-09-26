# 値import後の条件付き利用経路

import到達は描画保証ではない。元161項目は全Next route/layout/routeを起点とする値import・再export・literal dynamic importで到達なし（67ファイルは後から未使用になったModalShellを含む）。画面数へ加算しない。

|定義/状態|現行利用経路・条件|扱い|
|---|---|---|
|旧scout演出・結果|handleScoutの画面呼出元GachaTabはルートから到達なし。現行はRedesignApp→FormalGachaHub/FormalGachaView。無料10連の実応答・結果は別証跡|RedesignCommerceOverlaysから重複描画を除去。旧コンテキスト/QAと抽選ロジックは保持|
|SeasonHonors設定欄|現行RedesignShellはSettingsPanel redesignを常に渡す。SeasonHonors描画は!redesignのみ。isSeasonHonorTitle関数利用をUI描画と扱わない|現行ゲームの表示対象外。旧QA互換部品は保持|
|ConfirmDialog旧BattleResultSummary|現行TitleView/RedesignCommerceOverlaysはpresentation=canonical。legacy指定かつバトル結果タイトルの場合だけ旧結果を描画|現行はRecordedBattleResult。旧QA互換部品は保持|
|削除・置換した静的行|旧一覧の位置を追跡用に残す。IntegratedStartの直書きエラーはGame04EntryStateへ置換|過去行を新画面/合格数へ加算しない|

製品の動的条件をすべて網羅したという主張はしない。各画面・状態と証跡はconsumer-cases.mdで明示する。

追加確認：RaidView の「挑戦する段階」はmodal=levelの描画定義があるが、現行コードにlevelを設定する操作がない。現行の挑戦はprepareへ直接進むため、この旧分岐は表示対象外（コード条件の根拠）。退出確認は他ユーザーが開催した共闘の参加者だけが対象であり、開催者fixtureの成功を退出確認の合格へ転記しない。
