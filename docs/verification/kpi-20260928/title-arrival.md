# Title arrival UU — 2026-09-28

User requested title arrival measurement after discovering production acquisition RPCs were absent. Adds a dedicated anonymous write-only RPC; no authentication identity is created by measurement. Browser UUID is random and persisted in localStorage; the database stores only its SHA-256 hash, server timestamp and auth.uid when available. Same browser is counted once within each requested daily/monthly period. A page event UUID makes retries and React effect re-entry idempotent. Later authentication binds the same arrival to the account for QA exclusion. Different browser/device, storage reset or disabled storage can increase browser UU; this is not verified-person UU. Known excluded account browsers are omitted; unlinked anonymous test visits cannot be identified.

KPI remains Preview-hosted, reading only GAME04 production. New title UU column uses null/未計測 before first arrival, and labels first measurement timestamp; first day/month is partial. Historical title traffic cannot be backfilled. No changes to new-user or tutorial definitions in this patch.

Production base: current deployed 4aad9935f6e6b574a908f4a8e27be50fe70be011, branch head 0c79ecd73bc5435004cd6a7ae8141e63ea8422d5 (documentation only above deployed commit). Preserve all latest device fixes. KPI changes go to common Preview independently.
