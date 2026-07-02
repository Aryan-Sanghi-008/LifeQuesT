import { doc, getDoc } from 'firebase/firestore';
import { getFirestoreDb } from '@services/firebaseClient';
import {
  hydrateLiveOpsFromConfig,
  getFallbackLiveOpsConfig,
  type LiveOpsConfig,
  type LiveOpsSeasonConfig,
  type LimitedTimeOffer,
} from '@engine/liveOpsEngine';

export type { LiveOpsConfig, LiveOpsSeasonConfig, LimitedTimeOffer };

const CACHE_KEY = 'liveops:cache';
const CACHE_TIME_KEY = 'liveops:cacheTime';
const CACHE_TTL_MS = 60 * 60 * 1000;

type CacheStore = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
};

let cacheStore: CacheStore | null = null;

function getCacheStore(): CacheStore {
  if (cacheStore) return cacheStore;
  try {
    const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
    const instance = new MMKV({ id: 'lifequest' });
    cacheStore = {
      getString: (key) => instance.getString(key),
      set: (key, value) => instance.set(key, value),
    };
  } catch {
    const memory = new Map<string, string>();
    cacheStore = {
      getString: (key) => memory.get(key),
      set: (key, value) => { memory.set(key, value); },
    };
  }
  return cacheStore!;
}

export function readCachedLiveOpsConfig(): LiveOpsConfig | null {
  const store = getCacheStore();
  const raw = store.getString(CACHE_KEY);
  const cachedAt = Number(store.getString(CACHE_TIME_KEY) ?? '0');
  if (!raw || Date.now() - cachedAt > CACHE_TTL_MS) return null;
  try {
    return JSON.parse(raw) as LiveOpsConfig;
  } catch {
    return null;
  }
}

function writeCache(config: LiveOpsConfig): void {
  const store = getCacheStore();
  store.set(CACHE_KEY, JSON.stringify(config));
  store.set(CACHE_TIME_KEY, String(Date.now()));
}

function parseFirestoreConfig(data: Record<string, unknown>): LiveOpsConfig | null {
  const season = data.season as LiveOpsSeasonConfig | undefined;
  if (!season?.id || !season.title) return null;
  return {
    season,
    worldEvents: (data.worldEvents as string[]) ?? [],
    featuredScenario: (data.featuredScenario as string) ?? 'classic',
    limitedTimeOffers: (data.limitedTimeOffers as LimitedTimeOffer[]) ?? [],
  };
}

export async function fetchLiveOpsConfig(): Promise<LiveOpsConfig> {
  const cached = readCachedLiveOpsConfig();
  if (cached) {
    hydrateLiveOpsFromConfig(cached);
    return cached;
  }

  const db = getFirestoreDb();
  if (!db) {
    const fallback = getFallbackLiveOpsConfig();
    hydrateLiveOpsFromConfig(fallback);
    return fallback;
  }

  try {
    const snap = await getDoc(doc(db, 'liveops', 'current'));
    if (snap.exists()) {
      const parsed = parseFirestoreConfig(snap.data() as Record<string, unknown>);
      if (parsed) {
        writeCache(parsed);
        hydrateLiveOpsFromConfig(parsed);
        return parsed;
      }
    }
  } catch (e) {
    if (__DEV__) console.warn('[liveOpsConfig] fetch failed', e);
  }

  const fallback = getFallbackLiveOpsConfig();
  hydrateLiveOpsFromConfig(fallback);
  return fallback;
}

export function getActiveLimitedTimeOffers(config?: LiveOpsConfig | null): LimitedTimeOffer[] {
  const offers = config?.limitedTimeOffers ?? [];
  const now = Date.now();
  return offers.filter((offer) => {
    if (!offer.expiresAt) return true;
    const expires = Date.parse(offer.expiresAt);
    return Number.isFinite(expires) && expires > now;
  });
}
