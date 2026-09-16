# GAME04

GAME04は、ケモノ/Furryという強い嗜好Identityを起点とする一般向けIdentity-first Community Webゲームです。

中核ループ：

`Character → Push / Fandom → Community → Retention`

本RepositoryはTRIBE NEONのforkや単純コピーではなく、Common Game Coreの技術契約を再利用しつつGAME04固有仕様を分離したClean Implementationです。

## ローカル起動

```powershell
npm ci
npm run bootstrap
npm run doctor
npm run dev
```

`http://localhost:3000` を開きます。Supabase接続を検証する場合は各環境の許可Redirect URLへ `/auth/callback` を追加します。

`bootstrap` は `.env.local` を上書きせず、診断処理も環境変数の値を表示しません。詳細は `docs/development/ENGINEERING_BOOTSTRAP.md` を参照してください。

## 必須チェック

```powershell
npm run check
```

## 開発管理

開発は無制限なTask Listではなく、MilestoneとExit Gateで管理します。上位Gateは `docs/development/MILESTONES.md`、詳細な実装順序は `docs/development/IMPLEMENTATION_ROADMAP.md` を正本とします。

基本方針は **仕様確定 → 機能単位実装・Acceptance → 機能横断統合 → 最後にTutorial / First User Journey** です。

## 環境

| 環境 | 用途 | Supabase | Vercel |
|---|---|---|---|
| `development` / dev-clean | ローカル開発・自動検証 | 開発専用Project | Local |
| `preview` | PR Human Acceptance | Preview専用Project | Branch / PR Deployment |
| `production` | 本番 | Production専用Project | `main` のみ |

Supabase Project、OAuth Callback、Service-role Secretを環境間で共有しません。詳細は `docs/architecture/ENVIRONMENT_RELEASE.md` を参照してください。

## GAME03との境界

GAME03固有Master、東京7拠点、GvG Schedule、Competition Design、Economy、Tutorial Flow、UI / Art、Battle PresentationをGAME04の既定値として持ち込みません。Common Core境界は `docs/architecture/COMMON_GAME_CORE_BOUNDARY.md` を参照してください。

## Repository規約

- `src/app/`：Route / UI
- `src/lib/`：Framework横断Helper
- `src/domain/`：GAME04固有Domain
- `supabase/migrations/`：Forward-only Schema / RLS / RPC / Grant
- `docs/architecture/`：Architecture / Authority / Release設計
- `docs/development/`：開発工程 / Task / Acceptance
- `docs/product/`：Product Decision / GAME04仕様

未FIX値をProduct SourceやCanonical Dataへ入れません。ClientにOwnership、Currency、Reward、Draw、Battle Result、Privileged Social Actionを決定させません。

## ドキュメント言語

GAME04 Repositoryの人間向けドキュメントは原則として**日本語を正本**とします。Code Identifier、Library / API名、Command、File名、固有の技術用語は必要に応じ英語表記を維持します。
