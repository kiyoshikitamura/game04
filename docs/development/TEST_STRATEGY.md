# GAME04 test strategy

## Layer ownership

| Layer | Purpose | Required trigger | Owner |
| --- | --- | --- | --- |
| Unit | Pure rules, parsers, validation, and adapters without network access | Every pull request and `main` push through `npm run check` | Code owner |
| Repository contract | Migration pairing, task reservations, and repository invariants | Every pull request and `main` push through `npm run check` | Integration owner |
| Browser acceptance | User-visible shell and shared lifecycle behavior in a production build | Every pull request and `main` push in the browser CI job | Client owner |
| Database contract | Catalog, authority, transaction, and replay behavior on dev-clean | Protected manual workflow after migration review/apply | Authority and integration owners |

## Local commands

```powershell
npm run test:unit
npm run check
npm run test:browser
```

The first browser run may require `npx playwright install chromium`. Browser
tests use the disconnected shell and do not require credentials.

Database contracts are intentionally excluded from routine local and pull
request checks. They can alter temporary database state inside transactions and
must never receive a production connection. The protected workflow requires
the GitHub `dev-clean` environment and its `DEV_CLEAN_DATABASE_URL` secret. The
runner also requires `TARGET_ENVIRONMENT=dev-clean`, refuses missing or visibly
production-labelled connections, and never prints the connection value.

## Failure meaning

- Unit failure: a deterministic code contract changed or regressed.
- Repository-contract failure: delivery structure is unsafe or incomplete.
- Browser failure: the production-built shell is not usable as accepted.
- Database-contract failure: stop deployment; inspect sanitized catalog or
  behavioral evidence and correct forward with a new migration when needed.

Passing one layer does not substitute for another. Human product acceptance is
added later only after Circle-approved GAME04 behavior exists.
