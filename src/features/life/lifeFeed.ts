import type { LifeEventRecord } from "@/types";

export const LIFE_STAGE_CONFIG: Array<{
  maxAge: number;
  label: string;
  emoji: string;
  gradient: readonly [string, string];
}> = [
  { maxAge: 12, label: "Childhood", emoji: "🧒", gradient: ["#10B981", "#34D399"] },
  { maxAge: 17, label: "Teenager", emoji: "🎒", gradient: ["#3B82F6", "#60A5FA"] },
  { maxAge: 29, label: "Young Adult", emoji: "🚀", gradient: ["#F59E0B", "#FBBF24"] },
  { maxAge: 59, label: "Adult", emoji: "💼", gradient: ["#8B5CF6", "#A78BFA"] },
  { maxAge: 999, label: "Golden Years", emoji: "🌟", gradient: ["#EC4899", "#F472B6"] },
];

export function getLifeStageConfig(age: number) {
  return (
    LIFE_STAGE_CONFIG.find((s) => age <= s.maxAge) ??
    LIFE_STAGE_CONFIG[LIFE_STAGE_CONFIG.length - 1]
  );
}

export function getLifeStageLabel(age: number): string {
  return getLifeStageConfig(age).label;
}

export type FeedItem =
  | { kind: "header"; age: number; isStageTransition: boolean; key: string }
  | { kind: "event"; event: LifeEventRecord; staggerIndex: number; key: string };

export function buildFeedItems(events: LifeEventRecord[]): FeedItem[] {
  const map = new Map<number, LifeEventRecord[]>();
  events.forEach((e) => {
    const list = map.get(e.age) || [];
    list.push(e);
    map.set(e.age, list);
  });
  const sortedAges = Array.from(map.keys()).sort((a, b) => b - a);
  const items: FeedItem[] = [];
  let prevStageLabel: string | null = null;
  sortedAges.forEach((age) => {
    const ageEvents = (map.get(age) || [])
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp);
    const stageLabel = getLifeStageConfig(age).label;
    const isStageTransition = stageLabel !== prevStageLabel;
    prevStageLabel = stageLabel;
    items.push({ kind: "header", age, isStageTransition, key: `header_${age}` });
    ageEvents.forEach((evt, idx) => {
      items.push({
        kind: "event",
        event: evt,
        staggerIndex: idx,
        key: `evt_${age}_${idx}_${evt.id}`,
      });
    });
  });
  return items;
}
