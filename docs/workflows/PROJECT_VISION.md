# LifeQuesT — Project Vision & Roadmap

## 🎯 What is LifeQuesT?
A mobile life-simulation RPG (React Native / Expo SDK 56) where players live virtual lives from birth to death, making decisions across education, career, relationships, finances, and random life events. Inspired by BitLife but with deeper RPG mechanics, premium content, and gamification (coins, gems, achievements, reincarnation).

## 🏗️ Current Stack (as of 2026)
- **Runtime**: Expo ~56, React Native 0.85, React 19
- **Language**: TypeScript ~6.0 (strict)
- **State**: Zustand + Immer middleware (`useGameStore`)
- **Storage**: MMKV (primary, native) → AsyncStorage (fallback/web)
- **Styling**: NativeWind v4 (TailwindCSS v3 classes on RN)
- **Navigation**: React Navigation v6 (native stack + bottom tabs)
- **Backend**: Firebase (Auth, Firestore cloud save), Firebase Cloud Functions
- **Monetization**: react-native-iap (IAP), react-native-google-mobile-ads (Ads)
- **Animation**: react-native-reanimated v4, react-native-animatable
- **Haptics**: react-native-haptic-feedback
- **Avatar**: @dicebear/core v10

## 🗺️ Roadmap

### Phase 1 — Core Stability (Current)
- [x] Character creation with traits, zodiac, family background
- [x] Age-up loop with auto events + decision events
- [x] Career system (apply, raise, promotion, quit)
- [x] Asset system (property, vehicle, investment)
- [x] People/NPC system (parents, friends, spouse, children, coworkers)
- [x] Save slots (3 slots, MMKV + cloud sync)
- [x] IAP (coins, gems, premium, no-ads)
- [x] Achievement system
- [x] Reincarnation with stat carry

### Phase 2 — Depth & Engagement
- [ ] Expanded event library (500+ events) — ~50 authored expansion batch shipped; full library ongoing
- [x] Personality traits expansion (15 traits shipped; 25+ roadmap)
- [x] Education mini-games (study sessions)
- [x] Crime & karma consequences
- [x] Mental health stat
- [x] Relationship depth (dating → marriage → divorce)
- [x] Social media virality events
- [x] Business ownership engine
- [x] Leaderboards (Firebase)

### Phase 3 — Growth & Monetization
- [x] Daily challenges / quests
- [x] Season pass system
- [x] Cosmetic avatar packs
- [x] Country-specific event libraries
- [x] Push notifications (life reminders)
- [ ] Android widget (JS snapshot only; native widget deferred)

### Phase 4 — Platform & Scale
- [ ] iOS & Android store release
- [ ] Web version (Expo Web)
- [ ] Cloud save cross-device sync
- [ ] Social sharing (life summary card)
- [ ] A/B testing framework

## 🔑 Design Principles
1. **Every stat decision must feel consequential** — stat changes should be visible and understandable
2. **Minimal loading, maximum immersion** — MMKV for instant sync, no loading spinners in the game loop
3. **Balanced monetization** — free players can complete a full life; premium unlocks depth/convenience
4. **Type safety everywhere** — no `any`, no implicit types, strict TS
5. **Engine isolation** — game logic lives in `src/engine/`, never in screens or components
6. **One source of truth** — `useGameStore` is the only state; never duplicate state in local component state for game data
