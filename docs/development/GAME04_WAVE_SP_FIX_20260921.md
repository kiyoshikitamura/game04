# GAME04 6Wave・敵開始SP 限定修正

作業基準: `01328e483d3d8b6eb6bb9e7a793785543127a571`。ブランチ `codex/game04-upstream-20260918` の最新HEADと一致を確認して開始。

## 変更

- `battleBalanceV2.ts`: 新入力仕様 `rules.inputVersion = "wave-sp-v1-20260921"` で最大6Wave、各Wave最大3体。敵 `initialSp` を開始SP、`stats.sp` を上限として使用。開始SPの省略・負値・非有限値・上限超過を拒否。
- `types.ts` / `battle.ts`: 入力と結果に入力仕様版を保持。新結果には数値マスター版 `rules.balanceV2.version` も記録。
- `masters.ts`: 新規戦闘に今回の入力仕様版を指定。`quests.ts` は既存の仮配置・能力・開始値を保持し、開始SPだけ明示。`raid.ts` は各Lvの計算後上限を開始SPとして明示。両レイド満タン開始を維持。
- `formalBattleInput.ts`: 正式クエスト検証用の新規入力生成。全敵の開始SP明示と数値マスター版を必須化し、入力を複製。
- `BattleView.tsx`: 記録フレームから敵SP/上限をログ表示。6Wave表示・再生は既存の可変長経路を使用。
- QAに `?view=battle&probe=wave-sp` のローカル診断fixtureを追加。正式マスターではない。
- Edge `index.ts` は同じソースから再生成。DB構造・SQL・保存済み入力・保存済み結果の変更なし。GAME03 / Production変更なし。

## 互換処理

戦闘版 `balance-v2-20260920` と数値マスター版は変更しない。独立した入力仕様版で分岐する。

|保存入力|動作|
|---|---|
|`rules.inputVersion` なし|旧5Wave上限、敵開始SP=stats.sp。旧入力中のinitialSpは従来同様に参照しない|
|`wave-sp-v1-20260921`|6Wave、initialSpを必須で参照、stats.spを上限として使用|
|未知のinputVersion|エラー。暗黙の版昇格なし|

既存common-v2/legacy計算器は無変更。settled戦闘は保存結果をそのまま返す既存経路を保持。started戦闘の再開も保存inputから計算し、現行マスターや新しい入力版を上書きしない。既存侵攻開催のbattleRules snapshotも維持。新入力用の変換関数を旧戦闘に適用しない。

## 限定受入

`node scripts/verify_game04_wave_sp.mjs` (Node 24.19.0、追加依存なし)。

- 6Wave最終到達/勝利、7Wave・各Wave4体の拒否。
- 6Wave通算300行動、HP/SP/状態/ゲージの引継ぎ、敵全滅時BURST終了。
- 開始0/100、35/100、50/100、175/180、後続Waveの開始値、被弾SP加算/上限。
- SP不足通常攻撃、消費SP全額、敵連続行動中の反撃による被弾SP後払い、蘇生SP0。
- seed/inputの決定性、入力非破壊、JSON保存/読込後の結果・ログ一致。
- 基準SHAの無変更計算器で採取した1〜5Wave全結果のSHA256と一致。新入力で開始満タンを明示した場合も旧フレームと一致。
- 既存 `node scripts/verify_game04_battle_common_v2.mjs` 通過。
- 両レイドLv1/上限Lvの開始満タンは `scripts/verify_game04_wave_sp_integration.ts` をbundle実行して確認。

限定テストの敵・味方数値はTEST_ONLY。正式戦闘の勝率や全マスター受入完了を意味しない。

## 正式数値の検証を再開する

計算器は `src/domain/redesign/battleBalanceV2.ts`、通常入口は `simulateBattle` (`battle.ts`)。
新規の正式入力をJSONに用意し、全敵に `initialSp` を指定、`stats.sp` には上限を指定する。
`rules.balanceV2.version` に使用する正式マスター版を記録する。既存の `PREVIEW_PROVISIONAL` は計算器の設定識別子であり、今回の修正では数値全体の受入状態を変更しない。

```sh
node scripts/run_game04_formal_battle.mjs input.json NEW-output.json
```

入力形式は `{seed,party,waves,rules}`。既存と同じ能力/技能/ルール値を渡し、開始SPだけ上限と分離。CLIは新入力版を明示し、`{input,result}` を新規ファイルへ保存する。既存出力の上書きは拒否。保存済み戦闘の移行には使用しない。

10-10の6Waveはそのまま全Waveを渡す。開始SPの例: 1-1=0/100、1-2町娘=35/100、1-3直江兼続=50/100、10-10織田信長=175/180。

注意: 現行ゲームの `quests.ts` は仮配置で、正式65面の全配置/能力/報酬の移植は本修正に含めない。正式クエストはバランス側の個別敵表から上記入口へ明示入力する。仮配置を正式表と称して配信しない。

レイド接続テストを再実行する場合:
```sh
npx --yes --package=esbuild@0.25.12 esbuild scripts/verify_game04_wave_sp_integration.ts --bundle --platform=node --format=esm --outfile=/tmp/game04-wave-sp-integration.mjs
node /tmp/game04-wave-sp-integration.mjs
```

Preview: https://game04-git-codex-game04-upstream-20260918-kiyoshi-kitamura.vercel.app/qa/redesign?view=battle&probe=wave-sp
