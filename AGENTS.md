# GAME04 repository instructions

## Canonical sources

- Treat `docs/architecture/COMMON_GAME_CORE_BOUNDARY.md` and `docs/architecture/COMMON_CORE_DEPENDENCY_MAP.md` as the implementation boundary.
- TRIBE NEON is a reference implementation only. Never copy its dirty working tree or import GAME03 masters, assets, values, UI, tutorial, economy, battle presentation, PvP, raid, ranking, GvG, or Tokyo-base assumptions.
- Product decisions listed as deferred in `docs/architecture/INITIAL_BACKLOG.md` must not be invented as defaults.

## Parallel task rules

- Read `docs/development/PARALLEL_PROTOCOL.md`, `docs/development/TASK_BOARD.md`, and the assigned contract under `docs/development/tasks/` before editing.
- Work on exactly one assigned task and branch. Do not expand scope or perform unrelated cleanup.
- Do not start when the task status is not `READY` or `IN_PROGRESS`, its dependency is unmet, or its planned files overlap another active task.
- Database migrations, authentication authority, shared configuration, and global application state are exclusive areas. Only one active task may own each area.
- Never edit another task's migration. New database work must use the migration version reserved in its task contract.
- Report discovered out-of-scope issues without fixing them.
- A worker may report `IMPLEMENTED` or `VALIDATED`; only the integration owner may mark a task `PASS`, `MERGED`, or `CLOSED`.

## Validation

- Run `npm run check` before handoff.
- Include the exact changed files, validation results, protected areas left unchanged, branch, commit, and merge risk in the completion report.
