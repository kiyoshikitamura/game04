# GAME04 全画面フォントルール

対象: #30。ゲームタイトル文字は「戦国姫艶武」。画像ロゴの差替えは別管理。

既存Homeの明朝体ルールを認証、物語、武将、登用、道具、合戦、討伐、同盟、城攻め、商店、各ダイアログ、法的情報ページへ展開する。

- `--font-sengoku`を共通の書体とし、既存UI/display/inter/outfit変数も同じ書体に接続する。
- 優先順位: ヒラギノ明朝、游明朝、Noto Serif CJK JP、Noto Serif JP、OSのserif。
- ページ遅延読込みCSS・既存演出専用フォントよりGAME04の共通ルールを優先する。
- 既存の文字サイズ、太さ、配置、スクロール、ボタン動作は維持。数値はtabular-numsを利用する。
- コード・診断用のpre/code/kbd/sampは対象外。
- 外部フォント配信・追加素材を要求しない。OSにより実際のフォント字形に差があるため、最終実機確認でまとめて評価する。

実装: `src/app/layout.tsx` の `game04-theme` と `src/app/sengoku-theme.css`。
