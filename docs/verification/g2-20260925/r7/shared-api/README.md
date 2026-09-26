# G3最新source + G2並列読取 統合候補

G3作業repoは読み取りのみ。G2ブランチへG3全体をマージしていない。候補bundleを用意しただけで配信・DB適用は未実施。

- G3基準HEAD: `12bb7b351efd40db7f404410e486e982ff12ede7`
- G3 source SHA256: 下記manifest参照。
- 追加: G2のprofile/prior/acquisition読み取り並列化。G3の `formal_gacha` / `formal_gacha_exchange` alias解決の後で対象分類する。
- `special_gacha_status` / `formal_gacha_status` も読み取り先行対象外に追加し、不要なprior/acquisition二重取得を避ける。
- G3のガチャ再送payload照合、commit_gacha、抽選/交換、ポイント/券、SSR背景解放は保持。

## 実稼働v28との照合

取得されたv28本文に正式ガチャ3種・status3種・commit_gachaが存在。認証→profile→JSON parseが直列で、今回の並列化は未反映。G2単独bundleの配信はG3を巻き戻すため不可。

v28本文とG3保存indexはminify有無が異なる。G3 sourceのesbuild再生成とv28本文のbyte一致は確認できていない。文字列集合比較ではG3再生成の数値キー0〜3だけ差があるが、これを完全一致の証拠と扱わない。配信直前の版・ソース更新確認を親が行う。

## ファイル

- `g3-parallel.patch`: G3基準sourceに適用する最小差分。
- `g3-source-with-g2-parallel.ts.txt`: 差分適用済みsourceの保存写し。importはG3 repo基準のため、このフォルダから直接buildしない。
- `index.ts.txt`: esbuild 0.25.12、G3基準依存をresolveDirにして bundle/platform neutral/format esm/target es2022/minifyで生成。

## 限定試験

`G2_G3_CONTRACT=1 G2_API_SOURCE=docs/verification/g2-20260925/r7/shared-api/g3-source-with-g2-parallel.ts.txt node scripts/verify_g2_r6_parallel_read.cjs` PASS。

通常保存・再送・auth/ID/prior/acquisition失敗・CASに加えて、G3 status2種でprior読取なし、正式ガチャaliasの再送receipt、payload不一致拒否を実source handler HTTP mockで確認。抽選そのものやlive DB/性能の合格ではない。

## 後続で並列化を落とさないための契約

G3担当が最小patchを自身の最新sourceへ統合し、上記試験とG3既存の限定検証を実行してGit保存する。それまではG3の保存済みindexを再配信すると並列化が失われる。共有API配信責任者は一人に固定し、live version/hashを直前確認、最新G3 source＋本patchから再生成する。古いbundleを再使用しない。後続G3変更があればartifact候補をそのまま配信せず再生成する。

## 配信候補の更新: live v28基準（優先）

Git再生成とliveの完全一致が未確定のため、配信候補は `live-v28-parallel.ts.txt` に変更。保存した `live-v28-original.ts.txt` をTypeScript printerで整形し、そのAPI層へ同じ最小差分のみ適用。旧Git基準 `index.ts.txt` は比較用で、今回の配信候補として使用しない。

原本→整形で全AST node種別、識別子、リテラル、構造が一致（printerが追加する構文括弧とSourceFile本文のみ比較から除外）。共通AST SHA256: `e5010c1e868b841184e1c895eac8b6fc0cd8dcf4f0e0b93ed4c12a0a90f4847e`。整形後の差分は `live-v28-parallel.patch` の4hunkのみ。既存domain部とG3の正式ガチャ・再送照合を維持した。

候補bundle SHA256: `fa790b4948dbdb8902bbd40342c84fe798b0ad597b12fe8952b7e014b6a961c8`。

限定試験: `G2_API_BUNDLE=1 G2_G3_CONTRACT=1 G2_API_SOURCE=docs/verification/g2-20260925/r7/shared-api/live-v28-parallel.ts.txt node scripts/verify_g2_r6_parallel_read.cjs` PASS。実配信bundleのAPI層（auth/read/stateFor/commit/response/handler）を抽出し、domain関数のみsource試験と同じdoubleへ接続。配信コード自体に試験doubleは含まれない。通常保存、同request再送、エラー隔離、CAS、G3 statusとpayload再送契約を確認。性能・ライブDB受入は親の配信後測定。

G2 tracked `supabase/functions/game04-redesign-api/index.ts` はsourceとの同期のため再生成したが、G3を含まないため共有APIへ配信禁止。
