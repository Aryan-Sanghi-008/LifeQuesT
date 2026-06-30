import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@theme";
import { useGameStore } from "@store/gameStore";
import { ALL_COLLECTION_ITEMS, COLLECTION_SETS } from "@data/collections";
import { evaluateUnlockedCollectionIds, getSetProgress } from "@engine/collectionsEngine";
import { CollectionCategory, CollectionItem, EventRarity } from "@/types";

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
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                {unlocked ? (
                  <Path stroke={accent} strokeWidth={2} strokeLinecap="round"
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                ) : (
                  <Path stroke={colors.t4} strokeWidth={2} strokeLinecap="round"
                    d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4" />
                )}
              </Svg>
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

  return (
    <Pressable
      onPress={onPress}
      style={[{
        width: "30%",
        aspectRatio: 1,
        borderRadius: radii.md,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.bgCard,
        borderColor: unlocked ? `${accent}40` : colors.border,
        opacity: unlocked ? 1 : 0.5,
        gap: 4,
      }]}
    >
      <View style={{ width: 32, height: 32, borderRadius: radii.sm,
        backgroundColor: unlocked ? `${accent}15` : colors.bg2,
        alignItems: "center", justifyContent: "center" }}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          {unlocked ? (
            <Path stroke={accent} strokeWidth={2} strokeLinecap="round"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          ) : (
            <Path stroke={colors.t4} strokeWidth={2} strokeLinecap="round"
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          )}
        </Svg>
      </View>
      <View style={{ alignItems: "center", paddingHorizontal: 4 }}>
        <Text style={{ color: unlocked ? colors.t1 : colors.t4, fontSize: 9, textAlign: "center" }}
          numberOfLines={2}>
          {item.name}
        </Text>
      </View>
      {unlocked && <RarityPip rarity={item.rarity} />}
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
            <Text style={{ color: viewMode === mode ? '#FFF' : colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>
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
            return (
              <View key={set.id} style={{
                padding: spacing.md,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: complete ? set.accentColor : colors.border,
                backgroundColor: colors.bgCard,
                gap: spacing.sm,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 16 }}>{set.name}</Text>
                  {claimed && <Text style={{ color: colors.emerald, fontFamily: fonts.bodyBold, fontSize: 11 }}>CLAIMED</Text>}
                </View>
                <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>{set.description}</Text>
                <View style={{ height: 4, backgroundColor: colors.bg2, borderRadius: 2 }}>
                  <View style={{ height: 4, borderRadius: 2, width: `${total ? (unlocked / total) * 100 : 0}%`, backgroundColor: set.accentColor }} />
                </View>
                <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11 }}>
                  {unlocked}/{total} · Reward: {set.titleReward} + {set.coinReward} coins{set.gemReward ? ` + ${set.gemReward} gems` : ''}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      ) : (
      <>
      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.sm }}>
        {CATEGORIES.map((cat) => {
          const catItems = ALL_COLLECTION_ITEMS.filter((i) => i.category === cat.id);
          const catUnlocked = catItems.filter((i) => unlockedIds.includes(i.id)).length;
          const isActive = activeCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: 8,
                borderRadius: radii.full,
                backgroundColor: isActive ? colors.sapphire : colors.bg2,
                borderWidth: 1,
                borderColor: isActive ? colors.sapphire : colors.border,
              }}
            >
              <Text style={{
                color: isActive ? "#FFFFFF" : colors.t3,
                fontFamily: isActive ? fonts.bodySemiBold : fonts.body,
                fontSize: 13,
              }}>
                {cat.label} ({catUnlocked}/{catItems.length})
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
