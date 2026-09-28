# R08 actual battle start measurement protocol

Environment: dedicated browser tab 4, Chrome cloud browser; QA-C display user `G2R6表示QA`; actual app embedded at 390×568 via `/qa/home-live-viewport?width=390&height=568`. This is not iPhone/Safari or controlled Wi-Fi/4G/5G evidence. New tab does not guarantee a cold cache. The five independent cold runs are not covered.

Operation: Quest → 三河の地 → 1-1 → 挑戦 → 出撃準備 → 出撃する. Start timestamp is the actual iframe pointerdown; click timestamp is recorded separately. Repeated runs start from 再挑戦 → 出撃する, with the same stage/party; rewards from prior runs remain actual saved results.

Metric separation:
- `request / quest_battle`: authenticated API request through parsed response.
- `image-group / battle`: initial BattleView image group (cached images included, new result only).
- `action-feedback`: busy state React commit; not the battle-ready endpoint.
- `action-result`: response-state React commit; not the battle-ready endpoint.
- QA target `戦闘再生開始`: a rendered battle section with frame index >=0, playback not paused/blocked/finished, no open dialog, and an unobstructed center hit target, observed for two animation frames. This includes the initial wave frame in which the playback clock runs; it does not add the deliberately timed initial frame duration by waiting for frame 1.

The start criterion is actual playback readiness, not only the existence of SKIP/pause controls. The inspection script never advances playback or changes game state. After the timing sample is collected, ordinary UI speed/skip may be used to reach the result; this is outside the start interval.

Instrumentation files: BattleView.tsx (read-only data attribute + initial image timing), InteractionProbe.tsx (explicit QA battle endpoint), redesignQaTelemetry.ts (allowlisted battle image scope). Typecheck PASS before submission for deployment. Final sample manifest must specify the actual deployed SHA and active API version.

Pre-instrumentation exploratory run: quest API 3765.1ms; busy feedback 4.4ms; action-result 3772.3ms; pause-button hit-test 6224.9ms from click (6232.0ms from pointerdown). Images were not yet separately timed. This run is a baseline observation, not one of the 20 battle-start samples and not a cold-boot measurement. Raw UI evidence: battle-baseline-ui.json.
