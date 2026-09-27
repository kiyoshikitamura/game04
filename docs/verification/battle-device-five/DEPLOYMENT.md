# 共通Preview配信結果

状態: **配信済み・実機確認待ち**。

- PR: https://github.com/kiyoshikitamura/game04/pull/37
- 実装保存・配信SHA: `a6922ddf7b973898596a39aec58d783d62435932`
- 共通URL: https://game04-git-work-game04-common-preview-20260925-kiyoshi-kitamura.vercel.app
- Ready: `dpl_HSjDXxEcsMVwKdsvv976npqQJzZJ`
- `/api/qa/deployment` のcommitSha / branch / previewを照合済み。
- push前/alias直前に最新PR headを照合し、並走変更なしを確認。
- Supabase隔離Preview Edge v9 ACTIVE / verify_jwt=true。配信後に取得したbundle全文は保存ファイルと一致。
- 配信後375/390×600、敵1/2/3体・状態アイコン/詳細/透過帯・通常/BURST/派切替前retire・完了一回をPASS。deployed/browser.json / 同PNG6点。
- この記録を含む後続保存コミットは文書と配信後証拠のみ。稼働コードSHAは上記。

主な原因・修正・実API検証・旧結果互換はREVIEW.md。抽選不成立時のゲージ消費は正式仕様に明記されているため保持し、消費理由を追加した。新規戦闘のretireは無報酬、開始時行動力消費を保持。過去の確定済み戦闘は変更しない。

実機確認時は共通Previewを再読み込みして新しい戦闘で確認。残件は端末での受入（速度感/操作/短いブラウザ表示）。本番・main・GAME03変更なし。
