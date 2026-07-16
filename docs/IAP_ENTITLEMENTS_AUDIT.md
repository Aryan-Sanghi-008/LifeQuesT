# IAP Entitlements Audit (Phase 18)

Client catalog: [`src/data/iapCatalog.ts`](../src/data/iapCatalog.ts)  
Server grants: [`functions/src/entitlements.ts`](../functions/src/entitlements.ts)

## Parity summary

| SKU area | Client | Server | Status |
|----------|--------|--------|--------|
| Premium / remove ads | Yes | Yes | OK |
| Coin packs (small/medium/large) | Yes | Yes | `coins_large` missing from shop grid only |
| Gem packs | Yes | Yes | OK |
| Season pass, starter pack, luck boost | Yes | Yes | OK |
| Scenario unlocks | Yes | Yes | OK |
| Avatar packs | Yes | Yes | OK |
| Cosmetic IAPs (`cosmetic_*`) | Yes (`IAP_CLIENT_GRANTS`) | **No** | **Gap** — server never writes `unlockedCosmeticIds` |
| Mystery spins grant | Client apply | Server tracks | Bootstrap sync gap in `entitlementGrants.ts` |

## Risks

1. **Cosmetic restore** — Cosmetics live in local `globalPrestige.unlockedCosmeticIds` only; reinstall loses unless re-purchased.
2. **coins_large** — Registered in IAP client + server but not listed in `IAP_CATALOG` shop arrays.
3. **starter_pack** — Inline FeaturedDeal only; not in standard catalog arrays.

## Recommended Phase 19 (post-launch)

- Add `cosmetic_*` handling to `functions/src/entitlements.ts` + Firestore `unlockedCosmeticIds`
- Extend `fetchUserEntitlements` / bootstrap to merge cosmetic unlocks
- Add automated parity test: client `IAP_CLIENT_GRANTS` keys vs server `grantsForProduct`
- Expose `mysterySpinsGrant` in client bootstrap

## Client pricing (Phase 17 — done)

See `PREMIUM_CATALOG` in `iapCatalog.ts`: Premium $0.49/mo, $2.99/yr; Remove Ads $0.99; Season Pass $1.49; scenarios $1.99–$2.99; cosmetics $0.99.

Play Console / App Store price tiers must be updated manually to match.
