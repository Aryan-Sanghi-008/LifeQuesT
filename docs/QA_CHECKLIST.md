# LifeQuest — Pre-Launch QA Checklist (Phase 14)

Manual verification before soft launch. Start with automated prep:

```bash
npm run qa:prep          # validate + ageUp perf gate (p95 < 50ms)
npm run analyze:bundle   # APK/JS size (optional, before store submit)
```

See also [TESTING.md](./TESTING.md) and [PERFORMANCE_BASELINE.md](./PERFORMANCE_BASELINE.md).

## Device matrix

| Device | Role | Status | Notes |
|---|---|---|---|
| OnePlus 13R | Primary dev / flagship benchmark | | |
| Redmi Note 11 class (or emulator) | Mid-range scroll/TTI gap check | Optional | |
| Pixel Tablet emulator | Tablet Home/Profile 2-column layout | | |

---

## Core gameplay

### Cold start TTI
- **Prereq:** Dev client or release build on device
- **Steps:** Force-stop app → launch → wait until Home tab is tappable
- **Expected:** Home loads without crash; Metro shows `[perf] cold_start:*` logs
- **Pass/Fail:** |

### Offline gameplay
- **Prereq:** Active save with character
- **Steps:** Enable airplane mode → Life tab → Age Up → resolve a decision → browse Shop bundles tab
- **Expected:** Core loop works; no hard crash on missing network
- **Pass/Fail:** |

### Save slots (3 slots)
- **Steps:** Save Slots screen → create in slot 2 → load slot 2 → delete slot 2
- **Expected:** Correct character loads; delete clears slot; active slot updates
- **Pass/Fail:** |

### Cloud sync conflict
- **Prereq:** Signed-in cloud user; local + cloud saves diverged
- **Steps:** Trigger conflict modal → choose local, then repeat choosing cloud on another test
- **Expected:** Selected save becomes active; modal dismisses
- **Pass/Fail:** |

### Daily bonus / midnight rollover
- **Steps:** Home → claim daily login reward → note countdown → (optional) change device date past midnight → reopen app
- **Expected:** Claim succeeds once per day; countdown resets after rollover
- **Pass/Fail:** |

### Dark mode
- **Steps:** Settings → Dark theme (or system dark) → visit Home, Life, Shop, Settings, Death, Character Create
- **Expected:** Readable contrast; no invisible text on cards/buttons
- **Pass/Fail:** |

---

## Monetization

### IAP sandbox (Play Store)
- **Prereq:** License tester account in Play Console; internal/closed track build
- **Steps:** Shop → buy starter pack or gems → complete sandbox purchase
- **Expected:** Entitlements apply (coins/gems/season pass); toast confirms
- **Pass/Fail:** |

### Restore purchases
- **Steps:** Shop → Restore Purchases (footer/legal area)
- **Expected:** Prior sandbox grants re-applied or clear “no purchases” message
- **Pass/Fail:** |

### Rewarded ads / ad-free
- **Steps:** Non-premium: trigger rewarded ad path. Premium: verify no interstitial on death flow
- **Expected:** Reward granted or ad-free skip
- **Pass/Fail:** |

---

## Notifications & background

### Push + daily quest reset
- **Prereq:** Physical device; notification permission granted
- **Steps:** Grant permission → background app overnight → check notification tray
- **Expected:** Retention/daily quest notification fires per schedule
- **Pass/Fail:** |

### Battery optimization
- **Steps:** Android Settings → Apps → LifeQuest → Battery → Unrestricted (or test with optimization ON)
- **Expected:** Scheduled notifications still appear when unrestricted; document behavior if restricted
- **Pass/Fail:** |

---

## Observability

### Crashlytics (release build)
- **Prereq:** Release/dev client with Crashlytics enabled (not Expo Go)
- **Steps:** Trigger a test crash (dev menu if available, or temporary throw in Settings dev section) → reopen app → check Firebase Crashlytics dashboard within ~15 min
- **Expected:** Crash appears in console with symbolicated stack
- **Pass/Fail:** |

### Analytics
- **Steps:** Age up once → purchase sandbox item → check Firebase Analytics debug view or console events
- **Expected:** `age_up` and purchase-related events logged
- **Pass/Fail:** |

---

## Accessibility (TalkBack — critical paths)

Enable TalkBack: Settings → Accessibility → TalkBack.

| # | Path | Steps | Expected | Pass/Fail |
|---|---|---|---|---|
| 1 | Tabs | Swipe through bottom tabs | Each tab announced with selected state | |
| 2 | Home | Claim daily reward, mystery box, quest | Verb-first labels; actions activate | |
| 3 | Life | Age Up, open decision sheet, pick choice | Age Up labeled; choices have hints | |
| 4 | Shop | Tab filters, product buy buttons | “Buy … for …” on products | |
| 5 | Death | Select heir, Continue / Reincarnate | Heir cards labeled; actions reachable | |
| 6 | Character Create | Back, Continue, Begin Your Life | Step heading focused on entry | |
| 7 | Settings | Toggles, theme, color blind mode | All toggles labeled and toggleable | |

Focus should land on screen heading after navigation ([ACCESSIBILITY.md](./ACCESSIBILITY.md)).

---

## Performance (Phase 12 closeout)

- [ ] Fill **After** table in [PERFORMANCE_BASELINE.md](./PERFORMANCE_BASELINE.md)
- [ ] Run `npm run analyze:bundle` — record APK/JS size in baseline doc
- [ ] LifeScreen scroll rating with 40+ year save (1–5)
- [ ] Confirm `npm test -- ageUp.perf.test.ts` passes (CI gate: p95 < 50ms)

---

## Country economy spot-check (Phases 15–17)

- [ ] Create life in **India (IN)** — engineer salary, tuition, and interaction costs in ₹
- [ ] Create life in **USA (US)** — verify costs differ materially from India
- [ ] Enroll in degree → age up through full program → confirm auto-graduation
- [ ] Overspend cash → confirm debt accrues (not silent floor at zero)
- [ ] Relationship gift/movie shows local currency cost before confirm
- [ ] Active challenge shows % progress on Home when wealth challenge selected
- [ ] First-life tutorial overlay on Home (skippable)

---

## Known gaps / post-launch backlog

- Secondary screens (Court, Museum, Family Tree, etc.) — full label audit deferred
- Tritanopia color-blind mode not implemented
- Mid-range device metrics if only OnePlus 13R tested

---

## Sign-off

| Area | Owner | Date | Pass/Fail |
|---|---|---|---|
| Automated tests (`npm run qa:prep`) | | | |
| Device gameplay | | | |
| IAP sandbox | | | |
| TalkBack critical paths | | | |
| Performance baseline | | | |
