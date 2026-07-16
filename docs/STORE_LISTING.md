# LifeQuest — Google Play Store Listing & ASO Checklist

English-first listing for **Google Play**. Primary market: **US**. Variant notes for **UK / Canada / Australia**.

Cross-reference: [STORE_RELEASE_P0.md](./STORE_RELEASE_P0.md) (technical release), [ACCESSIBILITY.md](./ACCESSIBILITY.md).

> OTA / `expo-updates`: **deferred** for first Play release. No `runtimeVersion` policy required until OTA is enabled.

---

## App identity

| Field | Value | Limit |
|-------|--------|-------|
| Package | `com.lifequest.app` | — |
| Display name | LifeQuest | ≤30 |
| Short description | Live a full life from birth to death—careers, love, fortune & fame. | ≤80 |
| Developer contact | (set in Play Console) | — |
| Privacy policy | Hosted `EXPO_PUBLIC_PRIVACY_POLICY_URL` | required |
| Terms | Hosted `EXPO_PUBLIC_TERMS_URL` | required |

### Short description (US — 80 chars)

```
Live a full life from birth to death—careers, love, fortune & fame.
```
(69 chars)

### UK / CA / AU short description variants

- **UK:** `Live a full life from birth to death—careers, love, fortune and fame.`
- **CA / AU:** same as US (prefer “fame” / American spelling for brand consistency)

---

## Full description (US)

```
LifeQuest is a deep life-simulation RPG. Create a character, age up year by year, and shape a story through education, careers, relationships, money, and unexpected life events.

MAKE EVERY YEAR COUNT
• Age up and face decisions that change stats, karma, and your future
• Build careers, study for degrees, and unlock certifications
• Grow relationships, start a family, and leave a dynasty legacy
• Buy property, invest, and run businesses in country-scaled economies
• Chase fame on social platforms or stay under the radar

REPLAYABLE LIVES
• Multiple save slots and reincarnation with prestige progression
• Scenarios and challenges that remix the classic life loop
• Achievements, collections, daily quests, and seasonal Live Ops

LOOK & FEEL
• Light, dark, or system theme — plus premium theme skins
• Font packs and sound packs to personalize your world
• Accessible UI with dynamic type and reduced-motion support

PLAY YOUR WAY
• Free to play a complete life; optional Premium, cosmetics, and scenario packs
• Cloud save when you sign in (Google)
• Ads support the free experience; Premium / remove-ads skips them

Download LifeQuest and see how far one life can go.
```

---

## Feature bullets (Play listing highlights)

1. Age-up life sim with meaningful decisions every year  
2. Careers, education, family, and country-scaled economies  
3. Multiple lives, prestige, and dynasty progression  
4. Cosmetics: themes, fonts, sound packs, tombstones  
5. Cloud save + Google sign-in for cross-device play  

---

## Keyword matrix (ASO)

### Primary (US)

| Priority | Keywords / phrases |
|----------|-------------------|
| Core | life simulation, life sim, bitlife alternative, text life game |
| Genre | life RPG, decision game, virtual life, reincarnation game |
| Features | career sim, family tree game, dynasty game, prestige |
| Monetization-safe | free life sim, offline life game |

### Secondary

`age up game`, `life choices`, `simulate life`, `idle life story`, `character life story`, `karma game`, `legacy game`

### Locale notes

- **UK:** prefer “life simulation” / “life sim”; avoid US-only slang in title/short desc  
- **CA:** bilingual French listing is a later phase — English listing first  
- **AU:** same English copy as US; content rating questionnaire may differ slightly  

### Title / short-desc keyword placement

- Title: **LifeQuest** (brand; avoid stuffing)  
- Short description: “life”, “careers”, “fortune”, “fame”  
- Full description: natural phrases above; no keyword lists  

---

## Creative assets checklist

| Asset | Spec | Status |
|-------|------|--------|
| App icon | 512×512 Play icon | use `assets/icon.png` / store export |
| Feature graphic | 1024×500 | TODO design |
| Phone screenshots | ≥2, preferably 4–8 | Home, Life age-up, Career, Shop, Death/legacy |
| Tablet screenshots | optional | Profile / Home 2-column |
| Short promo video | optional | Age-up + decision sheet |

### Screenshot caption plan

1. “Age up — every year changes your story”  
2. “Careers, degrees, and certifications”  
3. “Family, friends, and dynasty legacy”  
4. “Build wealth in a country-scaled economy”  
5. “Themes, fonts, and sound packs”  

---

## Data safety & policy (Play Console)

Declare (align with in-app SDKs):

- **Account creation / sign-in** (Google Auth)  
- **Analytics** (Firebase Analytics)  
- **Crash reporting** (Crashlytics)  
- **Advertising** (AdMob — personalization subject to consent where required)  
- **In-app purchases** (Play Billing)  
- **Cloud save** (Firestore character saves for signed-in users)  

### Account deletion (Play policy)

- Required for apps with account creation.  
- **Current status:** no in-app delete-account flow yet.  
- **Plan:** Settings → “Request account deletion” that signs out + documents support email / Cloud Function wipe **after** backend deploy. Track as post-P0 deploy item in [STORE_RELEASE_P0.md](./STORE_RELEASE_P0.md).

### Ads consent (UMP / EEA)

- Documented follow-up; do not ship a half-implemented consent gate that breaks rewarded ads.  
- iOS ATT / SKAdNetwork deferred (Google-first release).

### Content rating

Complete IARC questionnaire: mild fantasy violence / crime activities (optional player-driven), no real gambling, in-app purchases, ads, users can interact via leaderboard display names.

---

## Pre-submit verification

- [ ] Production AdMob IDs set in EAS (build fails if placeholders remain)  
- [ ] Google OAuth client IDs set for production  
- [ ] Privacy + Terms URLs open from Auth / Age Gate  
- [ ] License testers configured for IAP sandbox  
- [ ] Data safety form matches SDKs above  
- [ ] Account deletion path documented or shipped  
- [ ] Feature graphic + screenshots uploaded  
- [ ] `npm run qa:prep` green on release candidate  

---

## What’s next (ASO iteration)

1. Capture conversion by country after soft launch  
2. A/B short description (US)  
3. Localized French (CA) / Spanish listings  
4. Custom store listing experiments for “bitlife-like” vs “life RPG” positioning  
