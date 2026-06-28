# LifeQuest — Complete Production Rollout Plan
> Audit + 15-Phase Transformation Plan  
> Prepared by: Lead Game Director / Senior Architect / Senior UI/UX  
> Date: 2026-06-28

---

## EXECUTIVE SUMMARY

LifeQuest has a **genuinely impressive foundation**. The engine architecture, genetics system, NPC autonomy, focus/aspiration system, memory chains, prestige/legacy, and multi-currency economy are features most indie life-sims never ship. The codebase is TypeScript-strict, well-tested (25+ test files), and already uses the right stack.

The gap between "impressive prototype" and "millions-of-downloads Play Store game" is **not more features** — it's polish, retention loops, UI clarity, code hygiene, and the Scenario System. This plan closes that gap in 15 phases.

**Estimated effort:** 10–14 weeks for a 2–3 engineer team.

---

## PHASE 1 — COMPLETE PROJECT AUDIT

### 1.1 Architecture Issues

#### 🔴 CRITICAL: God-Object Store (`gameStore.ts` — 2,177 lines)
The entire game state lives in one Zustand store. It has ~60 actions covering authentication, IAP, daily quests, careers, properties, crime, social media, pets, businesses, relationships, study sessions, achievements, prestige, cloud sync, and more. This is a maintenance time-bomb.

**Impact:** Every selector re-runs on every unrelated state change. Adding any new feature requires navigating 2,000+ lines. Testing individual slices is painful.

**Fix (Phase 2):** Split into feature slices: `authStore`, `characterStore`, `economyStore`, `socialStore`, `progressionStore`, `settingsStore`.

---

#### 🔴 CRITICAL: Duplicate Source Files
Three duplicate `.js` / `.ts` pairs exist:

| File | Issue |
|---|---|
| `src/types/index.js` | Compiled output committed to source. Should be in `.gitignore`. |
| `src/theme/themes.js` | Compiled output committed. Causes import confusion. |
| `src/data/events/careerEvents.js` | Compiled output committed. `.ts` version is the source of truth but both exist. |

**Impact:** Metro bundler may resolve `.js` over `.ts` in some configurations, silently serving stale compiled code.

**Fix (Phase 2):** Delete all three `.js` files. Add `*.js` exclusion patterns to `.gitignore` for `src/`.

---

#### 🟡 HIGH: `src/constants/theme.ts` is a re-export shim
```ts
// Re-export alias — AuthScreen, LifeGlyph, DecisionSheet, StatPanel import from here
export { COLORS, FONTS, RADII, SPACING, SHADOWS, ANIM } from '../theme/themes';
```
Some screens import from `@constants/theme`, others from `@theme/themes`. Two import paths for the same thing causes confusion and will break if the shim is ever deleted.

**Fix (Phase 3):** Consolidate to `@theme` everywhere. Delete the shim after updating all consumers.

---

#### 🟡 HIGH: `liveOpsEngine.ts` is a stub
The entire LiveOps engine is a single hardcoded `CURRENT_SEASON` constant with no dynamic loading, no backend connection, no date-aware switching. Season 1 is permanently "Inflation Surge."

**Fix (Phase 11):** Implement dynamic season config fetched from Firestore with local fallback.

---

#### 🟡 HIGH: No Scenario System
The system prompt calls for Scenarios (Millionaire Child, Mars Colony, Medieval Kingdom, etc.) as a flagship feature. The codebase has zero scenario infrastructure — no `scenarioId` on `Character`, no scenario-gated events, no scenario-specific careers/NPCs/economies.

**Fix (Phase 8):** Full Scenario system from scratch (see Phase 8 spec).

---

#### 🟡 HIGH: Event pool is thin
Total event data across all files: ~1,295 lines covering ~150 unique events. For a life simulator targeting 5–20 minutes/day play for *years*, this creates rapid repetition. BitLife ships with thousands of events.

**Fix (Phase 5):** Structured event expansion. Each life stage needs a minimum of 50 unique events. Target: 800+ events at launch.

---

#### 🟠 MEDIUM: `ProfileScreen.tsx` is 1,633 lines
The profile screen handles achievements, statistics, legacy, season pass, prestige unlocks, will editor navigation, and avatar customization all in one file. No sub-components are extracted.

**Fix (Phase 6):** Break into `ProfileOverview`, `AchievementsTab`, `StatsTab`, `LegacyTab`, `SeasonPassCard`.

---

#### 🟠 MEDIUM: `DeathScreen.tsx` is 1,329 lines
Handles tombstone rendering, stat summaries, leaderboard submission, challenge evaluation, heir selection, share sheet, and prestige all inline. No memoization on expensive derived values.

**Fix (Phase 6):** Decompose into `TombstoneHero`, `LifeSummaryCard`, `HeirSelectionSheet`, `DeathActionsPanel`.

---

#### 🟠 MEDIUM: Persistence dual-path complexity
`persistence.ts` maintains an in-memory `asyncCache` Map alongside both MMKV and AsyncStorage. The fallback chain (MMKV → asyncCache + AsyncStorage) is correct but untested for edge cases where MMKV becomes available mid-session after initialization failure.

**Fix (Phase 11):** Simplify to: MMKV on native (always available in production builds), AsyncStorage only for web/Expo Go. Remove the asyncCache layer.

---

#### 🟠 MEDIUM: `components/index.tsx` is a barrel with inline components
At 400+ lines, `components/index.tsx` both re-exports components *and* defines `Card`, `GradientButton`, `SectionHeader` inline. This means every screen that imports `Card` pulls the entire barrel.

**Fix (Phase 6):** Move inline components to their own files. Make `index.tsx` a pure re-export barrel.

---

### 1.2 Code Quality Issues

| Issue | Location | Severity |
|---|---|---|
| `.js` compiled files in source tree | `src/types/`, `src/theme/`, `src/data/events/` | 🔴 Critical |
| God-object store with 60+ actions | `gameStore.ts` | 🔴 Critical |
| Two theme import paths | `@constants/theme` vs `@theme/themes` | 🟡 High |
| Inline SVG icon components defined per-file | `LifeScreen.tsx`, `MainTabNavigator.tsx` | 🟠 Medium |
| `careerEvents.ts` only has 15 events despite being the richest career game | `data/events/careerEvents.ts` | 🟠 Medium |
| `expansionAuthored.ts` duplicates structure from `expansion.ts` | `data/events/` | 🟠 Medium |
| `mentalHealthEngine.ts` is 32 lines — effectively a stub | `engine/` | 🟠 Medium |
| `questEngine.ts` only generates 3 daily quests with fixed templates | `engine/questEngine.ts` | 🟠 Medium |
| No error boundaries around screens | All screens | 🟡 High |
| No skeleton loading states | All screens | 🟠 Medium |
| `reincarnationScroll` IAP at $0.49 is underpriced relative to gems | `iapCatalog.ts` | 🟡 High |

---

### 1.3 Performance Issues

| Issue | Impact | Fix |
|---|---|---|
| `SectionList` in `LifeScreen` re-renders all sections on every `ageUp` | Jank on mid-range devices | `FlashList` + section memoization |
| No `useMemo` on `character` selectors in `LifeScreen` | Extra renders on unrelated store changes | Granular Zustand selectors |
| `ProfileScreen` computes achievement stats inline in render | Blocks JS thread | Move to `useMemo` or engine function |
| `DeathScreen` submits leaderboard in `useEffect` without abort signal | Leaks on unmount | Cleanup with `AbortController` |
| All event data imported at bundle time (~150KB of JSON-like objects) | Longer TTI | Lazy-load event packs by life stage |
| Avatar SVGs regenerated on every render | Wasted computation | Memoize by `avatarSeed` + `avatarStyle` |
| No image/asset preloading | First-load jank | `expo-asset` preload in splash |

---

### 1.4 UX Issues

| Issue | Impact |
|---|---|
| No onboarding flow — users drop into character creation cold | High D1 churn |
| Character creation has no preview of how stats affect gameplay | Users don't understand their choices |
| Main life feed is purely text cards — no visual differentiation between event types | Low visual engagement |
| "Age Up" is a single button with no ceremony — the most important action in the game feels cheap | Reduces emotional engagement |
| No tutorial or first-session guidance | Users don't discover the Focus/Aspiration system |
| Bottom tabs use generic icons (house = Life?) | Poor tab-to-feature mapping |
| Shop has too many low-value SKUs clustered together | Decision paralysis, low conversion |
| No daily login reward visible on home screen | Users forget to return |
| Death screen shows stats but no "story of your life" narrative | Missed emotional moment |
| Leaderboard is a stub with no social hooks | No virality |

---

### 1.5 Retention Issues

| Issue | Fix Phase |
|---|---|
| No streak system | Phase 7 |
| Daily rewards not prominently surfaced | Phase 7 |
| No push notification for daily quest reset | Phase 7 |
| Season pass has no visual progress bar on home screen | Phase 7 |
| No mystery box / lucky wheel mechanic | Phase 7 |
| No "return after X days away" bonus | Phase 7 |
| Family tree is navigable but has no "continue legacy" motivation loop | Phase 7 |
| No limited-time events | Phase 11 |
| No social sharing on achievements | Phase 7 |
| Collections system not implemented | Phase 7 |

---

### 1.6 Monetization Issues

| Issue | Recommendation |
|---|---|
| `reincarnation_scroll` at $0.49 undervalues a core gameplay loop | Reprice to $1.99 or 200 gems |
| Only 3 avatar pack SKUs at $0.79 each | Add "Bundle All Packs" at $1.99 (better value) |
| No "Starter Pack" for new users (first 24h offer) | Add $2.99 starter pack: Gems + remove ads |
| Scenario Packs have no infrastructure — biggest potential revenue line | Phase 8 + Phase 10 |
| No subscription with exclusive content beyond ad removal | Add "LifeQuest Plus" monthly |
| Gem pricing is opaque — no visible gem-to-value mapping in shop | Phase 10 redesign |
| No rewarded video ads for non-paying users | Phase 11 |

---

### 1.7 Play Store Risks

| Risk | Severity | Fix |
|---|---|---|
| No GDPR/COPPA age gate before account creation | 🔴 Legal | Add age gate in onboarding |
| Privacy policy link exists in `legal.ts` but is never shown pre-auth | 🔴 Legal | Show before signup |
| Crashlytics integrated but no crash-free rate baseline | 🟡 Operational | Set up Crashlytics dashboard before launch |
| No offline mode — game is fully playable locally but no graceful offline banner | 🟠 UX | Add `NetInfo` check + offline toast |
| Ad library (`react-native-google-mobile-ads`) present — needs test vs real ad unit IDs in production | 🔴 Launch blocker | Audit ad config |
| `INTERSTITIAL_EVERY_N_AGEUPS` from ads config — ensure this ≥ 5 to avoid Play Store policy issues | 🟡 Policy | Confirm value |
| No app rating prompt | 🟠 ASO | Integrate `expo-store-review` after 3 completed lives |

---

## PHASE 2 — NEW ARCHITECTURE

### Store Decomposition Plan

Split `gameStore.ts` (2,177 lines) into feature slices using Zustand's `create` with `immer` middleware:

```
src/store/
  slices/
    authSlice.ts          — user, hydration, onUserChanged
    characterSlice.ts     — character CRUD, createCharacter, ageUp
    economySlice.ts       — coins, gems, assets, business, stocks
    progressionSlice.ts   — quests, achievements, season pass, prestige
    socialSlice.ts        — people, relationships, social media
    settingsSlice.ts      — theme, notifications, audio
  gameStore.ts            — compose slices with zustand/combine
  index.ts                — re-exports
```

**Migration strategy:** Keep existing `gameStore.ts` interface-compatible while refactoring internals. All screen imports remain unchanged. No big-bang rewrite.

### Folder Structure (Feature-Based)

```
src/
  features/
    auth/
      AuthScreen.tsx
      hooks/useAuth.ts
      services/auth.ts
    character/
      CharacterCreateScreen.tsx
      engine/ageUpEngine.ts
      hooks/useCharacter.ts
    career/
      CareerScreen.tsx
      engine/careerEngine.ts
      data/careerPaths.ts
    economy/
      AssetsScreen.tsx
      engine/economyEngine.ts
      data/properties.ts
    people/
      PeopleScreen.tsx
      engine/peopleEngine.ts
    scenarios/                    ← NEW
      ScenarioPickerScreen.tsx
      data/scenarios.ts
      engine/scenarioEngine.ts
    liveops/                      ← EXPAND
      LiveOpsScreen.tsx
      engine/liveOpsEngine.ts
  shared/
    components/
    theme/
    utils/
    hooks/
  store/
  navigation/
  types/
```

### Error Boundaries

Add `GameErrorBoundary` wrapping each tab screen. Captures crashes with Crashlytics, shows friendly "Something went wrong — your save is safe" UI.

---

## PHASE 3 — NEW DESIGN SYSTEM

### Design Philosophy: "Living Chronicle"

LifeQuest's visual identity should feel like a **premium illustrated journal that comes alive** — not a clone of BitLife's minimal rectangles, not a generic dark-mode game. It should feel warm, personal, and slightly storybook-meets-modern.

### Color System Expansion

The existing palette is solid (light theme, vivid stat colors). Additions needed:

```ts
// Dark Mode (add)
darkBg:         '#0D1117'   // Deep navy-black
darkBgCard:     '#161B22'   // Card surface
darkBgSheet:    '#1C2128'   // Sheet surface
darkBorder:     '#30363D'   // Borders
darkT1:         '#F0F6FC'   // Primary text
darkT2:         '#B1BAC4'   // Secondary

// Scenario accent colors (new)
scenarioRoyal:   '#7B2FBE'
scenarioZombie:  '#2D6A2D'
scenarioCyber:   '#00D9FF'
scenarioCrime:   '#C0392B'
scenarioFantasy: '#D4A017'

// Rarity tiers (new, for events/items)
rarityCommon:   '#6B7280'
rarityUncommon: '#3B82F6'
rarityRare:     '#8B5CF6'
rarityEpic:     '#EC4899'
rarityLegendary:'#F59E0B'
```

### Typography Scale

```ts
// Add to FONTS
display:      'PlayfairDisplay-Bold'      // Headlines, age display, death screen
displayItal:  'PlayfairDisplay-Italic'    // Pull quotes, event drama
body:         'DMSans-Regular'            // Body text (already used)
bodySemiBold: 'DMSans-SemiBold'          // Labels
mono:         'JetBrainsMono-Regular'    // Stats, numbers
monoSemiBold: 'JetBrainsMono-SemiBold'  // Emphasized stats
```

### Component Library Additions Needed

| Component | Purpose |
|---|---|
| `RarityBadge` | Color-coded event/item rarity indicator |
| `CurrencyChip` | Inline coin/gem/ticket display |
| `StreakBadge` | Daily streak counter with fire icon |
| `ScenarioBanner` | Scenario identity banner (color + name) |
| `SkeletonCard` | Loading placeholder for cards |
| `ConfettiOverlay` | Achievement unlock animation |
| `ToastManager` | In-game notification toasts |
| `RarityEventCard` | EventCard with rarity glow effect |
| `XPBar` | Animated season XP progress bar |
| `StatDeltaChip` | Animated +/- stat change callout |
| `BottomSheetHandle` | Consistent drag handle for all sheets |

### Dark Mode

Add `colorScheme` to `settingsStore`. All components read from a `useTheme()` hook that returns the active palette. No hardcoded colors anywhere except the design system file.

---

## PHASE 4 — NAVIGATION REDESIGN

### Current Tab Structure
```
Life | People | Career | Assets | Profile
```

### Proposed Tab Structure
```
Home | World | Life | Profile | [+]
```

**Rationale:**
- **Home** = Daily quests, streak, season pass, quick stats — the retention hub
- **World** = People + Activities + Scenarios + Leaderboard — the exploration hub  
- **Life** = Main event feed (current "Life" tab) — the gameplay hub
- **Profile** = Stats, achievements, legacy, settings
- **[+] (FAB)** = Quick actions: Age Up, Activities, Crime, Social Media

The current tabs bury "Daily Rewards" and "Challenges" inside Profile. Moving them to Home ensures users see their daily motivation first.

### New Screens to Add

| Screen | Purpose |
|---|---|
| `OnboardingScreen` | 3-slide onboarding before auth |
| `HomeScreen` | Daily hub (new tab) |
| `ScenarioPickerScreen` | Choose life scenario |
| `ScenarioDetailScreen` | Scenario preview before starting |
| `CollectionsScreen` | Collection/badge gallery |
| `DailyRewardsScreen` | Calendar-style login rewards |
| `MysteryBoxScreen` | Lucky wheel / mystery box |
| `WorldEventsScreen` | Live global events feed |
| `SettingsScreen` | Full settings (currently buried in Profile) |

---

## PHASE 5 — CORE GAMEPLAY REDESIGN

### The Age-Up Ceremony

The `Age Up` button is the single most-tapped element in the game. Currently it's a gold button with a shimmer. It should become a **ceremony**:

1. User taps "Age Up" → **haptic pulse** + button morphs into animated hourglass
2. JS runs `ageUp()` engine (off main thread via `InteractionManager.runAfterInteractions`)
3. Results revealed with **staggered card animations** (not all at once)
4. Significant events get **full-card dramatic reveal** with rarity glow
5. Stat changes animate via `StatDeltaChip` components
6. If an achievement unlocks → **confetti + achievement card** interrupts the feed
7. "Year in Review" at milestone ages (10, 18, 25, 40, 65, 80)

### Event Card Rarity System

Introduce rarity tiers to the event engine:

```ts
type EventRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
```

**Legendary events** (one per life, unique) should feel like "the thing that defines your life." Examples: "You discover you're secretly a prince," "A startup you co-founded goes public," "You survive a plane crash."

Cards get a rarity border glow, and legendary events get a full-screen cinematic card with `PlayfairDisplay` typography.

### Event Pool Expansion (800+ target)

Current coverage gaps to fill:

| Category | Current | Target |
|---|---|---|
| Career | ~30 | 100 |
| Relationships | ~25 | 80 |
| Health | ~25 | 80 |
| Education | ~20 | 60 |
| Crime | ~15 | 40 |
| Financial | ~20 | 60 |
| Family | ~10 | 50 |
| Milestone | ~15 | 40 |
| Random/Quirky | ~20 | 80 |
| Travel | 0 | 40 |
| World Events | ~5 | 40 |
| Scenario-specific | 0 | 150 |
| **Total** | **~185** | **~820** |

### Focus System — Make It Visual

The Focus/Aspiration system is the most unique design feature. Currently it lives inside a bottom sheet with sliders. It should be a **visual allocation screen** — a "life compass" with a circular allocation wheel (SVG), showing where your energy goes this year. Make it feel intentional and personal.

### Decision System Improvements

Current `DecisionSheet` shows 2–4 text choices. Upgrade:
- Add **consequence preview** (blurred stat changes that sharpen on hover)
- Add **NPC reaction preview** for relationship-affecting decisions
- Add **timer decisions** for dramatic events (5-second countdown before a default choice auto-selects)
- Track decision history in the life museum

---

## PHASE 6 — UI OVERHAUL

### Screen-by-Screen Priorities

#### LifeScreen (Core Loop)
- Replace `SectionList` with `FlashList` (estimated 40% render improvement)
- Add life stage section headers with illustrated banners
- Event cards: add rarity glow, scenario-specific colors, animated entrance
- Stats strip: replace text numbers with animated progress arcs
- Age display: large `PlayfairDisplay` age number as hero element
- Add floating "Active Scenario" badge if playing a scenario

#### HomeScreen (New)
```
┌─────────────────────────────────┐
│  👤 Good morning, [Name]   🔥 7  │  ← Streak badge
│  Age 24 · [Country Flag]         │
├─────────────────────────────────┤
│  ╔═══════ SEASON PASS ═══════╗  │
│  ║ ████████░░ 1,240 / 2,000  ║  │
│  ╚════════════════════════════╝  │
├─────────────────────────────────┤
│  DAILY QUESTS (2/3 done)        │
│  ✅ Age up twice                │
│  ✅ Visit a friend               │
│  ⬜ Earn $10,000               │
├─────────────────────────────────┤
│  🎁 DAILY REWARD  ⟳ 08:42:31   │
│  [Claim 500 Coins]              │
├─────────────────────────────────┤
│  🌍 WORLD EVENT: Stock Crash    │
│  "Markets down 30%..."  [View]  │
└─────────────────────────────────┘
```

#### CharacterCreateScreen
Current: Long vertical scroll form.  
New: **Step-by-step wizard** with 5 steps:
1. Name + Gender (large, friendly inputs)
2. Birthplace (interactive world map or country picker with flag)
3. Family Background (visual cards: Rich/Middle/Poor with stat previews)
4. Personality (Big Five sliders with live trait preview)
5. Starting Scenario (optional — can skip for classic mode)

Each step has a character avatar preview that reacts to choices.

#### DeathScreen
Current: Tombstone + stats + buttons.  
New: **"The Story of [Name]"** — cinematic obituary format:
- Hero: animated tombstone with name/dates engraved
- "Life Story" — 3-paragraph AI-narrated summary of key life events
- Stats presented as infographic cards, not plain numbers
- Best moments gallery (top 5 events by impact score)
- "Your Legacy" section showing dynasty score + unlocks
- Heir selection as a beautifully designed character card swipe
- Share button generates a story card image

#### ShopScreen
Reorganize into tabs: **Bundles | Premium | Cosmetics | Scenarios**  
Add a "Featured Deal" hero card at the top.  
Show gem-to-value calculator inline.

---

## PHASE 7 — RETENTION SYSTEMS

### Daily Login Rewards

30-day calendar with escalating rewards:
- Days 1–6: Coins (500 → 3,000)  
- Day 7: Gem pack  
- Days 8–13: Coins + Luck Boost  
- Day 14: Rare avatar item  
- Days 15–20: Coins + XP  
- Day 21: Mystery Box  
- Days 22–27: Coins + Ticket  
- Day 28: Epic event unlock  
- Day 29: Large gem pack  
- Day 30: Legendary reward (exclusive cosmetic or scenario preview)

Missing a day resets to Day 1 (with a 24h grace period catchup).

### Streak System

- **Daily streak** = consecutive days with at least one Age Up
- Streak displayed prominently on HomeScreen with animated fire icon
- Streak milestones: 7d (Gem), 30d (Rare avatar), 100d (Legendary cosmetic), 365d (Prestige title)
- **Streak Shield** (purchasable with gems) protects against one missed day

### Mystery Box / Lucky Wheel

Weekly mechanic (resets Monday). Wheel has 8 segments:
- 2× Coins pack
- 2× Gems pack  
- 1× Luck Boost
- 1× Rare event unlock
- 1× XP boost
- 1× Random cosmetic

Free spin once/week. Extra spins purchasable.

### Collections System

150 collectible "Life Moments" — illustrated cards unlocked by specific events/achievements. Displayed in a gallery in Profile. Completing a set grants a Title and bonus currency. Examples:
- "The Wanderer" collection: Live in 5 countries
- "The Tycoon" collection: Own 3+ businesses simultaneously
- "The Scholar" collection: Earn 3+ degrees

### Push Notifications (via `expo-notifications`)

| Trigger | Message |
|---|---|
| Daily quest reset (8 AM) | "Your daily quests just reset. Today's top reward: 💎 5 Gems" |
| Streak at risk (11 PM) | "Don't break your 🔥 12-day streak! Age up once to keep it." |
| World event starts | "⚠️ Stock Market Crash — your investments are affected" |
| NPC life event | "Your mother [Maria] just turned 60. Wish her happy birthday?" |
| Missing 2 days | "Life goes on without you... Age 24 → 26 happened while you were away" |

### Achievement Sharing

On achievement unlock, generate a shareable image card (using `react-native-view-shot` or Canvas API) with:
- Achievement icon + name
- Character name + age
- LifeQuest branding
- "Play LifeQuest" CTA

---

## PHASE 8 — SCENARIO SYSTEM

This is the **biggest new feature** and the strongest monetization opportunity. 

### Architecture

Add `scenarioId` to the `Character` type:
```ts
interface Character {
  // ... existing fields
  scenarioId?: ScenarioId;
  scenarioData?: Record<string, unknown>; // scenario-specific state
}
```

Create `src/features/scenarios/`:
```
scenarios/
  data/
    scenarioCatalog.ts      — all scenario definitions
    scenarioEvents.ts       — scenario-specific events
    scenarioCareers.ts      — scenario-specific careers
    scenarioNPCs.ts         — scenario-specific NPC archetypes
  engine/
    scenarioEngine.ts       — applies scenario modifiers to event engine
  screens/
    ScenarioPickerScreen.tsx
    ScenarioDetailScreen.tsx
```

### Scenario Definition Interface

```ts
interface ScenarioDef {
  id: ScenarioId;
  name: string;
  tagline: string;
  description: string;
  isPremium: boolean;
  iapProductId?: IAPProductId;   // 'scenario_royal', 'scenario_zombie', etc.
  
  // World setup
  worldEra: 'modern' | 'ancient' | 'medieval' | 'future' | 'alternate';
  startingCountry?: string;
  startingAge: number;
  
  // Economy overrides
  currencyName: string;          // "Gold Coins" vs "Credits" vs "Coins"
  wealthMultiplier: number;      // Starting wealth modifier
  
  // Stat modifiers applied at creation
  statBonuses: Partial<CharacterStats>;
  
  // Feature gates
  allowedFeatures: ScenarioFeature[];
  disabledFeatures: ScenarioFeature[];
  
  // Exclusive content
  exclusiveEventIds: string[];
  exclusiveCareerIds: string[];
  exclusiveNPCArchetypes: string[];
  
  // Meta
  difficulty: 'easy' | 'normal' | 'hard' | 'chaos';
  accentColor: string;
  iconEmoji: string; // or SVG
}
```

### Launch Scenarios (Free)

| Scenario | Description | Hook |
|---|---|---|
| **Classic Life** | Default modern-day life sim | Everyone starts here |
| **Rags to Riches** | Born destitute in a poor country | Starting wealth ×0.01 |
| **Silver Spoon** | Born to a wealthy family | Starting wealth ×10, social pressure events |

### Premium Scenarios (IAP)

| Scenario | Price | Unique Features |
|---|---|---|
| **Royal Family** | $2.99 | Court politics, succession, royal marriages |
| **Crime Empire** | $2.99 | Mob family dynamics, territory control |
| **Cyberpunk 2087** | $3.99 | Neural implants, corps, megacities |
| **Medieval Kingdom** | $2.99 | Feudal system, knights, plagues |
| **Zombie Apocalypse** | $2.99 | Survival mechanics, base building |
| **Mars Colony** | $3.99 | Sci-fi tech tree, Earth nostalgia events |
| **Celebrity Child** | $1.99 | Fame mechanics, paparazzi, rehab |
| **Fantasy Kingdom** | $3.99 | Magic system, guilds, dragons |
| **Political Dynasty** | $2.99 | Elections, diplomacy, scandals |

**Scenario Pack Bundle**: All 9 premium scenarios for $14.99 (60% off individual).

---

## PHASE 9 — ECONOMY REDESIGN

### Currency Architecture (Expand Existing)

| Currency | Earn Via | Spend On | Anti-inflation |
|---|---|---|---|
| **Coins** 🪙 | Gameplay, daily quests, age ups | Activities, shop, luck boosts | Daily earn cap of 5,000 |
| **Gems** 💎 | Achievements, purchase, rare events | Premium items, scenarios, extra spins | No cap — premium signal |
| **Tickets** 🎫 | Season pass, login rewards | Lucky wheel extra spins, events | Weekly cap of 5 |
| **Legacy Points** ⭐ | Death screen, prestige | Prestige unlocks, dynasty shop | No cap — long-term |
| **Karma** ☯ | Choices, events | Affects event weighting, traits | Auto-decays |
| **XP** | All actions | Season pass progression | Resets each season |

### Economy Balance (Monthly Active Player)

**Free player (casual, 5 min/day):**
- Earns ~15,000 coins/month
- Earns ~5 gems/month (achievements)
- Never needs to pay to enjoy core loop

**Free player (engaged, 20 min/day):**
- Earns ~40,000 coins/month
- Earns ~15 gems/month
- Accesses 80% of content

**Paying player ($4.99/month LifeQuest Plus):**
- +50% all currency earn rates
- Access to 2 scenario rotations/month
- Exclusive cosmetic each month
- Season pass included

### Long-term Progression (Dynasty Shop)

Legacy Points (accumulated across lifetimes) unlock permanent bonuses in the Dynasty Shop:
- +5% starting stats per generation
- Inherited trait pools expand
- Exclusive family crests/names
- Special NPC relations across lives

This is the core **prestige loop** that keeps players engaged across hundreds of lives.

---

## PHASE 10 — PREMIUM CONTENT

### LifeQuest Plus Subscription ($4.99/month, $34.99/year)

- Remove all ads
- +50% coin earn rate
- 2 Scenario Pack accesses per month (rotates)
- Exclusive monthly cosmetic
- Season pass included (normally separate)
- Cloud save priority sync
- Premium support badge

### Cosmetic Store (No Pay-to-Win)

| Category | Items | Price Range |
|---|---|---|
| Avatar Packs | 10 packs, 6 styles each | $0.99–$1.99 each |
| App Themes | Dark Slate, Midnight, Sunrise | $0.99 each |
| Event Card Skins | Vintage, Neon, Watercolor | $1.49 each |
| Name Fonts | Serif, Script, Mono | $0.49 each |
| Tombstone Styles | Gothic, Modern, Angelic | $0.99 each |
| Sound Packs | Jazz, Cinematic, Lo-Fi | $0.99 each |

### Starter Pack (First-Session Offer, 24h window)
- $2.99 one-time
- 50 Gems + Remove Ads + "Silver Spoon" Scenario
- Shown on second session open (after first life death/major milestone)

---

## PHASE 11 — BACKEND IMPROVEMENTS

### Firestore Schema

```
/users/{uid}
  profile: { displayName, avatarUrl, createdAt }
  settings: { theme, notifications, audio }
  
/saves/{uid}/slots/{slotId}
  character: Character
  lastSaved: Timestamp
  version: number
  checksum: string

/leaderboard/{seasonId}/entries/{uid}
  score: number
  characterName: string
  age: number
  netWorth: number
  country: string

/liveops/current
  season: Season
  worldEvents: WorldEvent[]
  featuredScenario: ScenarioId
  limitedTimeOffers: LimitedOffer[]
  
/liveops/history/{seasonId}
  — archived season data
```

### Dynamic LiveOps

Replace hardcoded `CURRENT_SEASON` with:
```ts
// On app foreground
async function fetchLiveOpsConfig(): Promise<LiveOpsConfig> {
  const cached = MMKV.getString('liveops:cache');
  const cacheAge = Date.now() - Number(MMKV.getString('liveops:cacheTime') ?? 0);
  
  if (cached && cacheAge < 3600_000) return JSON.parse(cached); // 1h cache
  
  const doc = await getDoc(doc(db, 'liveops', 'current'));
  const config = doc.data() as LiveOpsConfig;
  
  MMKV.set('liveops:cache', JSON.stringify(config));
  MMKV.set('liveops:cacheTime', Date.now().toString());
  return config;
}
```

### Remote Config (Firebase)

Use Firebase Remote Config for:
- `interstitial_every_n_ageups` — tune ad frequency without app update
- `starter_pack_enabled` — A/B test starter pack
- `daily_reward_multiplier` — seasonal event multipliers
- `featured_scenario_id` — rotate featured free scenario

### Rewarded Video Ads

Add `InterstitialAd` + `RewardedAd` from `react-native-google-mobile-ads`:
- Rewarded: Watch ad → earn 200 coins or extra Lucky Wheel spin
- Interstitial: Between lives (death → character create), not during gameplay
- Ad-free users see "Support LifeQuest" button instead

---

## PHASE 12 — PERFORMANCE OPTIMIZATION

### Target: 60 FPS on Redmi Note 11 (mid-range Android benchmark)

| Optimization | Expected Gain |
|---|---|
| Replace `SectionList` → `FlashList` in LifeScreen | 30-40% list render improvement |
| Granular Zustand selectors (no full-store subscribing) | Eliminate 60% of unnecessary re-renders |
| `ageUp()` wrapped in `InteractionManager.runAfterInteractions` | No jank during animation |
| Avatar memoization by `avatarSeed + avatarStyle` | Eliminate repeated SVG generation |
| Event data lazy-loaded by life stage (not all at init) | Reduce TTI by ~200ms |
| Hermes engine (already enabled via Expo) | JS parse time -50% |
| `react-native-fast-image` for any remote images | Faster image loads |
| Metro bundle splitting by route | Deferred loading of screens |
| `useMemo` on all expensive derivations (net worth, achievement checks) | JS thread freed |
| Batch Firestore reads with `getDocs` on startup instead of sequential `getDoc` | Reduce init network calls |

### Bundle Size

Current stack flags no obvious bloat, but audit with `@expo/metro-config` source map explorer before release. Target: < 15MB APK download size.

---

## PHASE 13 — ACCESSIBILITY

| Item | Implementation |
|---|---|
| Dynamic text sizes | `useWindowDimensions` + `PixelRatio.getFontScale()` |
| Screen reader support | `accessibilityLabel` on all interactive elements |
| Reduced motion | Respect `AccessibilityInfo.isReduceMotionEnabled()` — skip confetti, use fades instead of springs |
| Color blind modes | Add `colorBlindMode: 'none' | 'protanopia' | 'deuteranopia'` to settings |
| Minimum tap target 44×44pt | Audit all `Pressable` elements |
| High contrast mode | Follow system `AccessibilityInfo.isHighTextContrastEnabled` |
| Focus management | `useRef` + `setAccessibilityFocus` on screen transitions |
| Tablet layout | `useBreakpoints` hook; 2-column layout on tablets |

---

## PHASE 14 — TESTING

### Current Test Coverage
- 25+ test files ✅
- Engines mostly covered ✅
- Store slices: partial ⚠️
- Screen integration tests: none ❌
- Scenario system: not yet built ❌

### Test Plan Additions

```
Engine tests (extend existing):
  scenarioEngine.test.ts
  liveOpsEngine.test.ts (dynamic config)
  
Store slice tests:
  authSlice.test.ts
  economySlice.test.ts
  
Integration tests (Jest + RNTL):
  HomeScreen.test.tsx        — daily reward claim flow
  DeathScreen.test.tsx       — heir selection flow
  CharacterCreate.test.tsx   — wizard step progression
  
Performance tests:
  ageUp.perf.test.ts         — ensure <16ms per ageUp cycle
```

### Pre-Launch QA Checklist

- [ ] Test on Redmi Note 11 (mid-range) and Samsung S24 (flagship)
- [ ] Test with airplane mode — all core gameplay works offline
- [ ] Test IAP on real Play Store sandbox account
- [ ] Test all 3 save slots load/save/delete
- [ ] Test cloud sync conflict modal
- [ ] Test daily bonus cooldown crossing midnight
- [ ] Test crash reporting hits Crashlytics dashboard
- [ ] Test push notifications on physical device
- [ ] Test dark mode on all screens
- [ ] Test with TalkBack enabled (accessibility)
- [ ] Test "battery optimization" setting (background notifications)

---

## PHASE 15 — LAUNCH CHECKLIST

### Play Store Requirements
- [ ] App icon (512×512 PNG, no rounded corners — Play Store does this)
- [ ] Feature graphic (1024×500)
- [ ] 8 screenshots (phone) + 4 (tablet)
- [ ] Short description (80 chars)
- [ ] Full description (4,000 chars) — include keywords: life simulator, BitLife alternative, life choices game
- [ ] Content rating questionnaire completed (likely "Teen" rating)
- [ ] Privacy policy URL live and linked in Play Console
- [ ] Data safety form completed
- [ ] Target API level: Android 14 (API 34) ✅ via Expo SDK 56
- [ ] Signed release build with upload keystore (store in Firebase/secure vault)
- [ ] `applicationId`: set to reverse-domain format (e.g., `com.yourco.lifequest`)

### Firebase Pre-Launch
- [ ] Firestore security rules reviewed and deployed
- [ ] Crashlytics enabled in release build (not just debug)
- [ ] Analytics event plan documented
- [ ] Remote Config defaults set
- [ ] Firebase App Check enabled
- [ ] Firestore indexes created for leaderboard queries
- [ ] Cloud Functions deployed (IAP webhook if using server-side validation)

### Soft Launch Strategy
- Week 1: Release to 10 countries (tier 2: Philippines, Malaysia, South Africa, Romania, Colombia)
- Week 2–3: Monitor crash-free rate (target >99.5%), D1 retention (target >40%), ARPU
- Week 4: Address top 5 crash/complaint categories
- Week 5: Roll out to all countries

### ASO Keywords
Primary: life simulator game android, bitlife alternative, life choices simulator
Secondary: text life game, simulation rpg, life decisions game
Long-tail: what should i do with my life game, realistic life simulator

---

## IMPLEMENTATION ORDER RECOMMENDATION

Given a 2-person team, execute in this order for maximum impact per week:

| Week | Focus | Impact |
|---|---|---|
| 1 | Phase 2: Fix .js duplicates, begin store decomposition | Unblocks parallel dev |
| 2 | Phase 3: Design system (dark mode, new components, typography) | Unlocks all UI work |
| 3 | Phase 5: Event pool expansion to 400 events | Core loop freshness |
| 4 | Phase 6: HomeScreen + LifeScreen overhaul | D1 retention |
| 5 | Phase 7: Daily rewards, streaks, push notifications | D7/D30 retention |
| 6 | Phase 8: Scenario system foundation + 3 free scenarios | Differentiation |
| 7 | Phase 8: 2–3 premium scenarios | Revenue |
| 8 | Phase 9: Economy balance + Dynasty shop | Long-term monetization |
| 9 | Phase 10: Premium subscriptions + cosmetic store | Revenue |
| 10 | Phase 11: Dynamic LiveOps + Remote Config | Operational flexibility |
| 11 | Phase 6: Death screen + Character Create redesign | Polish |
| 12 | Phase 12: Performance audit + FlashList migration | Stability |
| 13 | Phase 14: QA + integration tests | Confidence |
| 14 | Phase 15: Soft launch preparation | Ship |

---

## WHAT NOT TO CHANGE

The following are working well and should **not** be replaced:

- ✅ Zustand + Immer state management (just decompose the store)
- ✅ MMKV + AsyncStorage dual persistence pattern (simplify, don't replace)
- ✅ Big Five personality system + genetics crossover (genuinely innovative)
- ✅ Focus allocation + aspiration system (differentiated feature, just needs better UI)
- ✅ Memory chain system (unique, ship it prominently)
- ✅ NPC autonomy engine (NPCs with goals/moods/secrets is excellent)
- ✅ Prestige/legacy engine (well-implemented)
- ✅ The 25 engine architecture (clean separation of concerns)
- ✅ Test suite (maintain and expand)
- ✅ React Navigation v6 (stable, no reason to change)
- ✅ Light theme color palette (strong stat colors, good contrast)
- ✅ DiceBear avatar system (performant, customizable)
- ✅ Firebase + Firestore (correct for this scale)

---

## READY TO PROCEED

This plan covers every file, every screen, and every system in the project. Phase 1 audit is complete. Please confirm which Phase to begin implementing first and I'll produce production-ready code.

**Recommended first step:** Phase 2 (delete the .js duplicates + store decomposition skeleton) — it takes 2 hours and unblocks all parallel development with zero risk of breaking existing functionality.
