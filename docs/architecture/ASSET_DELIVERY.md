# Product-neutral asset delivery

## Contract

`public/assets/manifest.v1.json` is the current asset-delivery authority. Every
entry has a stable logical ID, versioned local source path, media type,
dimensions, eager/lazy loading policy, immutable cache policy, and optional
fallback reference. The manifest version changes only when its schema changes;
an asset filename changes whenever its bytes change.

`npm run check:assets` rejects malformed entries, duplicate IDs/sources,
missing files, invalid dimensions, unsupported media, missing fallbacks, and
fallback cycles before the application build.

## Cache and loading policy

- `/assets/versioned/*`: one-year public cache with `immutable` because changed
  bytes require a new versioned filename.
- `/assets/manifest.v1.json`: always revalidated because logical mappings may
  change while the schema remains compatible.
- `eager`: only for an above-the-fold system fallback or a later explicitly
  reviewed critical asset.
- `lazy`: default for non-critical content below the initial viewport.

The shared `AssetImage` component supplies declared dimensions, honors the
loading policy, resolves unknown IDs immediately, and changes to the declared
fallback after a load failure. Consumers refer to logical IDs rather than file
paths.

## Current fixtures and boundary

The two committed SVGs are abstract engineering fixtures. They do not define a
Character, rarity, game item, faction, community identity, animation style, or
other GAME04 product decision, and they are not derived from GAME03.

Character and production-content manifests remain blocked until their M3/M4
contracts are approved. They may reuse this delivery mechanism but must not
silently alter its system fallback or cache rules.
