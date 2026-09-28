# GAME04 レイド統合 最終提出

採用済み主催方針の仮FIX・素材17点を反映し、レイド統合と今回の検証を完了。正式レベルデザインはユーザー指定の後工程。

| 固定対象 | 保存先 |
|---|---|
| Repository | kiyoshikitamura/game04 |
| 実装Branch | work/game04-raid-formal-input-20260923 |
| 実装SHA | [87161e39388cb73338adbaae6cf81f7c3d34ca50](https://github.com/kiyoshikitamura/game04/commit/87161e39388cb73338adbaae6cf81f7c3d34ca50) |
| 固定Preview | https://game04-jsmckf7gy-kiyoshi-kitamura.vercel.app |
| Deployment | [dpl_3FccssN2pxXVvtdbnp8h5TVErmaS](https://vercel.com/kiyoshi-kitamura/game04/3FccssN2pxXVvtdbnp8h5TVErmaS) READY |
| dev | lrgyllgzcdcphlbmkknc / game04-redesign-api v16 |
| 証拠保存Branch | work/game04-raid-final-evidence-20260923（本書と同じcommitに全実装・証拠を保存） |

## 一式の内容

- [本体3状態×390px／1536pxの比較](final-visual-comparison.md)／[6枚と承認モックの比較HTML](final-comparison.html)。実API本体を実寸撮影、画像読込完了後に比較。390pxの詳細下部余白も修正後の同一Previewで確認。
- [正式Master対応表](formal-master-mapping.md)：25ボス・85出現組合せ、侵攻5城×12段階、人物・属性・数値・素材識別子・正式報酬。
- [素材対応表](../../design/raid/2026-09-23/WORK_ASSET_MAPPING.md)／[採用manifest](../../design/raid/2026-09-23/WORK_ASSET_MANIFEST.json)：新規17点採用済み、背景の今後追加可。
- [侵攻専用主催者EXPの仮FIX仕様](../../product/GAME04_RAID_HOST_POLICY_PROVISIONAL_2026-09-23.md)。通常ユーザーEXPと分離。旧snapshot・開始済み戦闘・既存資産を保持。
- [最終Preview本体の通し操作](final-ui-evidence.json)：参加→4戦4勝→毎回同一詳細復帰→3勝資格→討伐→再読込→終了履歴→報酬受取→受取済み無効化→再読込。累計42,659、受取前14,600銭→19,600銭。
- [最新API境界](final-boundary-live.json)：期限切れ・満員・退出後参加／出撃・不足・失敗時非消費・参加／救援の重複防止。[初期N編成の実敗北](final-loss-live.json)：報酬なし、再送・再読込でも増殖／追加消費なし。
- [侵攻の通常行動力からの試行](natural-invasion-live.json)と[救援継続・12段階討伐／受取／二重受取防止](natural-rescue-live.json)。同一開催でレイド30戦＋クエスト47戦。[77戦すべての正式入力DB監査](natural-formal-input-audit.json)。
- [配信固定情報](deployment-formal-input.json)、[全履歴・条件](STATUS.md)。型検査、正式Master照合、全60体の能力値基準点照合、Preview build成功。

## 検証条件

勝利操作は専用QAの事前育成済み正式N編成Lv50、侵攻は正式SR編成Lv100を使用。敵・共有HP・正式報酬は変更せず、操作途中の行動力補充なし。侵攻単独試行は第12段階途中で不足となり、正規救援で同一開催を討伐した。失敗記録も保持する。新規プレイヤーの自然育成・単独攻略難度・将来の正式レベルデザインまで受入済みとはしない。

dev全体の行動力は既存の上限50／180秒回復を保持。資料100／300秒への全体変更は今回のレイド対応に含めない。Production公開・Production DB変更・mainマージなし。

## 引き継いだGit保存先

| 記録 | SHA固定リンク |
|---|---|
| 開始点・検証記録 | [5963698663e96bfa909c0cbb3b7c45c5db21f2ef](https://github.com/kiyoshikitamura/game04/commit/5963698663e96bfa909c0cbb3b7c45c5db21f2ef) |
| 承認モック | [b0975f68a0e7f955b6055bed07aeca1dfa8e169c](https://github.com/kiyoshikitamura/game04/commit/b0975f68a0e7f955b6055bed07aeca1dfa8e169c) |
| Work初回統合 | [237c1562d47275f02fb3274c8aacfdb1358409b3](https://github.com/kiyoshikitamura/game04/commit/237c1562d47275f02fb3274c8aacfdb1358409b3) |
| 主催仮FIX・初回侵攻証拠を含む保存 | [7203f76071d23a82966beab8b214940c493e2d79](https://github.com/kiyoshikitamura/game04/commit/7203f76071d23a82966beab8b214940c493e2d79) |
| 正式能力値・API v16 | [03cff92c96261d22e7e06c9fe60cb0c5659e6873](https://github.com/kiyoshikitamura/game04/commit/03cff92c96261d22e7e06c9fe60cb0c5659e6873) |
| 最終実装 | [87161e39388cb73338adbaae6cf81f7c3d34ca50](https://github.com/kiyoshikitamura/game04/commit/87161e39388cb73338adbaae6cf81f7c3d34ca50) |

最終証拠commitは最終実装を親として保持し、コードの巻き戻し・旧Branch全体の上書きを行っていない。
