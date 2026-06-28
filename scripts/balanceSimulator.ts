import { Character } from "../src/types";
import { runAgeUp } from "../src/engine/ageUpEngine";
import { runResolveDecision } from "../src/engine/resolveDecisionEngine";
import {
  generateRandomDNA,
  generateRandomPersonality,
} from "../src/utils/genetics";
import { getLifeStage } from "../src/utils/lifeStage";

function createMockCharacter(): Character {
  return {
    id: `sim_${Math.random()}`,
    name: "Sim Character",
    gender: "male",
    avatarSeed: "sim_seed",
    avatarId: "male_1",
    lifeStage: getLifeStage(0),
    country: "US",
    countryFlag: "🇺🇸",
    countryCode: "US",
    zodiac: "Aries",
    familyBackground: "middle",
    traits: [],
    job: "Unemployed",
    age: 0,
    birthYear: new Date().getFullYear(),
    stats: {
      health: 80,
      happiness: 80,
      intelligence: 80,
      looks: 80,
      wealth: 0,
      fitness: 80,
      social: 80,
      ambition: 80,
      mentalHealth: 80,
    },
    karma: 50,
    bankBalance: 200000,
    debt: 0,
    netWorthPeak: 200000,
    relationships: 0,
    children: 0,
    educationLevel: "none",
    people: [],
    career: null,
    assets: [],
    achievements: [],
    eventHistory: [],
    isAlive: true,
    coins: 0,
    gems: 0,
    isPremium: false,
    hasNoAds: false,
    luckBoostsRemaining: 0,
    hasReincarnationScroll: false,
    businesses: [],
    socialFollowers: 0,
    seasonXp: 0,
    hasSeasonPass: false,
    claimedSeasonTiers: [],
    degreeIds: [],
    certificationIds: [],
    totalCareerYears: 0,
    eventCooldowns: {},
    educationStage: "none",
    educationBranch: "none",
    criminalRecord: { crimes: [], jailYearsRemaining: 0, onProbation: false },
    dna: generateRandomDNA(),
    personality: generateRandomPersonality(),
    memories: [],
    familyReputation: 50,
    latentTalents: [],
    memoryTags: [],
    completedMemoryChains: [],
    focusDomainsUsed: [],
    focusPointsSpent: {},
    focusConfirmedForAge: 0,
    lifePhase: "acting",
    creditScore: 650,
    heatLevel: 0,
    hobbyProgress: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function runSimulations(numLives: number = 1000) {
  console.log(`Simulating ${numLives} lives for balance testing...`);
  let totalLifespan = 0;
  let billionaires = 0;
  let totalPrisons = 0;
  let totalMarriages = 0;
  let totalDivorces = 0;

  for (let i = 0; i < numLives; i++) {
    let char = createMockCharacter();
    let isDead = false;
    let marriageCount = 0;
    let divorceCount = 0;
    let wentToPrison = false;

    while (!isDead && char.age < 130) {
      char.focusConfirmedForAge = char.age;
      char.lifePhase = "acting";
      char.bankBalance = 2000000;
      char.debt = 0;

      // Auto-apply for a random job if unemployed and adult
      if (char.age >= 18 && !char.career) {
        char.career = {
          title: "Cashier",
          company: "Retail Co",
          salary: 1000000,
          yearsEmployed: 0,
          performance: 50,
        };
      }

      const outcome = runAgeUp(char, { forceDeath: false });

      if (outcome.type === "death") {
        Object.assign(char, outcome.patch);
        isDead = true;
        if (i === 0)
          console.log(`Character 0 died at ${char.age}. Death event:`, outcome);
      } else if (outcome.type === "jail_tick") {
        char.criminalRecord = outcome.criminalRecord;
        char.age++;
      } else if (
        outcome.type === "complete" ||
        outcome.type === "pending_decision"
      ) {
        Object.assign(char, outcome.patch);
        const events = outcome.newEventRecords || [];
        for (const e of events) {
          if (e.id === "marriage_proposal" || e.id === "elopement")
            marriageCount++;
          if (e.id === "divorce_finalized" || e.id.includes("divorce"))
            divorceCount++;
          if (
            e.id.includes("prison") ||
            e.id === "sentenced_to_prison" ||
            (char.criminalRecord?.jailYearsRemaining ?? 0) > 0
          )
            wentToPrison = true;
        }

        if (outcome.type === "pending_decision" && outcome.decisionEvent) {
          const e = outcome.decisionEvent;
          if (e.choices && e.choices.length > 0) {
            const randomChoice =
              e.choices[Math.floor(Math.random() * e.choices.length)];
            const res = runResolveDecision(char, e, randomChoice.id);
            if (res && res.patch) {
              Object.assign(char, res.patch);
            }
          }
        }
      }
    }

    totalLifespan += char.age;
    if (char.bankBalance >= 1000000000) billionaires++;
    if (wentToPrison) totalPrisons++;
    totalMarriages += marriageCount;
    totalDivorces += divorceCount;
  }

  const avgLifespan = totalLifespan / numLives;
  const billionaireRate = (billionaires / numLives) * 100;
  const prisonRate = (totalPrisons / numLives) * 100;

  console.log("--- BALANCE SIMULATION RESULTS ---");
  console.log(
    `Average Lifespan: ${avgLifespan.toFixed(2)} years (Target: 75-85)`,
  );
  console.log(
    `Billionaire Rate: ${billionaireRate.toFixed(2)}% (Target: < 5%)`,
  );
  console.log(
    `Prison Rate: ${prisonRate.toFixed(2)}% (Target: 10-15% of crime attempters)`,
  );
  console.log(`Marriages: ${totalMarriages}, Divorces: ${totalDivorces}`);
  if (totalMarriages > 0) {
    console.log(
      `Divorce Rate: ${((totalDivorces / totalMarriages) * 100).toFixed(2)}% (Target: 30-40%)`,
    );
  }
}

runSimulations(100);
