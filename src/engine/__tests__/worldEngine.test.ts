import { tickWorldEvents, getWorldEventModifiers } from '../worldEngine';

describe('worldEngine', () => {
  it('resolves active world events randomly', () => {
    // Mock Math.random to resolve events but not trigger new ones (0.15 is between 0.08 and 0.20)
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.15);
    
    const active = ['recession', 'pandemic'];
    const result = tickWorldEvents(active);

    expect(result.nextEvents).toHaveLength(0);
    expect(result.logs).toContain('RESOLVED: The Economic Recession has officially ended.');
    expect(result.logs).toContain('RESOLVED: The Global Pandemic has officially ended.');

    mockRandom.mockRestore();
  });

  it('triggers new events if none are active', () => {
    // Mock Math.random to trigger new event
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.01);

    const result = tickWorldEvents([]);
    expect(result.nextEvents.length).toBeGreaterThan(0);
    expect(result.logs[0]).toContain('ALERT');

    mockRandom.mockRestore();
  });

  it('computes modifiers for active events', () => {
    const active = ['recession', 'war'];
    const mods = getWorldEventModifiers(active);

    expect(mods.taxRateDelta).toBe(0.10);
    expect(mods.promotionChanceModifier).toBe(-15);
    expect(mods.propertyAppreciationMultiplier).toBe(0.5);
  });
});
