import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme } from "@theme";
import { useGameStore } from "@store/gameStore";
import { ALL_COLLECTION_ITEMS, COLLECTION_SETS } from "@data/collections";
import { evaluateUnlockedCollectionIds, getSetProgress } from "@engine/collectionsEngine";
import { CollectionCategory, CollectionItem, EventRarity } from "@/types";
import { CollectionSetIcon } from "./CollectionSetIcon";

const CATEGORIES: { id: CollectionCategory; label: string }[] = [
  { id: "life_moment", label: "Life Moments" },
  { id: "achievement", label: "Achievements" },
  { id: "cosmetic", label: "Cosmetics" },
  { id: "scenario", label: "Scenarios" },
  { id: "badge", label: "Badges" },
];

const RARITY_COLORS: Record<EventRarity, string> = {
  common: "#94A3B8",
  uncommon: "#22C55E",
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#F59E0B",
};

function RarityPip({ rarity }: { rarity?: EventRarity }) {
  const color = RARITY_COLORS[rarity ?? "common"];
  return <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />;
}

// ─── Detail Sheet ─────────────────────────────────────────────────────────────

function DetailSheet({ item, unlocked, onClose }: {
  item: CollectionItem | null;
  unlocked: boolean;
  onClose: () => void;
}) {
  const { colors, fonts, spacing, radii } = useTheme();
  if (!item) return null;

  const accent = item.accentColor ?? colors.sapphire;
  const rarityColor = RARITY_COLORS[item.rarity ?? "common"];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "#00000066", justifyContent: "flex-end" }} onPress={onClose}>
        <Pressable style={{
          backgroundColor: colors.bgCard,
          borderTopLeftRadius: radii.xl,
          borderTopRightRadius: radii.xl,
          padding: spacing.xl,
          gap: spacing.md,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <View style={{ width: 52, height: 52, borderRadius: radii.md,
              backgroundColor: unlocked ? `${accent}18` : colors.bg2,
              alignItems: "center", justifyContent: "center" }}>
              {unlocked ? (
                <CollectionSetIcon setId={item.setId ?? item.category} color={accent} size={24} />
              ) : (
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path stroke={colors.t4} strokeWidth={2} strokeLinecap="round"
                    d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4" />
                </Svg>
              )}
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 16 }}>
                {item.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <RarityPip rarity={item.rarity} />
                <Text style={{ color: rarityColor, fontFamily: fonts.bodySemiBold, fontSize: 12 }}>
                  {(item.rarity ?? "common").charAt(0).toUpperCase() + (item.rarity ?? "common").slice(1)}
                </Text>
                <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 12 }}>
                  · {CATEGORIES.find((c) => c.id === item.category)?.label ?? item.category}
                </Text>
              </View>
            </View>
          </View>
          <Text style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 }}>
            {item.description}
          </Text>
          {!unlocked && (
            <View style={{ backgroundColor: colors.bg2, borderRadius: radii.md, padding: spacing.md }}>
              <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 13 }}>
                Not yet unlocked. Complete the required actions to earn this item.
              </Text>
            </View>
          )}
          <Pressable onPress={onClose} style={{ backgroundColor: colors.bg2, borderRadius: radii.md,
            paddingVertical: 12, alignItems: "center", marginTop: spacing.sm }}>
            <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Collection Tile ──────────────────────────────────────────────────────────

function CollectionTile({ item, unlocked, onPress }: {
  item: CollectionItem;
  unlocked: boolean;
  onPress: () => void;
}) {
  const { colors, radii } = useTheme();
  const accent = item.accentColor ?? colors.sapphire;
  const rarityColor = RARITY_COLORS[item.rarity ?? "common"];
  const isEpicPlus = item.rarity === 'epic' || item.rarity === 'legendary';

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: "30%",
        aspectRatio: 1,
        borderRadius: radii.md,
        overflow: 'hidden',
        opacity: unlocked ? 1 : 0.55,
      }}
    >
      {/* Rarity gradient frame for unlocked epic/legendary items */}
      {unlocked && isEpicPlus ? (
        <LinearGradient
          colors={[`${rarityColor}60`, `${rarityColor}15`, `${rarityColor}40`] as [string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            padding: 1.5,
            borderRadius: radii.md,
          }}
        >
          <View style={{
            flex: 1,
            borderRadius: radii.md - 1,
            backgroundColor: colors.bgCard,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: 4,
          }}>
            <View style={{ width: 34, height: 34, borderRadius: radii.sm,
              backgroundColor: `${accent}18`, alignItems: 'center', justifyContent: 'center' }}>
              <CollectionSetIcon setId={item.setId ?? item.category} color={accent} size={18} />
            </View>
            <Text style={{ color: colors.t1, fontSize: 9, textAlign: 'center' }} numberOfLines={2}>
              {item.name}
            </Text>
            <RarityPip rarity={item.rarity} />
          </View>
        </LinearGradient>
      ) : (
        <View style={{
          flex: 1,
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderColor: unlocked ? `${accent}40` : colors.border,
          backgroundColor: colors.bgCard,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          padding: 4,
        }}>
          <View style={{ width: 32, height: 32, borderRadius: radii.sm,
            backgroundColor: unlocked ? `${accent}15` : colors.bg2,
            alignItems: 'center', justifyContent: 'center' }}>
            {unlocked ? (
              <CollectionSetIcon setId={item.setId ?? item.category} color={accent} size={18} />
            ) : (
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path stroke={colors.t4} strokeWidth={2} strokeLinecap="round"
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </Svg>
            )}
          </View>
          <Text style={{ color: unlocked ? colors.t1 : colors.t4, fontSize: 9, textAlign: 'center' }}
            numberOfLines={2}>
            {item.name}
          </Text>
          {unlocked && <RarityPip rarity={item.rarity} />}
        </View>
      )}
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function CollectionsScreen() {
  const { colors, fonts, spacing, radii } = useTheme();
  const navigation = useNavigation();
  const character = useGameStore((s) => s.character);
  const globalPrestige = useGameStore((s) => s.globalPrestige);
  const checkCollectionSetRewards = useGameStore((s) => s.checkCollectionSetRewards);

  const [viewMode, setViewMode] = useState<'sets' | 'gallery'>('sets');
  const [activeCategory, setActiveCategory] = useState<CollectionCategory>("life_moment");
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);

  const unlockedIds = useMemo(() => {
    if (!character) return [];
    return evaluateUnlockedCollectionIds(character, globalPrestige?.prestigeLevel);
  }, [character, globalPrestige?.prestigeLevel]);

  useEffect(() => {
    if (character) checkCollectionSetRewards();
  }, [character, unlockedIds.length, checkCollectionSetRewards]);

  const categoryItems = useMemo(
    () => ALL_COLLECTION_ITEMS.filter((i) => i.category === activeCategory),
    [activeCategory],
  );

  const unlockedInCategory = categoryItems.filter((i) => unlockedIds.includes(i.id)).length;
  const totalUnlocked = unlockedIds.length;
  const totalItems = ALL_COLLECTION_ITEMS.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}
          style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path stroke={colors.t1} strokeWidth={2.2} strokeLinecap="round" d="M15 18l-6-6 6-6" />
          </Svg>
        </Pressable>
        <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 18 }}>Collections</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Progress summary */}
      <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        backgroundColor: colors.bgCard, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 13 }}>
            Total progress
          </Text>
          <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 14 }}>
            {totalUnlocked} / {totalItems}
          </Text>
        </View>
        <View style={{ height: 4, backgroundColor: colors.bg2, borderRadius: 2, marginTop: spacing.sm }}>
          <View style={{
            height: 4, borderRadius: 2,
            backgroundColor: colors.sapphire,
            width: `${(totalUnlocked / totalItems) * 100}%`,
          }} />
        </View>
      </View>

      {/* Sets / Gallery toggle */}
      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.sm }}>
        {(['sets', 'gallery'] as const).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => setViewMode(mode)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: radii.md,
              alignItems: 'center',
              backgroundColor: viewMode === mode ? colors.sapphire : colors.bg2,
              borderWidth: 1,
              borderColor: viewMode === mode ? colors.sapphire : colors.border,
            }}
          >
            <Text style={{ color: viewMode === mode ? '#FFFFFF' : colors.t1, fontFamily: viewMode === mode ? fonts.bodySemiBold : fonts.body, fontSize: 13 }}>
              {mode === 'sets' ? 'Collection Sets' : 'Gallery'}
            </Text>
          </Pressable>
        ))}
      </View>

      {viewMode === 'sets' ? (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 60 }}>
          {COLLECTION_SETS.map((set) => {
            const { unlocked, total } = getSetProgress(set.id, unlockedIds);
            const complete = unlocked >= total && total > 0;
            const claimed = character?.completedCollectionSetIds?.includes(set.id);
            const pct = total > 0 ? unlocked / total : 0;
            const RING = 52;
            const STROKE = 4;
            const R = (RING - STROKE) / 2;
            const CIRC = 2 * Math.PI * R;
            const dash = pct * CIRC;
            const accent = complete ? set.accentColor : colors.t4;
            return (
              <View key={set.id} style={{
                padding: spacing.md,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: complete ? set.accentColor : colors.border,
                backgroundColor: colors.bgCard,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
              }}>
                {/* Circular progress ring */}
                <View style={{ width: RING, height: RING }}>
                  <Svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`}>
                    {/* Track */}
                    <Circle
                      cx={RING / 2} cy={RING / 2} r={R}
                      stroke={colors.bg2} strokeWidth={STROKE} fill="none"
                    />
                    {/* Progress arc */}
                    <Circle
                      cx={RING / 2} cy={RING / 2} r={R}
                      stroke={complete ? set.accentColor : `${set.accentColor}60`}
                      strokeWidth={STROKE}
                      fill="none"
                      strokeDasharray={`${dash} ${CIRC - dash}`}
                      strokeDashoffset={CIRC / 4}
                      strokeLinecap="round"
                    />
                  </Svg>
                  {/* Center icon */}
                  <View style={{ position: 'absolute', top: 0, left: 0, width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }}>
                    <CollectionSetIcon setId={set.id} color={accent} size={18} />
                  </View>
                </View>
                {/* Text column */}
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 15, flex: 1 }}>{set.name}</Text>
                    {claimed && (
                      <View style={{ backgroundColor: `${colors.emerald}20`, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: `${colors.emerald}40` }}>
                        <Text style={{ color: colors.emerald, fontFamily: fonts.monoSemiBold, fontSize: 9, letterSpacing: 0.5 }}>CLAIMED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 11, lineHeight: 16 }} numberOfLines={2}>{set.description}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <Text style={{ color: complete ? set.accentColor : colors.t4, fontFamily: fonts.monoSemiBold, fontSize: 11 }}>
                      {unlocked}/{total}
                    </Text>
                    <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 10 }}>
                      · {set.titleReward} · 🪙{set.coinReward.toLocaleString()}{set.gemReward ? ` · 💎${set.gemReward}` : ''}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
      <>
      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
        }}
      >
        {CATEGORIES.map((cat, idx) => {
          const catItems = ALL_COLLECTION_ITEMS.filter((i) => i.category === cat.id);
          const catUnlocked = catItems.filter((i) => unlockedIds.includes(i.id)).length;
          const isActive = activeCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              style={{
                flexShrink: 0,
                minHeight: 36,
                justifyContent: 'center',
                paddingHorizontal: 16,
                borderRadius: radii.full,
                backgroundColor: isActive ? colors.sapphire : colors.bg2,
                borderWidth: 1.5,
                borderColor: isActive ? colors.sapphire : colors.border,
                marginRight: idx < CATEGORIES.length - 1 ? spacing.sm : 0,
              }}
            >
              <Text
                style={{
                  color: isActive ? "#FFFFFF" : colors.t1,
                  fontFamily: isActive ? fonts.bodySemiBold : fonts.body,
                  fontSize: 13,
                }}
                numberOfLines={1}
              >
                {cat.label} {catUnlocked}/{catItems.length}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Grid */}
      <ScrollView contentContainerStyle={{
        flexDirection: "row", flexWrap: "wrap", gap: spacing.sm,
        padding: spacing.lg, paddingBottom: 60, justifyContent: "flex-start",
      }} showsVerticalScrollIndicator={false}>
        <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between",
          alignItems: "center", marginBottom: spacing.xs }}>
          <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>
            {unlockedInCategory} of {categoryItems.length} unlocked
          </Text>
        </View>
        {categoryItems.map((item) => (
          <CollectionTile
            key={item.id}
            item={item}
            unlocked={unlockedIds.includes(item.id)}
            onPress={() => setSelectedItem(item)}
          />
        ))}
      </ScrollView>

      <DetailSheet
        item={selectedItem}
        unlocked={selectedItem ? unlockedIds.includes(selectedItem.id) : false}
        onClose={() => setSelectedItem(null)}
      />
      </>
      )}
    </SafeAreaView>
  );
}
