# ステージボス表示修正

ユーザー追加指示（2026-09-24）により、「最終Waveのボス」を「ステージボス」へ変更。
名前・属性の直下にHP / ATK / DEFの独立した3列情報欄を追加。表示対象と同じ最終Wave代表敵の `enemy.stats.hp / atk / def` を利用し、日本語桁区切りで表示する。味方所持武将の能力値は参照しない。正式Master・選択ロジック・戦闘処理・消費は変更しない。

所持スキル表示は検討事項として保留。採用候補は「所持スキル」をタップして名前・属性・消費SP・説明を展開する方式。確定済の3能力値は常時表示する。

既存Dialog内部スクロール・固定CTAは保持。前回の背景/装飾等の未解消事項はこの限定修正で解消とはしない。

## 配信後確認

- 実装SHA: `f420a7e8ea943c0e768e60cdf80cd5a34be0a1fe`
- 固定Preview: https://game04-prwoiwzqk-kiyoshi-kitamura.vercel.app/
- Deployment: `dpl_ETJCVLZzr81cti8ijdk7epfzLJ55`。GitHub Vercel status success・表示配信情報一致。
- 390×844本体 `/` に新規QA「ボス表示検証」で入り、1-1女侍：HP650/ATK35/DEF10、ステージボス表記、人物を遮らない情報欄、挑戦CTAを確認。挑戦→出撃準備→キャンセルの往復成立。戦闘開始・消費は実施しない。
- 独立read-only監査：正式stage.wavesから選ぶ表示対象と戦闘入力の同一性を確認。今回数値/選択/戦闘API変更なし。
- [本体画面](stage-boss-stats-390.jpg)
