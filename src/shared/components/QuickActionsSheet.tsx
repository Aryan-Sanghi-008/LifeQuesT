import { View, Text, StyleSheet, Pressable, Alert, InteractionManager } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomSheet } from "./BottomSheet";
import { useTheme } from "@theme";
import { useGameStore } from "@store/gameStore";
import Svg, { Path, Circle } from "react-native-svg";
import { hapticAgeUp } from "@services/haptics";
import { triggerTapFeedback } from "@services/gameFeedback";
import { isFocusConfirmedForAge } from "@engine/focusEngine";

interface Props {
  visible: boolean;
  onClose: () => void;
}

function AgeUpIcon({ color = "#10B981" }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path fill={color} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </Svg>
  );
}

function ActivitiesIcon({ color = "#3B82F6" }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M12 5v14M5 12h14" />
    </Svg>
  );
}

function CrimeIcon({ color = "#EF4444" }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Path d="M4.93 4.93l14.14 14.14" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

function SocialIcon({ color = "#8B5CF6" }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function QuickActionsSheet({ visible, onClose }: Props) {
  const { colors, fonts } = useTheme();
  const navigation = useNavigation<any>();

  const character = useGameStore((s) => s.character);
  const ageUp = useGameStore((s) => s.ageUp);
  const isProcessing = useGameStore((s) => s.isProcessing);
  const pendingDecision = useGameStore((s) => s.pendingDecision);
  const lifePhase = character?.lifePhase ?? "planning";

  if (!character) return null;

  const canAgeUpDirectly =
    (character.age <= 12 || lifePhase === "acting") &&
    lifePhase !== "review" &&
    !pendingDecision &&
    !isProcessing;

  const handleAgeUpClick = () => {
    onClose();
    if (!character.isAlive) {
      Alert.alert("Ended", "This character has passed away.");
      return;
    }
    if (character.age >= 13 && lifePhase === "planning" && !isFocusConfirmedForAge(character)) {
      // Must allocate focus points first! Navigate to Life tab
      Alert.alert("Planning Phase", "You must confirm your focus allocation first.", [
        { text: "Go to Planner", onPress: () => navigation.navigate("Life") },
      ]);
      return;
    }

    if (canAgeUpDirectly) {
      hapticAgeUp();
      InteractionManager.runAfterInteractions(() => {
        void ageUp();
      });
    } else {
      navigation.navigate("Life");
    }
  };

  const handleNavigate = (screen: string) => {
    triggerTapFeedback();
    onClose();
    navigation.navigate(screen);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Quick Actions">
      <View style={styles.container}>
        {/* Age Up action */}
        <Pressable
          onPress={handleAgeUpClick}
          style={({ pressed }) => [
            styles.actionRow,
            { borderColor: `${colors.emerald}30`, backgroundColor: colors.bgCard },
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${colors.emerald}12` }]}>
            <AgeUpIcon color={colors.emerald} />
          </View>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
              Age Up (1 Year)
            </Text>
            <Text style={[styles.actionDesc, { color: colors.t3, fontFamily: fonts.body }]}>
              Progress in time, collect earnings, and resolve annual life events.
            </Text>
          </View>
        </Pressable>

        {/* General Activities */}
        <Pressable
          onPress={() => handleNavigate("Activities")}
          style={({ pressed }) => [
            styles.actionRow,
            { borderColor: `${colors.sapphire}30`, backgroundColor: colors.bgCard },
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${colors.sapphire}12` }]}>
            <ActivitiesIcon color={colors.sapphire} />
          </View>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
              Activities
            </Text>
            <Text style={[styles.actionDesc, { color: colors.t3, fontFamily: fonts.body }]}>
              Go to gym, study, read books, or manage travel.
            </Text>
          </View>
        </Pressable>

        {/* Crime → Activities (crime items are listed in the Activities screen) */}
        <Pressable
          onPress={() => {
            onClose();
            navigation.navigate("Activities" as never);
          }}
          style={({ pressed }) => [
            styles.actionRow,
            { borderColor: `${colors.crimson}30`, backgroundColor: colors.bgCard },
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${colors.crimson}12` }]}>
            <CrimeIcon color={colors.crimson} />
          </View>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
              Commit Crime
            </Text>
            <Text style={[styles.actionDesc, { color: colors.t3, fontFamily: fonts.body }]}>
              Try shoplifting, auto theft, or burglaries — in Activities.
            </Text>
          </View>
        </Pressable>

        {/* Shop */}
        <Pressable
          onPress={() => {
            onClose();
            navigation.navigate("Shop" as never);
          }}
          style={({ pressed }) => [
            styles.actionRow,
            { borderColor: `${colors.gold}30`, backgroundColor: colors.bgCard },
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${colors.gold}12` }]}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path stroke={colors.gold} strokeWidth={2} strokeLinecap="round"
                d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </Svg>
          </View>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
              Shop
            </Text>
            <Text style={[styles.actionDesc, { color: colors.t3, fontFamily: fonts.body }]}>
              Spend gems on boosts, premium items, and luck.
            </Text>
          </View>
        </Pressable>

        {/* Social Media */}
        <Pressable
          onPress={() => handleNavigate("SocialMedia")}
          style={({ pressed }) => [
            styles.actionRow,
            { borderColor: `${colors.orchid}30`, backgroundColor: colors.bgCard },
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${colors.orchid}12` }]}>
            <SocialIcon color={colors.orchid} />
          </View>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
              Social Media
            </Text>
            <Text style={[styles.actionDesc, { color: colors.t3, fontFamily: fonts.body }]}>
              Post content, buy campaigns, and check follower statistics.
            </Text>
          </View>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 24,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 14,
  },
  actionDesc: {
    fontSize: 11,
    lineHeight: 14,
  },
});
