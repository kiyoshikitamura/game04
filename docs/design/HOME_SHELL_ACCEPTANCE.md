# GAME04 Home Shell Acceptance

## Purpose

Establish the first GAME04-specific visual shell on top of the accepted M0–M2 engineering foundation without inventing blocked M3 product rules.

The shell is a presentation contract, not approval of gameplay behavior.

## Source authority

The shell follows the current GAME04 Home UI direction and the shared visual mock:

- smartphone portrait / approximately 9:16
- player/resource header
- large central Leader Character presentation area
- bright fantasy adventurer-guild interior as the Home setting
- left-side Mission / Gallery / Ranking / Chat access points
- right-side PvP / Raid access points
- large Quest / Guild calls to action below the character area
- rotation/Gacha banner area
- five-item footer: Home / Character / Growth / Gacha / Shop
- dark navy, burgundy and antique-gold UI framing

## Product-safety boundary

The following remain presentation-only until their owning product decisions are accepted:

- PvP and Raid behavior
- Ranking behavior
- Quest rules
- Guild rules and capacity
- Character identity, art, master data and animation
- Gacha price, probability, duplicate handling and economy
- currency balances and AP rules

Therefore the shell must not hard-code fake product values or GAME03 defaults. Unapproved destinations are rendered disabled or as explicit placeholders.

## Accepted engineering behavior

- Existing Supabase authentication and Player authority remain unchanged.
- Existing display-name update RPC remains server-authoritative.
- Session-expiry, loading and error lifecycle behavior remain unchanged.
- The Home shell adds no database schema, migration, Reward, Wallet, Gacha, Character, Community, PvP or Raid authority.
- Header resource values remain `--` until approved projections exist.
- Leader Character uses a neutral placeholder until M3/M4 authorizes Character data and delivery.

## Visual acceptance target

At 390×844 and 412×915, verify:

1. no horizontal overflow;
2. header remains readable without overlapping Menu;
3. central Character slot remains the dominant visual subject;
4. left and right side actions do not overlap the primary Character face/body focus region;
5. Quest and Guild remain visible as the primary large actions beneath the visual area;
6. rotation banner and five-item footer remain reachable without browser safe-area collision;
7. disabled/unimplemented functions do not appear operational;
8. no GAME03-specific art, terminology, economy value or battle/GvG rule is introduced.

## Next connection sequence

After product gates open, connect in this order unless a later approved decision changes it:

1. approved Leader Character presentation contract;
2. approved header projections/resources;
3. approved primary navigation destinations;
4. approved Character / Growth / Gacha footer routes;
5. approved Guild / Community activity;
6. approved cooperative/competitive destinations.
