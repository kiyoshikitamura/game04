# GAME04 product decisions

This directory separates product direction from implementation contracts.

## Authority

The GAME04 Development Start Handoff is the product authority. The architecture
documents define implementation boundaries but do not decide product behavior.
TRIBE NEON is a technical reference only; none of its product values or rules is
a GAME04 default.

The source attachment is not stored in this repository. Entries that can be
verified from the handoff summary supplied at project start are marked
`VERIFIED FROM HANDOFF SUMMARY`. Anything that needs the original attachment is
marked `SOURCE CHECK REQUIRED` and must not be approved or implemented by
inference.

## Register

[`GAME04_PRODUCT_DECISION_REGISTER.md`](GAME04_PRODUCT_DECISION_REGISTER.md) is
the working index for:

- fixed product direction;
- open decisions in dependency order;
- focused product-owner approval batches;
- source checks and contradictions.

An entry becoming approved does not itself authorize implementation. The
integration owner opens a separate implementation task with an explicit scope,
owner, branch, and acceptance criteria.

## Status vocabulary

- `FIXED DIRECTION`: a product principle that implementation must preserve.
- `PLANNED SCOPE`: an accepted planning boundary whose detailed content remains
  open.
- `OPEN`: a decision the product owner must make.
- `SOURCE CHECK REQUIRED`: the available source excerpt is insufficient; do not
  infer or implement.
- `APPROVED`: may be used only after the product owner records an explicit
  answer and date in the register.

