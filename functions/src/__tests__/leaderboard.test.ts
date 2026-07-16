import {
  buildLeaderboardEntry,
  updateLeaderboardEntry,
  fetchLeaderboardEntries,
  cleanupStaleSaves,
  sanitizeLeaderboardPayload,
  LeaderboardValidationError,
  DEFAULT_SEASON_ID,
  CLEANUP_BATCH_LIMIT,
  MAX_SCORE,
} from '../leaderboard';

jest.mock('firebase-admin', () => ({
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
    },
  },
}));

function createMockDocRef(set = jest.fn(async (..._args: unknown[]) => undefined)) {
  return { set, id: 'mock-doc' };
}

function createMockDb(opts?: { existingScore?: number }) {
  const flatSet = jest.fn(async (..._args: unknown[]) => undefined);
  const seasonSet = jest.fn(async (..._args: unknown[]) => undefined);
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

  const runTransaction = jest.fn(async (fn: (tx: {
    get: (ref: unknown) => Promise<{ exists: boolean; data: () => { score?: number } | undefined }>;
    set: (ref: unknown, data: unknown, opts?: unknown) => void;
  }) => Promise<{ updated: boolean }>) => {
    const tx = {
      get: async (_ref: unknown) => ({
        exists: opts?.existingScore != null,
        data: () => (opts?.existingScore != null ? { score: opts.existingScore } : undefined),
      }),
      set: (ref: unknown, data: unknown, _mergeOpts?: unknown) => {
        if (ref === seasonEntryRef) seasonSet(data);
        if (ref === flatDocRef) flatSet(data);
      },
    };
    return fn(tx);
  });

  const db = {
    collection,
    collectionGroup,
    batch,
    runTransaction,
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

describe('sanitizeLeaderboardPayload', () => {
  it('rejects Infinity / NaN scores', () => {
    expect(() => sanitizeLeaderboardPayload({ score: Infinity, lifeAge: 40 }))
      .toThrow(LeaderboardValidationError);
    expect(() => sanitizeLeaderboardPayload({ score: NaN, lifeAge: 40 }))
      .toThrow(LeaderboardValidationError);
  });

  it('rejects scores above MAX_SCORE', () => {
    expect(() => sanitizeLeaderboardPayload({ score: MAX_SCORE + 1, lifeAge: 40 }))
      .toThrow(LeaderboardValidationError);
  });

  it('strips control characters from displayName', () => {
    const result = sanitizeLeaderboardPayload({
      score: 10,
      lifeAge: 20,
      displayName: 'Hi\u0000there',
    });
    expect(result.displayName).toBe('Hithere');
  });
});

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
  it('atomically writes season entry and legacy flat doc', async () => {
    const db = createMockDb();
    const result = await updateLeaderboardEntry(db, 'user_1', {
      score: 5000,
      lifeAge: 65,
      displayName: 'Alex',
      seasonId: 'season_2',
    });

    expect(result).toEqual({ ok: true, seasonId: 'season_2', updated: true });
    expect(db.__flatSet).toHaveBeenCalledTimes(1);
    expect(db.__seasonSet).toHaveBeenCalledTimes(1);
    expect(db.__flatSet.mock.calls[0][0]).toMatchObject({
      uid: 'user_1',
      score: 5000,
      displayName: 'Alex',
    });
    expect(db.__seasonSet.mock.calls[0][0]).toEqual(db.__flatSet.mock.calls[0][0]);
  });

  it('skips update when existing score is higher', async () => {
    const db = createMockDb({ existingScore: 9000 });
    const result = await updateLeaderboardEntry(db, 'user_1', {
      score: 100,
      lifeAge: 30,
    });
    expect(result.updated).toBe(false);
    expect(db.__seasonSet).not.toHaveBeenCalled();
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
