# 追加検証（2026-09-23）

実装SHA: a21a5892be9ab7f06f7863d71304f996a8a5ec2f
Branch: work/game04-raid-host-policy-20260923
Preview: https://game04-g0toxzgha-kiyoshi-kitamura.vercel.app
Deployment: dpl_Gfi2yYveznoKT72eX43tshmypC51
Dev API: game04-redesign-api v15 / lrgyllgzcdcphlbmkknc

## 侵攻12段階（条件付き実API接続検証）

岡崎城の開催snapshotを保持して33戦（旧段階再挑戦1戦を含む）で最終討伐。
主催者EXP 0→100、主催者Lv 1→2。通常プレイヤーEXPは不変。
途中段階では主催者EXP不増。同request再送、旧段階再挑戦の現在HP不変、再読込、報酬二重受取時の資産不増を確認。
各戦の結果とsnapshotは invasion-live-results.json に記録。

条件: 使い捨てQA RQAPolA にSR5人Lv100/覚醒5、初期行動力1000を準備。
敵・共有HP・報酬は保存された正式Masterのまま。途中補充なし、最終行動力340。
通常の育成・行動力条件による最終受入や、ブラウザで33戦操作した証拠ではない。
実装中のプレイヤー能力計算を利用しており、正式成長表との全面一致を追加証明するものではない。

## 同一最新Previewの本体画面

body/raid-policy-list.jpg、raid-policy-detail.jpg、raid-policy-lower.jpg。
実API本体、1363×936px、必要画像の読込完了後に撮影。下部は同じ詳細のスクロール。
担当内目視で重大な重なり・Header/Footerによる隠れなし。
未参加表示は実状態。完全一致の判定ではない。
初回起動のチュートリアル画像読込失敗は一度の再試行で解消。
主催画面で主催者EXP、5城の条件、3-5未達時の開催無効化を確認。

## 未完了・阻害

- 390px／1536pxの本体3状態撮影と厳密比較。提供ブラウザのbrowser/tab capabilitiesにviewport変更がなく実施できない。1363px画像を代用完了にしない。
- 通常の育成・行動力条件での通し受入。初期QA資産を準備した今回の結果では閉じない。
- dev行動力は現在50上限・180秒回復。資料の100・300秒とは未一致。今回のレイド残件で全体仕様を無断変更していない。

Production配信、Production DB変更、main mergeは実施していない。
