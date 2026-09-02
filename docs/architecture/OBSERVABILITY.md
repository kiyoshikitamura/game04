# Product-neutral observability transport

## Purpose and boundary

This transport answers engineering questions such as “which component failed,”
“which operation was slow,” and “which technical requests belong together.” It
does not define player behavior, Character, acquisition, retention, economy,
community, or monetization events. Those taxonomies remain blocked until their
product decisions and measurement purposes are approved.

Accepted technical signals are fixed to:

- `system.client_error`
- `system.asset_failure`
- `system.performance`
- `system.lifecycle`

Adding a name requires a reviewed contract change. Callers cannot send an
arbitrary analytics event name through this endpoint.

## Privacy and sanitization

Metadata is allowlisted to bounded operational fields: component, operation,
error code, status, asset ID, route path without query values, duration/value/
attempt numbers, and recovered/online booleans. Unknown fields are discarded on
the client and again on the server.

The transport must never contain a player ID, email, token, password, cookie,
authorization header, request/response body, query value, free-form exception
message, stack trace, or environment secret. Rejection responses use fixed
reason codes and never echo submitted content.

## Correlation and delivery

The browser creates one random correlation UUID for its current page lifetime
and a separate UUID for each signal. The correlation ID is carried in both the
validated envelope and request header; a mismatch is rejected. It is not stored
as player identity and must not be joined to product behavior.

`POST /api/telemetry` accepts same-origin JSON up to 16 KiB, validates the
technical contract, sanitizes metadata, and emits one structured JSON log to
the server runtime. Unknown signals, malformed identifiers/timestamps,
cross-origin requests, mismatched correlation, and oversized bodies are
rejected before logging.

## Current sink and recovery

The current sink is structured Vercel runtime output. No external vendor is
required for dev-clean. `SENTRY_DSN` remains a reserved server-only variable;
installing or enabling an external sink requires its own privacy, retention,
sampling, cost, and alerting decision.

The application error boundary reports only a fixed error classification,
component, operation, route pathname, and online state, then offers the shared
retry action. Raw `Error.message`, stack, and digest values are not transmitted.
