# キャラ配下 UI／接続 検証成果

状態：認証付き本体検証は完了。全体の完成判定は、正式スキル移行対応・正式初期付与と素材10点が未確定のため保留。

## 保存・配信

- Branch: `work/game04-character-finish-20260923`
- 表示実装SHA: `49959d27ba85c171207da772ce911b7e8ea55885`
- 固定Preview: https://game04-btsnlophl-kiyoshi-kitamura.vercel.app
- Deployment: `dpl_ApC9deG9mq17TTMqpYKX5sstXBRd`
- GitHub Deployment: `6628520633` / Preview / success
- Production公開・Production環境変更・mainマージなし。

## 証跡

- `verification-status.md`: ドメイン、fixture、実API、本体ブラウザを分離した記録。
- `live-api.md` / `live-api.json`: 専用QA実API24項目。
- `comparison-01.jpg`〜`comparison-06.jpg`: 訂正基準とQA fixtureの並置。
- `mainbody-comparison-01.jpg`〜`mainbody-comparison-06.jpg`: 固定Preview本体と訂正基準の並置。
- `fresh-mainbody-browser.json`: 本体64画面・実API9操作・再読込一致の証跡。
- `mainbody-qa-setup.md`: 通常UIから生成した専用ゲストと、検証用補充の区別。
- `materials.md`: 正式ID・画像対応と未確定事項。
- `../../design/character/2026-09-23/corrected/`: 訂正済み比較基準6枚。

## 本体検証の承認記録

自動承認レビューが専用QAセッションを用いる本体ブラウザ検証を拒否。理由は認証情報・private API dataのSupabase宛先と承認の不足。MCPで宛先 `lrgyllgzcdcphlbmkknc` がGAME04 devと確認し、公開設定一致と通信許可先制限を実装したが、再度拒否された。当時は追加の迂回・再試行を行わず停止した。

その後ユーザーから「許可します」と明示承認を受領。専用QA認証で同じGAME04 devを使用し、固定Preview本体の操作・保存・再読込を検証する作業を再開した。

承認は受領済み。再承認待ちではない。既存QAセッション方式は審査拒否を維持し、このターン通常UIで新規作成した合成QAゲストへ切り替えた（mainbody-qa-setup.md）。実ユーザー所持品・Productionは対象外。

## 一括判断が必要な正式データ・素材

1. 既存50スキルと正式72スキルの対応、対応なし所持品の保持、LB・編成の引継ぎ、正式名称・画像。正本が対応未確定と明記しているため番号順置換はしない。正式初期付与もこの接続に依存。
2. 特大EXP2点、汎用魂4点、魂選択券4点の正式画像。制作または承認済み素材対応の一括決定が必要。

未解消事項をQA fixture成功で完成扱いにしない。

## 最終修正

編成の候補一覧を押し出していた重複集計を整理。育成は人物右に現在/到達値、素材選択、費用、左右CTAを配置。保存失敗時は入力Dialog内へエラーを表示して素材数・魂内訳を保持し、編成の選択位置は保存成功時だけ更新する。共通CSSのDialog高さ上書きを修正し、レイド・クエストの認証不要18画面を再検証。故障注入3ケースは `failure-retry.json` に記録する。

## 本体実接続受入（明示承認後）

通常UIで作成した新規専用QAを用い、上記固定Preview本体で64画面・実API9操作が成功。編成順変更、装備を外す/戻す、キャラLv育成・覚醒・魂解放、スキルLB、装備Lv/LB。各操作は実API200→中央結果Dialog→閉じる→詳細/一覧反映を確認。再読込のget_stateで銭・キャラ・スキル・装備個体・編成・魂・育成在庫・素材が完全一致（version 11）。JavaScript pageerror 0、検証失敗0。親がDBを独立照合し、銭1,990,400、キャラ6体、装備12個体、先頭武将char_gou_01、version 11を確認。認証付き検証の残件は解消した。

ただし、この受入は現在接続済みの所持スキルと検証用在庫によるもの。未確定の正式72スキル移行・正式初期付与・不足画像が完成したことを意味しない。
