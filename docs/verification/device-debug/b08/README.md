# B08 DBG-042/043

共通契約は docs/product/GAME04_COMMON_UI_AUTHORITY.md §18.10。素材375b647/7fdc98dの原本保持、旧manifest復活なし。scripts/build_b08_display_assets.cjsで表示用画像を再生成。

- verify_b08_browser.cjs：開発専用qa/b08-local、7バナー/SP独立・実BattleView再生・5人×3装備の15操作・倍速/pause/SKIP/離脱。人員追加はレイアウト検証だけで計算結果を再計算しない。
- verify_b08_pages.cjs：既存QAの実5ページ＋共通任務Modal/召喚Hub（合成表示状態）。画像は同幅で確認。
- 充填済みは発動可能の断定ではない。保存ログは抽選前の完全適格性を公開していない。覚醒の基準は実burst_start、同じBURSTで1回。SPからBURSTを推測しない。
- 台帳の旧記録/発生版を保持。旧保存戦闘は変更なし。実機受入/音声聴取は未実施。

配信完了：00828b689f309bee5fafe15faf81b76460bd59c2。DBG-042/043と採用済みDBG-040は配信済み・実機確認待ち。稼働識別はdeployment.json、配信画像ハッシュ/375/390代表再生はdeployed.json。共通Previewと未確認事項は台帳末尾。
