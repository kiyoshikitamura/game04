# GAME04 parallel development protocol

## Purpose

This protocol allows independent Common Core work to proceed in parallel without importing unfixed GAME04 product decisions or allowing two tasks to mutate the same authority surface.

## Roles

- **Product owner:** decides product priority, deferred specifications, and human acceptance.
- **Integration owner:** creates task contracts, detects overlap, assigns branches, reviews validation, chooses merge order, applies accepted database migrations, and integrates to `main`.
- **Task worker:** changes only the assigned scope, validates it, and returns a completion report. A worker does not merge to `main`.

## Start procedure

1. Read the architecture boundary and dependency map.
2. Read `TASK_BOARD.md` and the assigned task contract.
3. Resolve the task's `BASE COMMIT` instruction to an exact SHA and record it before editing.
4. Confirm dependencies and reserved files do not overlap active work.
5. Create the assigned `codex/<task-id>` branch in a separate worktree.
6. Change only the listed `PLANNED FILES` and explicitly allowed additions.

If any check fails, report the task as `BLOCKED` before editing.

## Status

`READY → IN_PROGRESS → IMPLEMENTED → VALIDATED → PASS → MERGED → CLOSED`

- `BLOCKED` may replace `READY` or `IN_PROGRESS` when a dependency or overlap prevents safe work.
- `IMPLEMENTED` does not mean accepted.
- `VALIDATED` does not replace required human acceptance.
- Only the integration owner sets `PASS`, `MERGED`, or `CLOSED`.

## Parallel safety

The task board supports at most three active workstreams during the foundation stage:

1. **Authority slot:** database, authentication, server mutation, RLS, or RPC work.
2. **Tooling slot:** CI, static verification, developer scripts, and documentation automation.
3. **Client slot:** isolated UI adapters or components that do not decide gameplay or economy state.

Only one task may occupy a slot. The following are exclusive even when filenames differ:

- database migrations and tests;
- authentication and Player authority;
- inventory/reward/economy mutation authority;
- shared environment or deployment configuration;
- global application state;
- product master data.

## File and migration reservation

Every active contract lists `PLANNED FILES`. Two active contracts must not name the same file or parent wildcard. A newly discovered overlap stops both tasks until the integration owner chooses an owner and merge order.

Database tasks must reserve one exact 14-digit migration version before implementation. A task may not rename, rewrite, or append to a migration owned by another task. Applied dev-clean migrations are forward-only.

## Git and integration

- Branch name: `codex/<lowercase-task-id>`.
- Each worktree starts from the accepted `main` resolved to an exact SHA at dispatch, never another worker's unreviewed branch.
- Keep commits limited to one task contract.
- Workers do not push directly to `main`.
- The integration owner reviews scope, diff, validation, migration order, and current `main` before merge or cherry-pick.
- After each merge, later tasks rebase or are recreated from the new accepted baseline when their assumptions changed.

## Completion report

```text
TASK ID:
STATUS: IMPLEMENTED / VALIDATED / BLOCKED / PARTIAL
CHANGED:
- file
WHAT CHANGED:
- summary
VALIDATION:
- command: PASS / FAIL
ACCEPTANCE:
- criterion: PASS / FAIL
NOT CHANGED:
- protected area
DISCOVERED ISSUES:
- none / issue
BLOCKERS:
- none / blocker
BRANCH:
COMMIT:
MERGE RISK: LOW / MEDIUM / HIGH — reason
NEXT RECOMMENDATION:
- exactly one action
```

## Merge gate

Before integration, confirm:

- scope and `DO NOT TOUCH` compliance;
- no overlap with an active workstream;
- dependencies and base commit;
- `npm run check` result;
- migration version, RLS, grants, RPC exposure, and retry behavior when applicable;
- dev-clean result for database changes;
- human acceptance when presentation or product behavior is involved.
