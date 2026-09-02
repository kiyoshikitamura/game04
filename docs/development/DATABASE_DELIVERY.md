# GAME04 database delivery

## Purpose

Deliver forward-only Common Core database changes to `game04-dev-clean` with an auditable separation between repository checks, database application, database verification, application deployment, and final evidence. Never put credentials, access tokens, user data, or secret values in commands, screenshots, logs, or acceptance records.

## Required artifacts

For migration `supabase/migrations/<version>_<name>.sql`, add the catalog contract test:

`supabase/tests/<version>_<name>_contract.sql`

This pairing is mandatory for every migration whose version is `20260902000003` or later. The repository checker validates it offline and requires an exact filename match. A catalog contract test checks the resulting schema, functions, policies, grants, and revocations. Behavioral replay is separate and proves transaction, authorization, and idempotency behavior using controlled test actors.

## Delivery sequence

### 1. Prepare and review

1. Confirm the task owns the exact migration version and database authority area.
2. Confirm the branch starts from the current accepted `main` commit.
3. Review the migration as forward-only. Do not rewrite a migration already applied to dev-clean.
4. Add the same-name catalog contract test and any task-specific behavioral replay procedure.
5. Run `npm run check` without database credentials. A failure stops delivery.

### 2. Apply the migration

The integration owner applies only the reviewed migration to `game04-dev-clean`. Record the environment, source commit, migration filename, executor, and timestamp. Do not combine unreviewed migrations or application deployment with this step.

If apply fails, stop. Preserve the database error without secret values, leave the source migration unchanged if it may already have partially executed, inspect actual catalog state, and prepare a new forward-only correction when required.

### 3. Validate the catalog

Run the paired contract test against the migrated dev-clean database. Confirm the expected tables, constraints, indexes, RLS policies, function security, grants, and revocations. Record PASS or the sanitized failure. Catalog PASS means the authority surface exists as designed; it does not prove runtime behavior.

### 4. Replay behavior

Run the task's controlled behavioral replay independently of the catalog test. At minimum, cover the contract's permitted actor, denied actor, retry/idempotency behavior, transaction atomicity, and projection/result shape when applicable. Use disposable test identities or fixtures and remove them according to the task procedure. Do not record credentials or personally identifying data.

If replay fails, do not deploy the application. Fix through a new forward-only migration when the applied database must change.

### 5. Deploy the application

After migration apply, catalog PASS, and behavioral replay PASS, deploy the compatible application commit. Verify the deployment references the reviewed commit and the dev-clean public configuration only. Application deployment does not replace database acceptance.

### 6. Record final evidence

Copy `docs/development/acceptance/TEMPLATE.md` to a task-specific evidence record. Complete every field with secret-free facts and links or identifiers that remain accessible to reviewers. The integration owner confirms repository check, apply, catalog validation, behavioral replay, deployment, and rollback posture before marking the task PASS.

## Failure and rollback posture

- Before database apply: abandon or revise the branch; no database rollback is needed.
- After database apply but before application deploy: stop delivery and create a new forward-only corrective migration. Do not edit or re-run a changed version of the applied migration.
- After application deploy: restore application compatibility by redeploying a known compatible commit when safe, then correct database state forward. Do not assume schema rollback is safe.
- For security exposure or destructive data risk: stop traffic-affecting rollout, preserve sanitized evidence, and escalate to the integration owner immediately.

## Gate summary

| Gate | Proof | Blocks |
| --- | --- | --- |
| Repository contract | Offline `npm run check` PASS | Migration apply |
| Migration apply | Version recorded on dev-clean | Catalog validation |
| Catalog validation | Paired SQL contract PASS | Behavioral replay |
| Behavioral replay | Authority and retry cases PASS | Application deploy |
| Application deploy | Compatible commit ready | Final acceptance |
| Final evidence | Completed acceptance record | PASS/MERGED/CLOSED |
