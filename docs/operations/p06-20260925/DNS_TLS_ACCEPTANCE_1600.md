# P01 DNS/TLS確認（2026-09-25 16:00 JST頃）

ユーザーよりDNS保存済みの報告を受領し、公開DNSとHTTPSを再確認。

|確認|結果|
|---|---|
|apex A|sengoku-hime-ennbu.com → 216.150.1.1、TTL3600、DNS Status0|
|www CNAME|346e02207322e8c5.vercel-dns-016.com.、TTL3600、DNS Status0|
|NS|01/02/03/04.dnsv.jp、Status0|
|Vercel apex/www|両方Valid Configuration|
|www転送設定|308 → sengoku-hime-ennbu.com。匿名応答は認証保護が先に作用するため308実到達は未確認|
|TLSと匿名保護|apex/www/project-0jsj9.vercel.app全3ホストで証明書検証付きHTTPS成功、GET / は302 → https://vercel.com/sso-api。Cookie/Authorizationなし、リダイレクト追随なし|
|保護設定|SSO Protection enabled=true / all をconnectorで再確認|

正式URL: https://sengoku-hime-ennbu.com 。ゲーム公開なし。今回DNS/外部設定を変更したのはユーザーで、本担当は読取検証・本記録保存のみ。
お名前.comのAホスト名@は空欄と同等（https://help.onamae.com/answer/7885）。先行回答の空欄必須指示は訂正済み。

DNS/TLS接続は確認済み。認証後receiver health200、Supabase管理設定readback、P02/P03本番実接続、G5後M/G6は引き続き未完。既存のsignup停止実施報告/backup添付確認は維持し、再実施を要求しない。
