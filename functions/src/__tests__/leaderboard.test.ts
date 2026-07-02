import {
  buildLeaderboardEntry,
  updateLeaderboardEntry,
  fetchLeaderboardEntries,
  cleanupStaleSaves,
  DEFAULT_SEASON_ID,
  CLEANUP_BATCH_LIMIT,
} from '../leaderboard';

jest.mock('firebase-admin', () => ({
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
    },
  },
}));

function createMockDocRef(set = jest.fn(() => Promise.resolve())) {
  return { set, id: 'mock-doc' };
}
function createMockDb() {
  const flatSet = jest.fn(() => Promise.resolve());
  const seasonSet = jest.fn(() => Promise.resolve());
  const flatDocRef = createMockDocRef(flatSet);
  const seasonEntryRef = createMockDocRef(seasonSet);
  const seasonDocRef = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => seasonEntryRef),
    })),
  };

  let flatGetResult = { empty: true, docs: [] as Array<{ data: () => Record<string, unknown> }> };
  let seasonGetResult = { empty: true, docs: [] as Array<{ data: () => Record<string, unknown> }> };

  const flatLimit = jest.fn(() => ({
    get: jest.fn(() => Promise.resolve(flatGetResult)),
  }));
  const flatOrderBy = jest.fn(() => ({ limit: flatLimit }));

  const seasonLimit = jest.fn(() => ({
    get: jest.fn(() => Promise.resolve(seasonGetResult)),
  }));
  const seasonOrderBy = jest.fn(() => ({ limit: seasonLimit }));

  const collection = jest.fn((name: string) => {
    if (name !== 'leaderboard') {
      return {
        doc: jest.fn(() => ({ collection: jest.fn() })),
        orderBy: jest.fn(),
      };
    }
    return {
      doc: jest.fn((id: string) => {
        if (id === 'user_1') return flatDocRef;
        return {
          ...seasonDocRef,
          collection: jest.fn((sub: string) => {
            if (sub !== 'entries') return { doc: jest.fn() };
            return {
              doc: jest.fn(() => seasonEntryRef),
              orderBy: seasonOrderBy,
            };
          }),
        };
      }),
      orderBy: flatOrderBy,
    };
  });

  const batchDelete = jest.fn();
  const batchCommit = jest.fn(() => Promise.resolve());
  const batch = jest.fn(() => ({
    delete: batchDelete,
    commit: batchCommit,
  }));

  const savesGet = jest.fn(() => Promise.resolve({ empty: true, docs: [] }));
  const savesLimit = jest.fn(() => ({ get: savesGet }));
  const savesWhere = jest.fn(() => ({ limit: savesLimit }));
  const collectionGroup = jest.fn(() => ({ where: savesWhere }));

  const db = {
    collection,
    collectionGroup,
    batch,
    __flatSet: flatSet,
    __seasonSet: seasonSet,
    __setFlatGetResult: (result: typeof flatGetResult) => { flatGetResult = result; },
    __setSeasonGetResult: (result: typeof seasonGetResult) => { seasonGetResult = result; },
    __savesGet: savesGet,
    __savesLimit: savesLimit,
    __batchDelete: batchDelete,
    __batchCommit: batchCommit,
  };

  return db as unknown as FirebaseFirestore.Firestore & {
    __flatSet: jest.Mock;
    __seasonSet: jest.Mock;
    __setFlatGetResult: (r: typeof flatGetResult) => void;
    __setSeasonGetResult: (r: typeof seasonGetResult) => void;
    __savesGet: jest.Mock;
    __savesLimit: jest.Mock;
    __batchDelete: jest.Mock;
    __batchCommit: jest.Mock;
  };
}

describe('buildLeaderboardEntry', () => {
  it('fills defaults and maps display fields', () => {
    const entry = buildLeaderboardEntry('uid_1', { score: 9000, lifeAge: 72 });
    expect(entry).toMatchObject({
      uid: 'uid_1',
      score: 9000,
      lifeAge: 72,
      age: 72,
      country: 'Unknown',
      displayName: 'Anonymous',
      characterName: 'Anonymous',
      avatarSeed: 'uid_1',
      netWorth: 0,
      updatedAt: 'SERVER_TIMESTAMP',
    });
  });
});

describe('updateLeaderboardEntry', () => {
  it('dual-writes flat and season entry documents', async () => {
    const db = createMockDb();
    const result = await updateLeaderboardEntry(db, 'user_1', {
      score: 5000,
      lifeAge: 65,
      displayName: 'Alex',
      seasonId: 'season_2',
    });

    expect(result).toEqual({ ok: true, seasonId: 'season_2' });
    expect(db.__flatSet).toHaveBeenCalledTimes(1);
    expect(db.__seasonSet).toHaveBeenCalledTimes(1);
    expect(db.__flatSet.mock.calls[0][0]).toMatchObject({
      uid: 'user_1',
      score: 5000,
      displayName: 'Alex',
    });
    expect(db.__seasonSet.mock.calls[0][0]).toEqual(db.__flatSet.mock.calls[0][0]);
  });

  it('defaults season id when omitted', async () => {
    const db = createMockDb();
    const result = await updateLeaderboardEntry(db, 'user_1', {
      score: 100,
      lifeAge: 30,
    });
    expect(result.seasonId).toBe(DEFAULT_SEASON_ID);
  });
});

describe('fetchLeaderboardEntries', () => {
  it('returns season entries when season collection has data', async () => {
    const db = createMockDb();
    db.__setSeasonGetResult({
      empty: false,
      docs: [{ data: () => ({ uid: 'a', score: 100 }) }],
    });

    const result = await fetchLeaderboardEntries(db, 50, 'season_1_inflation');
    expect(result.entries).toHaveLength(1);
    expect(result.seasonId).toBe('season_1_inflation');
  });

  it('falls back to flat leaderboard when season is empty', async () => {
    const db = createMockDb();
    db.__setSeasonGetResult({ empty: true, docs: [] });
    db.__setFlatGetResult({
      empty: false,
      docs: [{ data: () => ({ uid: 'legacy', score: 50 }) }],
    });

    const result = await fetchLeaderboardEntries(db, 50, 'season_1_inflation');
    expect(result.entries).toEqual([{ uid: 'legacy', score: 50 }]);
  });
});

describe('cleanupStaleSaves', () => {
  it('deletes up to the batch cap and commits', async () => {
    const db = createMockDb();
    const staleDocs = Array.from({ length: 3 }, (_, i) => ({
      ref: { path: `saves/u/slots/${i}` },
    }));
    db.__savesGet.mockResolvedValueOnce({ empty: false, docs: staleDocs });

    const deleted = await cleanupStaleSaves(db, Date.now());
    expect(deleted).toBe(3);
    expect(db.__savesLimit).toHaveBeenCalledWith(CLEANUP_BATCH_LIMIT);
    expect(db.__batchDelete).toHaveBeenCalledTimes(3);
    expect(db.__batchCommit).toHaveBeenCalledTimes(1);
  });

  it('returns zero when no stale saves', async () => {
    const db = createMockDb();
    expect(await cleanupStaleSaves(db)).toBe(0);
    expect(db.__batchCommit).not.toHaveBeenCalled();
  });
});
