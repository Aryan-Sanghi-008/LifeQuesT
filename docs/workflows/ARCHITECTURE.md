# LifeQuesT — Architecture Reference

## Directory Map
```
LifeQuesT/
├── App.tsx                    # Entry point: auth, IAP, ads init
├── index.ts                   # Expo registerRootComponent
├── src/
│   ├── components/            # Reusable UI primitives
│   │   ├── index.tsx          # Barrel exports for all components
│   │   ├── StatPanel.tsx      # Stat display bar component
│   │   ├── EventCard.tsx      # Life event card
│   │   ├── DecisionSheet.tsx  # Bottom sheet for player decisions
│   │   ├── BottomSheet.tsx    # Generic animated bottom sheet
│   │   ├── Avatars.tsx        # DiceBear avatar renderer
│   │   └── LifeGlyph.tsx      # Decorative life icon
│   ├── engine/                # PURE GAME LOGIC — no React imports
│   │   ├── careerEngine.ts    # Job, salary, promotion logic
│   │   ├── economyEngine.ts   # Net worth, bank, assets math
│   │   ├── eventEngine.ts     # Event selection, success chances
│   │   └── peopleEngine.ts    # NPC aging, coworkers, interactions
│   ├── navigation/
│   │   ├── RootNavigator.tsx  # Stack: Auth → SaveSlots → Game
│   │   └── MainTabNavigator.tsx # Bottom tabs: Life/People/Career/Assets/Profile
│   ├── screens/               # Screen-level components (consume store only)
│   ├── services/              # External integrations
│   │   ├── auth.ts            # Firebase Auth (Google + guest)
│   │   ├── analytics.ts       # Firebase Analytics logEvent
│   │   ├── cloudSave.ts       # Firestore character sync
│   │   ├── persistence.ts     # MMKV/AsyncStorage save slots
│   │   ├── ads.ts             # Google Mobile Ads init + interstitials
│   │   └── iap.ts             # react-native-iap products + purchase flow
│   ├── store/
│   │   └── gameStore.ts       # Zustand + Immer — single source of truth
│   ├── types/
│   │   └── index.ts           # All TypeScript interfaces/types
│   ├── data/
│   │   └── gameData.ts        # Static data: JOBS, TRAITS, EVENTS, COUNTRIES
│   ├── constants/             # Non-game constants (colors, sizes)
│   ├── config/                # Firebase config, env references
│   ├── shared/theme/          # StyleSheet theme tokens + skins
│   └── utils/                 # Pure utility functions
├── functions/                 # Firebase Cloud Functions (Node.js)
└── docs/workflows/            # AI workflow docs (this folder)
```

## Key Data Flows

### Age-Up Loop
```
User taps "Age Up"
  → useGameStore.ageUp()
  → economyEngine.tickAnnualEconomy() [salary, assets, bank]
  → eventEngine.getEligibleEvents() → pickEvents()
  → autoEvents applied → statEffects stacked
  → decisionEvent? → set pendingDecision → UI shows DecisionSheet
  → resolveDecision(choiceId) → applyEffect() → _checkAchievements()
  → _persist() → MMKV + Firestore
```

### Persistence Priority
```
Native device → MMKV (synchronous, fast)
Web/Expo Go → AsyncStorage (async, cache-hydrated)
Cloud → Firestore (on every _persist(), if user logged in)
```

### IAP Flow
```
initIAP() → fetchProducts()
User taps buy → requestPurchase()
onPurchaseSuccess → verifyPurchaseOnServer() [Cloud Function]
  → applyPurchaseToStore() → _persist()
```

## Module Boundaries (ENFORCE STRICTLY)
| Layer | Can import | Cannot import |
|-------|-----------|--------------|
| `engine/` | `types/`, `data/` | `store/`, `services/`, `screens/`, `components/` |
| `store/` | `engine/`, `services/`, `types/`, `data/`, `utils/` | `screens/`, `components/` |
| `services/` | `types/`, Firebase SDK | `store/`, `engine/` |
| `screens/` | `store/`, `components/`, `types/`, `navigation/` | `engine/` directly |
| `components/` | `types/`, `theme/`, `constants/` | `store/` directly (use props) |

## Alias Paths (tsconfig + babel)
```
@components/* → src/components/*
@engine/*     → src/engine/*
@store/*      → src/store/*
@services/*   → src/services/*
@types/*      → src/types/*
@data/*       → src/data/*
@utils/*      → src/utils/*
@navigation/* → src/navigation/*
@theme/*      → src/theme/*
@constants/*  → src/constants/*
@config/*     → src/config/*
```
