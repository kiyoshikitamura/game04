# 領土侵攻・主催方針仮FIX 独立検証

実施日: 2026-09-23。ユーザーの主催EXP仮FIX採用に基づく。設計表は `docs/product/master_sources_20260921/numeric.md` 第5章。

実行: `node scripts/verify_game04_territory_policy.mjs`。結果: PASS。

## ドメインで実行した検査

- 正本Markdownから主催Lv1〜10の累計EXPを直接抽出し照合: 0/100/300/600/1000/1500/2100/2800/3600/4500。
- 各必要EXPの直前と到達時、上限Lv10、上限到達後の累計実績保持。
- 5城の必要Lv1/2/4/6/8、最終主催EXP100/150/250/400/600。
- 通常クエスト表示3-5と保存ID `mino-5` の対応。未クリアではLv/所持令が十分でも新規主催不可。
- 全Lv同時主催1件、令1枚、72時間。必要Lv不足、令不足、開催枠使用済みを拒否する表示投影。
- 既存Masterを変更せず新policy投影を作る。既存room snapshotの主催EXP・期間・戦闘Masterは新Master変更後とJSON再読込後も保持。
- 侵攻最終戦の3勝成立と再精算で報酬重複なし。侵攻精算でPlayerEXP・行動力は変わらない。

状態遷移検査の戦闘結果は境界検査用の合成入力。実戦バランスや本体通し操作の証拠ではない。

## SQL読解で確認した契約（DB未実行）

`scripts/game04_territory_host_progression.sql`:

- `mino-5` 既クリア/新規クリア双方に侵攻令を1枚追加する。
- `territoryUnlockGrantedVersion` を一度付与の記録とし、旧state入力からも既存記録を消さない。
- 既存資産を保持し、既クリア者への適用は未記録者に限定する。
- contextに独立主催EXP・解放状態を追加し、formal/legacy両主催RPCに解放gateを追加する。

既存 `game04_capture_territory_clear`:

- active→defeated、snapshot上の最終段階、HP0、期限内が前提。
- 最終精算後の主催本人3勝を資格とし、救援者へ主催EXPを付けない。
- 保存snapshotのclearExpを参照し、room_id一意receiptにより1回だけ付与。
- 専用 `game04_territory_progress` だけを更新し、PlayerEXP/行動力へ波及させない。

## 実接続側に残る確認

SQLは読解のみで本担当は適用していない。解放令の初回付与・backfill・再操作不増殖、最終主催EXPのreceipt一意、救援/期限切れ/途中段階不付与、未解放のAPI拒否は統合担当のdev DB/API実行結果で確定する。本書のPASSをDBやブラウザ検証済みと読み替えない。

## 統合担当のdev適用・実API追記

API v15へ配信。正式Master SQLとhost_progression SQL適用。24既存開催の適用前後checksum ee490edf3516037d739bdc9aa3e84fbb一致。専用QAの3-5達成stateを用意し、令在庫1→2、同state再保存で2のままを確認。実APIで未解放開催拒否、岡崎開催、安土Lv拒否、snapshot100EXP/12段階、令1枚消費、同要求再送で開催増殖/追加消費なし、未解放救援参加拒否、1主催枠を確認。詳細はraid-20260923/host-policy-live.json。全12段階の実API討伐は今回も未検証。
