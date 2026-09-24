# ローディング測定保全記録
Cloud Chrome本体・CSS iframe。実機ではない。warm代表出陣 baseline2034ms / candidate2030ms、任務2046ms /2052ms。単発で有意改善は示さない。candidate cold/warmup出陣9853ms。HTTP cache HIT headers/total10306/10335対8689/8720msは別測定でありTTIではない。API/画像/操作可能時刻の分離未取得。Performance API利用制約あり。承認済閾値との合格判定なし。実装修正（取得共通化・並列化・再マウント等抑制）と性能受入を混同しない。原本のGit保全未完。

## 継続検証（2026-09-24 UTC）

30f5/f45/7d/491候補をcloud Chromeの実API本体iframeで操作。390×568、375×844（h=812はharness仕様により844）。回線制限/実機条件は設定なし。既存セッション・画像キャッシュはwarmだが全ての資源cache状態は未取得。Home/newsは既存12秒read上限で未settle/後着/再試行の局所試験を追加し、Homeで活動データがプロフィール名取得より先に表示される挙動と再訪中の一覧保持、newsが読込状態から0件へ遷移する挙動を本体で確認した。

iframeのブラウザconsole読取はGAME04 metricを返さず、DOM read評価ではiframe文書へ到達できなかった。これを0ms/取得なし待機と解釈しない。初回表示・操作可能時刻・API・画像の分離計測/同条件前後比較は未完。今回のHTTP deploymentメタデータ応答時間は配信確認にのみ使用。UI読込が終了し操作できたことと性能基準の合格は別。法律ページから戻る一部操作はブラウザRuntime.evaluate timeoutとなり、通信断・アプリ失敗と断定せず当該復帰を未確認に残した。
