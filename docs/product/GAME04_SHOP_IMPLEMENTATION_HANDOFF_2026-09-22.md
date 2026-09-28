# GAME04 ショップ・交換所 実装引き継ぎ（2026-09-22）

## 参照した正本

- `docs/product/GAME04_MASTER_AUTHORITY_LATEST_2026-09-21.md`（Shop／Economy統合入口。個別の古い未FIX案より優先）
- `docs/product/GAME04_COMMON_UI_AUTHORITY.md`
- `docs/product/master_sources_20260921/shop.md`（既存処理との照合用。統合入口と矛盾する未FIX案は採用しない）
- `src/domain/gameplay/canonical/items.ts`、`src/domain/redesign/masters.ts`、`src/domain/redesign/types.ts`

## 今回反映した範囲

- GAME04正式名称をショップ表示へ反映：`銭`、`輝石`、キャラ券／スキル券／装備券、活力丸、正式パック内容。
- 価格・購入回数・付与内容を統合Masterへ合わせ、輝石商品のボーナスを廃止。
- ショップから決闘状・討伐令を除外。既存の所持データ／履歴は削除・変換しない。
- 交換所をショップの配下へ接続。輝石→活力丸／銭／領土侵攻解放素材、固有魂→同一レアリティ汎用魂を正式定義で処理。
- 交換処理は `game04-redesign-api` の既存 `requestId` と期待version付きcommit経路を使用し、二重実行・二重消費を防ぐ。Edge用 `index.ts` は `source.ts` から再生成済み。
- QAはインメモリ状態で交換成功・不足・入力上限を確認できる。QA模擬表示と実データ接続は同一扱いにしていない。

## 未確認・別ライン依存

- 外部決済の本番設定・実課金は対象外。Vercel Previewではsandbox表示のみ。
- 有償パックの `CHAR_EXP_XL`、`EQUIP_EXP_XL`、`SOUL_SELECTOR_SSR`、`SKILL_LB_PART` はショップ表示／カタログへ反映したが、現行Item Master／付与処理側の正式識別子がこの作業範囲では特定できない。未定義IDを別素材へ変換していないため、実課金付与の受入は未完了として扱う。
- Supabase devへの本番Edge deploy／DB catalog更新は、親のDB・統合・配信担当へ引き継ぐ。PreviewのQA模擬表示は実データ接続の証跡ではない。

## 受入区分

- 実装完了：Typecheck、`NEXT_PUBLIC_USE_MOCK_DB=true` でのBuild、QA交換処理接続、Preview用Edge bundle更新。
- ユーザー実機受入待ち：ショップ→クエスト→レイド→キャラ→マイページ→領土侵攻の連続導線、実devデータでの交換・付与、モバイル端末での最終表示。
