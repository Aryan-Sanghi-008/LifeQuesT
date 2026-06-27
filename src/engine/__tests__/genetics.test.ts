import {
  generateRandomDNA,
  generateRandomPersonality,
  crossoverDNA,
  crossoverPersonality,
  determineTraitsFromPersonality,
  calculateStatCap,
} from '../../utils/genetics';

describe('Genetics Utility Tests', () => {
  describe('calculateStatCap', () => {
    it('should calculate correct caps for different allele combinations', () => {
      expect(calculateStatCap('11')).toBe(110);
      expect(calculateStatCap('12')).toBe(100);
      expect(calculateStatCap('22')).toBe(90);
      expect(calculateStatCap('23')).toBe(80);
      expect(calculateStatCap('33')).toBe(70);
    });
  });

  describe('generateRandomDNA', () => {
    it('should generate valid DNA with markers A-L', () => {
      const dna = generateRandomDNA();
      expect(dna).toBeDefined();
      expect(dna.markers).toBeDefined();

      const keys = Object.keys(dna.markers);
      expect(keys.length).toBe(12);
      expect(keys).toContain('A');
      expect(keys).toContain('L');

      // Verify each marker is 2 characters long and uses valid alleles
      keys.forEach(k => {
        const val = dna.markers[k];
        expect(val.length).toBe(2);
        expect(['1', '2', '3']).toContain(val.charAt(0));
        expect(['1', '2', '3']).toContain(val.charAt(1));
      });
    });

    it('should generate correct stat potentials within range 70-110', () => {
      const dna = generateRandomDNA();
      expect(dna.statPotentials).toBeDefined();

      const stats = Object.keys(dna.statPotentials) as Array<keyof typeof dna.statPotentials>;
      expect(stats.length).toBe(9); // 9 core stats

      stats.forEach(s => {
        const potential = dna.statPotentials[s];
        expect(potential).toBeGreaterThanOrEqual(70);
        expect(potential).toBeLessThanOrEqual(110);
      });
    });
  });

  describe('generateRandomPersonality', () => {
    it('should generate valid Big Five scores between 20 and 80', () => {
      const pers = generateRandomPersonality();
      expect(pers).toBeDefined();
      expect(pers.openness).toBeGreaterThanOrEqual(20);
      expect(pers.openness).toBeLessThanOrEqual(80);
      expect(pers.conscientiousness).toBeGreaterThanOrEqual(20);
      expect(pers.conscientiousness).toBeLessThanOrEqual(80);
      expect(pers.extraversion).toBeGreaterThanOrEqual(20);
      expect(pers.extraversion).toBeLessThanOrEqual(80);
      expect(pers.agreeableness).toBeGreaterThanOrEqual(20);
      expect(pers.agreeableness).toBeLessThanOrEqual(80);
      expect(pers.neuroticism).toBeGreaterThanOrEqual(20);
      expect(pers.neuroticism).toBeLessThanOrEqual(80);
    });
  });

  describe('crossoverDNA', () => {
    it('should generate crossed over DNA from parents', () => {
      const parentA = generateRandomDNA();
      const parentB = generateRandomDNA();

      const child = crossoverDNA(parentA, parentB);
      expect(child).toBeDefined();
      expect(Object.keys(child.markers).length).toBe(12);

      // Verify alleles are inherited from parents (or mutated)
      Object.keys(child.markers).forEach(k => {
        const childMarker = child.markers[k];
        const cAllele1 = childMarker.charAt(0);
        const cAllele2 = childMarker.charAt(1);

        // Note: 2% mutation rate implies they might occasionally mutate.
        // We assert they must either be inherited or be a valid allele '1', '2', or '3'.
        expect(['1', '2', '3']).toContain(cAllele1);
        expect(['1', '2', '3']).toContain(cAllele2);
      });
    });
  });

  describe('crossoverPersonality', () => {
    it('should average parent personality values with minor variance', () => {
      const parentA = {
        openness: 50,
        conscientiousness: 60,
        extraversion: 70,
        agreeableness: 40,
        neuroticism: 30,
      };

      const parentB = {
        openness: 50,
        conscientiousness: 60,
        extraversion: 70,
        agreeableness: 40,
        neuroticism: 30,
      };

      const child = crossoverPersonality(parentA, parentB);
      // Average is exactly 50, 60, 70, 40, 30.
      // Mutation shift can vary by [-5, 5] if triggered, or be exact.
      expect(child.openness).toBeGreaterThanOrEqual(45);
      expect(child.openness).toBeLessThanOrEqual(55);
      expect(child.conscientiousness).toBeGreaterThanOrEqual(55);
      expect(child.conscientiousness).toBeLessThanOrEqual(65);
    });
  });

  describe('determineTraitsFromPersonality', () => {
    it('should map personality profile to existing character traits correctly', () => {
      const pers = {
        openness: 80,
        conscientiousness: 80,
        extraversion: 80,
        agreeableness: 80,
        neuroticism: 80,
      };

      const dna = {
        markers: {},
        statPotentials: {} as any,
        predispositions: ['vulnerable_mind', 'latent_entrepreneur', 'perfect_pitch'],
      };

      const traits = determineTraitsFromPersonality(pers, dna);
      expect(traits).toContain('Vulnerable Mind');
      expect(traits).toContain('Disciplined');
      expect(traits).toContain('Creative');
      expect(traits).toContain('Charismatic');
      expect(traits).toContain('Empathetic');
      expect(traits).toContain('Latent Entrepreneur');
      expect(traits).toContain('Perfect Pitch');
    });

    it('should handle low conscientiousness', () => {
      const pers = {
        openness: 50,
        conscientiousness: 10,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
      };

      const dna = {
        markers: {},
        statPotentials: {} as any,
        predispositions: [],
      };

      const traits = determineTraitsFromPersonality(pers, dna);
      expect(traits).toContain('Procrastinator');
      expect(traits).not.toContain('Disciplined');
    });
  });
});
