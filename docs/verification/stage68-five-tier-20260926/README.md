# GAME04 全68面・5段階再構成案

まず [変更サマリー](ISSUES_AND_PROPOSALS.md) を確認してください。未承認の隔離案であり、共通Previewへ未反映です。

- [全68行の監査表](AUDIT_TABLE.md)
- [修正版攻略ガイド（提案設定用）](GAME04_PROPOSED_GUIDE.md)
- [iPhone保存用TXT](GAME04_FIVE_TIER_REPORT.txt)
- [難度曲線と残る課題](DIFFICULTY_CURVE.md)
- [基準・手順・検証範囲](METHOD_AND_BASIS.md)
- [実機デバッグ担当への統合指示](HANDOFF.md)
- [敵の具体差分](enemy-patches.json)
- [確定供給・連続育成台帳](economy-proposal.json)

各面の `N-M-validated.json.gz` は元設定/提案設定、推奨状態、入力、全seed結果を保持します。`sample-trace` は全フレーム例。`validation-v1`、`round-*`、`pre-margin`、`margin-check` は途中案と敗北した独立検証を残します。`specific-card-checks`、`order-search` はカード置換・配置の選定証拠です。各ファイルがどの入力を対象にしたかを確認し、異なる案の勝敗を混ぜないでください。

DBG-047の保存戦闘再現は `../stage68-audit-20260926/DBG047-reproduction.json` と同フォルダの旧監査証拠を継承。旧ガイドの高育成条件は現行設定の参考記録に下げ、新方針の通常推奨から外しました。

保存SHAは本成果コミットと最終報告を参照。Draft PR #39: https://github.com/kiyoshikitamura/game04/pull/39
