# Opening tutorial Preview — 2026-09-28

Approved by user at 13:07 JST. Base branch b451aa488ac77065f73d78a2798db16936dd7d73 (af79e6d implementation plus handoff documentation).
Route: /qa/tutorial-opening. Optional ?viewport=360, 375, 390 embeds the same functional flow.
Production guard remains active.

Flow: one world card → Toyotomi challenge → Oda response → isolated trailer → dark dialogue → 400ms blackout → Osaka Castle location (1400ms) → early strategist name → recruitment → trial → three characters above three skills → existing auto formation → existing Date practice → farewell → completion.
Approved dialogue corrections include automatic BURST explanation.
Osaka uses the existing 黄金期の大坂城 asset /creative/backgrounds/char_ageha_01.png.

Preview is isolated, in-memory, reload starts over. No auth, DB writes, player grants, rewards, quest progression, or analytics mutation.
Existing newTutorial/advanceTutorial provide the three grants and automatic equipment; existing createTutorialBattle provides Date practice. Normal tutorial order and server/DB are unchanged pending visual approval and subsequent versioned integration.
Trailer remains the approved recorded battle; no numerical or engine changes.
hideWaveDisplay is opt-in: hides the trailer wave header and filters only the wave lead-in, preserving start/BURST/combo effects. All existing callers retain defaults. Trailer-only QA route also uses it.

Build and browser acceptance are recorded after deployment; not claimed by this source commit.
