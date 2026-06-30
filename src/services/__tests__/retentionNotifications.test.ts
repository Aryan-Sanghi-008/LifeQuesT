import {
  buildQuestResetBody,
  buildStreakRiskBody,
  buildAbsenceBody,
  buildWorldEventBody,
  buildNpcMilestoneBody,
  getAbsenceTriggerDate,
  shouldScheduleStreakRisk,
  findNewWorldEventIds,
  findNpcAgeMilestones,
  buildRetentionSnapshot,
} from '../retentionNotifications';
import { Person } from '@/types';
import { WORLD_EVENTS_POOL } from '@engine/worldEngine';

function person(overrides: Partial<Person> = {}): Person {
  return {
    id: 'p1',
    name: 'Maria',
    age: 59,
    gender: 'female',
    relationType: 'mother',
    relationshipScore: 80,
    avatarSeed: 'seed',
    isAlive: true,
    ...overrides,
  };
}

describe('retentionNotifications', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('buildQuestResetBody mentions gems on gem login days', () => {
    expect(buildQuestResetBody([], 7)).toContain('5 Gems');
  });

  it('buildQuestResetBody mentions top quest coins', () => {
    expect(buildQuestResetBody([{ rewardCoins: 50 } as never])).toContain('50 Coins');
  });

  it('buildStreakRiskBody includes streak count', () => {
    expect(buildStreakRiskBody(12)).toBe(
      "Don't break your 🔥 12-day streak! Age up once to keep it.",
    );
  });

  it('buildAbsenceBody projects age forward', () => {
    expect(buildAbsenceBody(24)).toBe(
      'Life goes on without you... Age 24 → 26 happened while you were away',
    );
  });

  it('buildWorldEventBody uses event title', () => {
    const evt = WORLD_EVENTS_POOL[0];
    expect(buildWorldEventBody(evt)).toContain(evt.title);
  });

  it('buildNpcMilestoneBody formats family member birthday', () => {
    expect(buildNpcMilestoneBody(person({ age: 60 }))).toBe(
      'Your mother Maria just turned 60. Wish them a happy birthday?',
    );
  });

  it('shouldScheduleStreakRisk when streak active and not played today', () => {
    expect(shouldScheduleStreakRisk(5, '2020-01-01', '2020-01-02')).toBe(true);
    expect(shouldScheduleStreakRisk(5, '2020-01-02', '2020-01-02')).toBe(false);
    expect(shouldScheduleStreakRisk(0, '2020-01-01', '2020-01-02')).toBe(false);
  });

  it('findNewWorldEventIds returns only added ids', () => {
    expect(findNewWorldEventIds(['recession'], ['recession', 'war'])).toEqual(['war']);
  });

  it('findNpcAgeMilestones detects milestone birthdays', () => {
    const prev = [person({ age: 59 })];
    const next = [person({ age: 60 })];
    expect(findNpcAgeMilestones(prev, next)).toHaveLength(1);
    expect(findNpcAgeMilestones(prev, next)[0].age).toBe(60);
  });

  it('getAbsenceTriggerDate is two days after last active', () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    const key = future.toISOString().slice(0, 10);
    const trigger = getAbsenceTriggerDate(key);
    expect(trigger).not.toBeNull();
    expect(trigger!.getHours()).toBe(10);
  });

  it('buildRetentionSnapshot maps character fields', () => {
    const snapshot = buildRetentionSnapshot(
      {
        name: 'Alex',
        age: 30,
        dailyStreak: 3,
        lastActiveDate: '2020-01-01',
        activeWorldEvents: ['war'],
        people: [],
      } as never,
      [],
    );
    expect(snapshot.characterName).toBe('Alex');
    expect(snapshot.dailyStreak).toBe(3);
    expect(snapshot.activeWorldEventIds).toEqual(['war']);
  });
});
