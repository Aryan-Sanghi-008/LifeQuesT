import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import { useTheme, useThemedStyles } from "@theme";
import { useGameStore } from "@store/gameStore";
import { Card, SectionLabel } from "@components/index";
import { WorldEvent, WORLD_EVENTS_POOL } from "@engine/worldEngine";

interface EventModifiers {
  label: string;
  value: string;
  positive: boolean;
}

function getEventModifiers(type: WorldEvent["type"]): EventModifiers[] {
  switch (type) {
    case "recession":
      return [
        { label: "Property Appreciation", value: "−50%", positive: false },
        { label: "Promotion Chance", value: "−15%", positive: false },
        { label: "Investment Returns", value: "−8%", positive: false },
      ];
    case "pandemic":
      return [
        { label: "Health", value: "−3 / year", positive: false },
        { label: "Happiness", value: "−2 / year", positive: false },
        { label: "Promotion Chance", value: "−5%", positive: false },
      ];
    case "war":
      return [
        { label: "Tax Rate", value: "+10%", positive: false },
        { label: "Happiness", value: "−3 / year", positive: false },
      ];
    case "housing_boom":
      return [
        { label: "Property Appreciation", value: "×2.0", positive: true },
      ];
    case "crypto_boom":
      return [
        { label: "Investment Returns", value: "+12%", positive: true },
      ];
  }
}

function eventTypeIcon(type: WorldEvent["type"], color: string) {
  switch (type) {
    case "recession":
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </Svg>
      );
    case "pandemic":
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round"
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </Svg>
      );
    case "war":
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round"
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </Svg>
      );
    case "housing_boom":
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round"
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </Svg>
      );
    case "crypto_boom":
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path stroke={color} strokeWidth={2} strokeLinecap="round"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </Svg>
      );
  }
}

function eventTypeColor(type: WorldEvent["type"], colors: ReturnType<typeof useTheme>["colors"]): string {
  switch (type) {
    case "recession": return colors.crimson;
    case "pandemic": return colors.orchid;
    case "war": return colors.health;
    case "housing_boom": return colors.emerald;
    case "crypto_boom": return colors.gold;
  }
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function EventDetailModal({
  event,
  isActive,
  onClose,
}: {
  event: WorldEvent | null;
  isActive: boolean;
  onClose: () => void;
}) {
  const { colors, fonts, spacing, radii } = useTheme();

  if (!event) return null;
  const accentColor = eventTypeColor(event.type, colors);
  const mods = getEventModifiers(event.type);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: "#00000066", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: colors.bgCard,
            borderTopLeftRadius: radii.xl,
            borderTopRightRadius: radii.xl,
            padding: spacing.xl,
            gap: spacing.md,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <View style={{ width: 44, height: 44, borderRadius: radii.md,
              backgroundColor: `${accentColor}18`, alignItems: "center", justifyContent: "center" }}>
              {eventTypeIcon(event.type, accentColor)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 16 }}>
                {event.title}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4,
                  backgroundColor: isActive ? colors.emerald : colors.t4 }} />
                <Text style={{ color: isActive ? colors.emerald : colors.t4,
                  fontFamily: fonts.body, fontSize: 12 }}>
                  {isActive ? "Currently Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </View>

          <Text style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 }}>
            {event.description}
          </Text>

          <Text style={{ color: colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 12, marginTop: 4 }}>
            MODIFIERS
          </Text>
          {mods.map((m) => (
            <View key={m.label} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 13 }}>{m.label}</Text>
              <Text style={{ color: m.positive ? colors.emerald : colors.crimson,
                fontFamily: fonts.bodySemiBold, fontSize: 13 }}>{m.value}</Text>
            </View>
          ))}

          <Pressable
            onPress={onClose}
            style={{ marginTop: spacing.sm, backgroundColor: colors.bg2, borderRadius: radii.md,
              paddingVertical: 12, alignItems: "center" }}
          >
            <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
              Close
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function WorldEventsScreen() {
  const { colors, fonts, spacing } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const activeWorldEvents = useGameStore((s) => s.character?.activeWorldEvents ?? []);
  const [selectedEvent, setSelectedEvent] = useState<WorldEvent | null>(null);

  const activeEvents = WORLD_EVENTS_POOL.filter((e) => activeWorldEvents.includes(e.id));
  const inactiveEvents = WORLD_EVENTS_POOL.filter((e) => !activeWorldEvents.includes(e.id));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path stroke={colors.t1} strokeWidth={2.2} strokeLinecap="round" d="M15 18l-6-6 6-6" />
          </Svg>
        </Pressable>
        <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.displayBold }]}>World Events</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}>

        {activeEvents.length > 0 && (
          <View style={styles.section}>
            <SectionLabel label={`Active (${activeEvents.length})`} />
            <View style={{ gap: spacing.sm }}>
              {activeEvents.map((evt) => {
                const accent = eventTypeColor(evt.type, colors);
                return (
                  <Pressable key={evt.id} onPress={() => setSelectedEvent(evt)}>
                    <Card style={[styles.eventCard, { borderLeftColor: accent, borderLeftWidth: 3 }]}>
                      <View style={[styles.eventIcon, { backgroundColor: `${accent}18` }]}>
                        {eventTypeIcon(evt.type, accent)}
                      </View>
                      <View style={styles.eventInfo}>
                        <Text style={[styles.eventTitle, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                          {evt.title}
                        </Text>
                        <Text style={[styles.eventDesc, { color: colors.t3, fontFamily: fonts.body }]}
                          numberOfLines={2}>
                          {evt.description}
                        </Text>
                      </View>
                      <View style={[styles.activeBadge, { backgroundColor: `${colors.emerald}18` }]}>
                        <Text style={[styles.activeBadgeText, { color: colors.emerald, fontFamily: fonts.bodySemiBold }]}>
                          Active
                        </Text>
                      </View>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {activeEvents.length === 0 && (
          <View style={[styles.emptyBanner, { backgroundColor: `${colors.emerald}10`, borderColor: `${colors.emerald}25` }]}>
            <Text style={[styles.emptyText, { color: colors.emerald, fontFamily: fonts.bodySemiBold }]}>
              No active world events — the world is at peace.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <SectionLabel label="All Events" />
          <View style={{ gap: spacing.sm }}>
            {inactiveEvents.map((evt) => (
                <Pressable key={evt.id} onPress={() => setSelectedEvent(evt)}>
                  <Card style={[styles.eventCard, { opacity: 0.6 }]}>
                    <View style={[styles.eventIcon, { backgroundColor: colors.bg2 }]}>
                      {eventTypeIcon(evt.type, colors.t4)}
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={[styles.eventTitle, { color: colors.t2, fontFamily: fonts.bodySemiBold }]}>
                        {evt.title}
                      </Text>
                      <Text style={[styles.eventDesc, { color: colors.t4, fontFamily: fonts.body }]}
                        numberOfLines={1}>
                        {evt.description}
                      </Text>
                    </View>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path stroke={colors.t4} strokeWidth={2} strokeLinecap="round" d="M9 18l6-6-6-6" />
                    </Svg>
                  </Card>
                </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <EventDetailModal
        event={selectedEvent}
        isActive={activeWorldEvents.includes(selectedEvent?.id ?? "")}
        onClose={() => setSelectedEvent(null)}
      />
    </SafeAreaView>
  );
}

const createStyles = ({ spacing, radii }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    root: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
    },
    backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 18 },
    section: { gap: spacing.xs },
    eventCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    eventIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.md,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    eventInfo: { flex: 1 },
    eventTitle: { fontSize: 14 },
    eventDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
    activeBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radii.full,
    },
    activeBadgeText: { fontSize: 11 },
    emptyBanner: {
      borderWidth: 1,
      borderRadius: radii.md,
      padding: spacing.md,
      alignItems: "center",
    },
    emptyText: { fontSize: 13 },
  });
