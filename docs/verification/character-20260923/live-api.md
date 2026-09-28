# Character live API verification

2026-09-24T01:42:42.573Z

Dedicated GAME04 dev QA account only. 24/24 checks passed. The deployed below-minimum soul-exchange error uses a Japanese comma where the local domain uses a middle dot; punctuation was normalized for that rejection assertion, with the original mismatch retained in live-api.json. Each successful action matched the local growth domain, replayed the same request ID without extra spending, and survived get_state reload. Rejections preserved growth inventory and deck state. Awakening preserved character level.

- PASS: character level
- PASS: character awakening
- PASS: character unlock
- PASS: soul exchange minimum ten
- PASS: soul selection
- PASS: skill LB
- PASS: equipment level
- PASS: equipment LB
- PASS: equipment protect
- PASS: protected dismantle rejected
- PASS: deck persistence
- PASS: assigned dismantle rejected
- PASS: trained confirmation required
- PASS: trained confirmed dismantle
- PASS: single dismantle
- PASS: bulk dismantle
- PASS: insufficient EXP rejected
- PASS: insufficient souls rejected
- PASS: invalid exchange below ten
- PASS: already owned unlock rejected
- PASS: character reach unlocked cap
- PASS: character level cap rejected
- PASS: equipment reach unlocked cap
- PASS: equipment level cap rejected

Character and equipment unlocked level caps are exercised by GAME04_QA_CAPS_ONLY=1. Awakening and LB maximum caps were not exhausted in this live run. No production writes.
