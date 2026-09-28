# 第二候補U11独立検証

コード `da48440a8291446cc97af9b73c298965a9b01fc6` / API v21（親照合）。
固定URL https://game04-j0kj794fu-kiyoshi-kitamura.vercel.app
Deployment `dpl_GQF7BABt565jwY3vW7NX8RqmQjBy`。
専用QA `G2QA終E` / `229ac838-28c3-48e4-a86a-45a25fbf72b9`。
390×568実寸iframe内に本体 `/` を表示、cloud Chrome。実機ではない。

## 同一候補の本体→実API→DB→再読込
1. QA新規開始→ログボday1、累計1日、武将魂2/銭10000。銭12600。
2. 任務受取可2/進行中185/受取済0=187件。キャラ5種類NM092を受取→受取可1/受取済1。DB claimedMissionIds=[NM092]。
3. 出陣1-1→3人で実戦闘→停止/倍速2→自然勝利→結果・報酬。銭13100、武将EXP小1/装備EXP小1/スキル召喚券1/前田利家。
4. 武将→くノ一→Lv育成で武将EXP小1、銭60を使用。Lv1→3、累計EXP0→100、銭13100→13040、素材1→0。
5. 同一originを再読込→タイトル→再開→本陣で銭13040を保持。ログボの二重加算なし。
6. 独立read-only SQL（専用QAのみ）：users.cash13040、neon_diamonds200、state.version6、くノ一Lv3/EXP100、clearCounts mikawa-1=1、charEXP小0/equipEXP小1、login total_logins1/魂char_reiji_01×2/DIRECT/9月24日、claimedMissionIds=[NM092]。

## 適用範囲
これはG2の代表的実接続導線の受入。新規開始を通ったがG4正式初期付与・自然進行バランスの合格ではない。72スキル全効果/65面全実戦の検証に代替しない。

## 観測残件
ログボ魂/任務券の種類名欠落を報告し、親が最終UI `7a85349` でraidPresentation.tsのみ修正。最終UIとの版差はこの報酬名1ファイル、API v21同一として追跡する。
390×568のroot scrollWidth=390。出撃準備・育成の本文スクロールとCTA到達成立。全画面全状態/実機は未確認。
