# GAME04 engineering bootstrap

## Supported path

From a fresh checkout, use the locked dependency graph and create a local-only
environment file:

```powershell
npm ci
npm run bootstrap
npm run doctor
npm run check
npm run dev
```

`bootstrap` copies `.env.example` only when `.env.local` does not exist. It
never replaces existing local values. Both files contain variable names, but
only `.env.example` is committed.

## Readiness levels

`npm run doctor` accepts an empty Supabase URL and publishable key. This proves
that the disconnected Title/Home shell can be developed without a shared
credential. It rejects a partial pair, an invalid URL shape, an unsupported app
environment, a missing dependency installation, or a public variable name that
would expose a server secret.

After local dev-clean values have been supplied, use:

```powershell
npm run doctor:services
```

This stricter check requires both public Supabase values. Neither diagnostic
prints their contents. `SUPABASE_SERVICE_ROLE_KEY` and `SENTRY_DSN` are
server-only and are not needed by the disconnected shell.

## Failure recovery

- Missing dependencies: run `npm ci` from the repository root.
- Missing `.env.local`: run `npm run bootstrap`.
- Partial Supabase configuration: set both public values or leave both empty.
- Wrong runtime: install Node.js 22 or newer, then rerun `npm ci`.
- Connected login failure after diagnostics pass: verify the dev-clean callback
  URL separately; diagnostics validate configuration shape, not remote service
  availability.

Do not paste credentials into issues, acceptance records, or command output.
