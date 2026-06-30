import { rollInteraction, getInteraction } from '@engine/peopleEngine';

describe('rollInteraction', () => {
  it('returns success outcome when roll passes', () => {
    const interaction = getInteraction('cut_off');
    expect(interaction).not.toBeNull();
    const result = rollInteraction(interaction!);
    expect(result.success).toBe(true);
    expect(result.delta).toBe(-50);
  });

  it('can return fail message for risky interactions', () => {
    const interaction = getInteraction('insult');
    expect(interaction).not.toBeNull();
    const fails: string[] = [];
    for (let i = 0; i < 50; i++) {
      const r = rollInteraction(interaction!);
      if (!r.success) fails.push(r.message);
    }
    expect(fails.length).toBeGreaterThan(0);
  });
});
