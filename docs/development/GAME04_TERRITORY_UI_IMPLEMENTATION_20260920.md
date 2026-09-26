# 領土侵攻 UI 接続（2026-09-20）

正本: `docs/product/GAME04_TERRITORY_INVASION_AUTHORITY_2026-09-20.md`。

## 変更

- Homeのクエスト継続と領土侵攻を2列の大型CTAにする。狭い端末でも2列を維持し、長いステージ名は折り返す。
- 領土侵攻トップはアイテム・Lv・開催枠が不足しても閲覧可能。
- サーバーのTerritoryProjectionから侵攻レベル／経験値／同時開催枠、各城の特徴・敵・難易度・報酬・期間・必要レベル・アイテム名と所持数・入手法を表示する。
- 開催不可理由もサーバー投影を表示する。開催内容は中央・内部スクロール可能な共通Modalで確認する。
- 開催成功時はAPIのterritoryRoomIdからRaid詳細に直行する。再送時は同じ開催要求IDを再利用する。
- 開催中侵攻は城・ボスLv・開催日時・参加者数で区別し、複数の再開ボタンを設置する。
- Raid一覧から旧Unlock開催広告と開催ダイアログを撤去。Encounter／領土侵攻の開催中一覧、終了結果と未受取入口を保持する。
- Raid詳細・一覧・個別敵表示は開催時のsnapshotを優先するgetRoomRaidMasterで統一する。
- 開催条件・数値はUI側で新設しない。Master正式承認は別工程。

## 表示確認用経路

`/qa/redesign?view=territory` はAPI／DBを書き換えないローカルFixture。

- Homeから2列CTA、領土侵攻topへ遷移。
- 「QA 開催アイテム0」で条件不足の説明を確認。
- 「QA 開催枠とアイテム補充」で複数開催、開催確認、Raid詳細への遷移を確認。
- 再読込で初期状態に戻る。実サーバーの原子性／経験値付与の受入を代替しない。

## このlaneの検証

- typecheck PASS。
- git diff --check PASS。
- 実API／DB／公開Preview検証は親の統合工程で実施。コード変更だけでPreview反映済とは扱わない。
