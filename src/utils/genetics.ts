import { BigFivePersonality, CharacterDNA, StatKey } from '../types';

const STATS_KEYS: StatKey[] = ['health', 'happiness', 'intelligence', 'wealth', 'fitness', 'looks', 'social', 'ambition', 'mentalHealth'];
const MARKERS_KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// Helper to generate a random allele ('1', '2', '3')
function randomAllele(): string {
  const r = Math.random();
  if (r < 0.25) return '1'; // Positive/Dominant
  if (r < 0.75) return '2'; // Average
  return '3';               // Negative/Recessive
}

// Calculate potential cap for a single stat based on its genetic marker
export function calculateStatCap(markerValue: string): number {
  const allele1 = markerValue.charAt(0);
  const allele2 = markerValue.charAt(1);

  const val = (a: string) => {
    if (a === '1') return 55;
    if (a === '2') return 45;
    return 35;
  };

  return val(allele1) + val(allele2);
}

// Generate starting random DNA
export function generateRandomDNA(): CharacterDNA {
  const markers: Record<string, string> = {};
  MARKERS_KEYS.forEach(key => {
    markers[key] = randomAllele() + randomAllele();
  });

  const statPotentials = {} as Record<StatKey, number>;
  // Map A-I to the nine stats
  STATS_KEYS.forEach((stat, idx) => {
    const markerKey = MARKERS_KEYS[idx];
    statPotentials[stat] = calculateStatCap(markers[markerKey]);
  });

  const predispositions: string[] = [];
  // Marker I affects mental health and depression
  if (markers['I'].includes('3')) predispositions.push('depression');
  // Marker J affects musicality
  if (markers['J'].includes('1')) predispositions.push('perfect_pitch');
  // Marker K affects business talent
  if (markers['K'].includes('1')) predispositions.push('latent_entrepreneur');
  // Marker L affects vulnerability
  if (markers['L'].includes('3')) predispositions.push('vulnerable_mind');

  return {
    markers,
    statPotentials,
    predispositions,
  };
}

// Generate starting random Big Five personality
export function generateRandomPersonality(): BigFivePersonality {
  const rVal = () => 20 + Math.floor(Math.random() * 61); // 20 to 80
  return {
    openness: rVal(),
    conscientiousness: rVal(),
    extraversion: rVal(),
    agreeableness: rVal(),
    neuroticism: rVal(),
  };
}

// Mendelian DNA Crossover between two parents
export function crossoverDNA(parentA: CharacterDNA, parentB: CharacterDNA): CharacterDNA {
  const childMarkers: Record<string, string> = {};

  MARKERS_KEYS.forEach(key => {
    const alleleA = parentA.markers[key] || '22';
    const alleleB = parentB.markers[key] || '22';

    // Pick one allele from parent A and one from parent B
    let inheritA = alleleA.charAt(Math.random() < 0.5 ? 0 : 1);
    let inheritB = alleleB.charAt(Math.random() < 0.5 ? 0 : 1);

    // 2% mutation rate per allele
    if (Math.random() < 0.02) inheritA = randomAllele();
    if (Math.random() < 0.02) inheritB = randomAllele();

    childMarkers[key] = inheritA + inheritB;
  });

  const statPotentials = {} as Record<StatKey, number>;
  STATS_KEYS.forEach((stat, idx) => {
    const markerKey = MARKERS_KEYS[idx];
    statPotentials[stat] = calculateStatCap(childMarkers[markerKey]);
  });

  const predispositions: string[] = [];
  if (childMarkers['I'].includes('3')) predispositions.push('depression');
  if (childMarkers['J'].includes('1')) predispositions.push('perfect_pitch');
  if (childMarkers['K'].includes('1')) predispositions.push('latent_entrepreneur');
  if (childMarkers['L'].includes('3')) predispositions.push('vulnerable_mind');

  return {
    markers: childMarkers,
    statPotentials,
    predispositions,
  };
}

// Big Five Personality Crossover with mutation variance
export function crossoverPersonality(parentA: BigFivePersonality, parentB: BigFivePersonality): BigFivePersonality {
  const mutate = (val: number) => {
    // 2% mutation rate variance: [-5, +5] range shift
    const shift = Math.random() < 0.1 ? Math.floor(Math.random() * 11) - 5 : 0;
    return Math.max(0, Math.min(100, Math.round(val + shift)));
  };

  return {
    openness: mutate((parentA.openness + parentB.openness) / 2),
    conscientiousness: mutate((parentA.conscientiousness + parentB.conscientiousness) / 2),
    extraversion: mutate((parentA.extraversion + parentB.extraversion) / 2),
    agreeableness: mutate((parentA.agreeableness + parentB.agreeableness) / 2),
    neuroticism: mutate((parentA.neuroticism + parentB.neuroticism) / 2),
  };
}

// Map personality profiles and latent genetics to character traits
export function determineTraitsFromPersonality(personality: BigFivePersonality, dna: CharacterDNA): string[] {
  const traits: string[] = [];

  if (personality.neuroticism > 75 && dna.predispositions.includes('vulnerable_mind')) {
    traits.push('Vulnerable Mind');
  }
  if (personality.conscientiousness > 75) {
    traits.push('Disciplined');
  } else if (personality.conscientiousness < 25) {
    traits.push('Procrastinator');
  }

  if (personality.openness > 75) {
    traits.push('Creative');
  }

  if (personality.extraversion > 75) {
    traits.push('Charismatic');
  }

  if (personality.agreeableness > 75) {
    traits.push('Empathetic');
  }

  if (dna.predispositions.includes('latent_entrepreneur')) {
    traits.push('Latent Entrepreneur');
  }

  if (dna.predispositions.includes('perfect_pitch')) {
    traits.push('Perfect Pitch');
  }

  return traits;
}
