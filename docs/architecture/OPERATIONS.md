# Product-neutral operations foundation

## Boundary

M2 owns only application availability and its safe administration path. The
sole seeded key is `application`; no Character, Gacha, economy, community,
battle, event schedule, or GAME03 flag is defined. Later product features must
receive their own approved authority before adding operational keys.

## Read path

`get_public_operational_state()` returns only key, bounded state, message code,
and timestamp. The application reads it server-side with the public Supabase
key. Missing configuration, timeout, invalid data, and read failure all resolve
to `enabled` so the status dependency cannot independently create an outage.

The root availability boundary renders a fixed maintenance or disabled message.
It never renders operator input or database error text. The engineering
operations page remains reachable so state and presentation can be diagnosed.

## Write path

Direct table access is revoked. `set_operational_feature_state(...)` is granted
only to `service_role` and also verifies the JWT role. Every operation requires
a UUID request ID, is idempotent for the same payload, rejects conflicting
replay, and appends an immutable audit row before updating state.

The repository command is intentionally not a web administration UI. It
requires `TARGET_ENVIRONMENT=dev-clean`, verifies the URL against an explicit
project ref, keeps the service credential server-side, and reports only request,
audit, key, state, and message-code identifiers. Preview and production remain
deferred.

## Failure and recovery

- Read outage or malformed projection: fail open and log through the existing
  technical observability boundary when a caller chooses to report it.
- Failed write: state and audit remain atomic; retry with the same request ID at
  the RPC boundary.
- Incorrect state: issue a new audited request; audit history is never edited.
- Schema correction: add a new forward-only migration; never edit an applied one.
