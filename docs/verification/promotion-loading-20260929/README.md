# Promotion loading fix 2026-09-29

Base: f72a1193ac77747bd37e620d568863468147caf7, including current production CCU event f9e93fe.
Public production observed at start: dpl_9gyyjf3kSkUJSyVdx5yCn8yq2cYn.

Changes: only starter/daily-free presentation and derivative build inputs. No battle/card scaling, CSS, cropping, source artwork, DB, payment, or eligibility rules changed.
Both promotion assets join the existing content-hashed WebP/immutable-cache pipeline. Unlike character artwork, promotion images retain their exact original dimensions:
- starter: 1024x1536 -> 1024x1536; 3,120,867 -> 440,838 bytes.
- daily-free: 1280x640 -> 1280x640; 1,751,192 -> 265,736 bytes.

Preload starts only after eligibility is returned, outside initial boot gates. Dialog uses common loading/error/retry UI; image and CTA wait for decode. Shown acknowledgement starts only after content commits. Retry refreshes the 90-second server reservation before revealing content. Close during preparation releases the reservation and suppresses reopening during the same visit. Preparation renewal has a 12-second timeout.

Validation: isolated React/DOM lifecycle fixture, mocked RPC (no account/payment/DB writes): slow image, error, retry, delayed decode, shown only after ready, close suppression. Run with jsdom/esbuild installed temporarily, then `node scripts/verify_promotion_loading.cjs`.
Original/current image dimensions compared using sharp. home-promotion.css and battle files are byte-identical to baseline.
Browser visual verification NOT completed: Chromium download failed; local Next dev failed in environment network-interface enumeration. Do not claim desktop/mobile visual acceptance. Cloud build and Preview status recorded separately after push.
