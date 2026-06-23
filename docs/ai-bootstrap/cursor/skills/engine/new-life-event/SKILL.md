---
name: new-life-event
description: Adds life events to gameData with eligibility tags and balanced stat effects. Use when creating events, expanding event library, or adding game content.
disable-model-invocation: true
---

# New Life Event

## Location
`src/data/gameData.ts` — `LIFE_EVENTS` array.

## Template
```ts
{
  id: 'unique_snake_case',
  title: 'Short Title',
  description: 'What happened to the player.',
  category: 'career', // childhood | school | career | health | crime | romance | random
  minAge: 18,
  maxAge: 65,
  minStats: { intelligence: 30 },
  tags: ['employed'],
  isDecision: true, // false for auto-apply
  choices: [
    {
      id: 'accept',
      label: 'Accept',
      effects: { happiness: 5, health: -2 },
      successChance: 0.8,
    },
  ],
  autoEffects: { happiness: 3 }, // if !isDecision
}
```

## Balance checklist
- Stat deltas: typically -15 to +15 per event; death only via explicit health logic.
- Eligibility: use `minAge`/`maxAge` + engine filters in `eventEngine.ts`.
- Frequency: each category ~every 5–10 in-game years.

## After adding
- Playtest at `minAge` with a test character.
- Append `SKILLS_CHANGELOG.md`.

See `docs/workflows/ENGINE_WORKFLOW.md` for difficulty curve by age.
