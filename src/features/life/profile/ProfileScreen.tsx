import { useState, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { useTheme, useThemedStyles, SPACING } from "@theme";
import { useBreakpoints } from "@hooks/useBreakpoints";
import { useGameStore } from "@store/gameStore";
import { ScreenShell, TabScreenHeader } from "@components/index";
import { CharacterNameText } from "@shared/components/CharacterNameText";
import { resetSessionState } from "@navigation/sessionState";
import { ProfileTabBar, ProfileTab } from "./ProfileTabBar";
import { ProfileOverview } from "./ProfileOverview";
import { StatsTab } from "./StatsTab";
import { AchievementsTab } from "./AchievementsTab";
import { LegacyTab } from "./LegacyTab";

const createScreenStyles = ({
  colors,
  fonts,
  spacing,
}: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    scroll: { flexGrow: 1 },
    tabletRow: {
      flexDirection: 'row',
      gap: spacing.lg,
      alignItems: 'flex-start',
      paddingHorizontal: spacing.lg,
    },
    tabletCol: {
      flex: 1,
    },
    footer: {
      fontFamily: fonts.body,
      fontSize: 11,
      color: colors.t4,
      textAlign: "center",
      paddingTop: spacing.xl,
    },
  });

export function ProfileScreen() {
  const { colors, fonts } = useTheme();
  const { isTablet, contentMaxWidth } = useBreakpoints();
  const styles = useThemedStyles(createScreenStyles);
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  const character = useGameStore(useShallow((s) => s.character));
  const resetGame = useGameStore((s) => s.resetGame);
  const setAvatarStyle = useGameStore((s) => s.setAvatarStyle);
  const user = useGameStore((s) => s.user);
  const slotsSynced = useGameStore((s) => s.slotsSynced);
  const saveGame = useGameStore((s) => s.saveGame);

  const achievementIds = useMemo(
    () => character?.achievements ?? [],
    [character?.achievements],
  );

  if (!character) {
    return (
      <ScreenShell>
        <TabScreenHeader title="Profile" subtitle="No active life" accent={colors.catMilestone} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: colors.t3, fontFamily: fonts.body, textAlign: 'center' }}>
            No active character. Create or load a save slot to view your profile.
          </Text>
        </View>
      </ScreenShell>
    );
  }

  const handleReset = () => {
    Alert.alert(
      "End This Life?",
      "This will permanently delete your character and start over. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Life",
          style: "destructive",
          onPress: () => {
            // Reset session flag first so useGameNavigationSync can navigate to SaveSlots
            resetSessionState();
            void resetGame();
          },
        },
      ],
    );
  };

  return (
    <ScreenShell>
      <TabScreenHeader
        title="Profile"
        subtitle={
          <CharacterNameText
            name={character.name}
            style={{ fontSize: 12, color: colors.t3 }}
          />
        }
        accent={colors.catMilestone}
      />
      <ProfileTabBar active={activeTab} onSelect={setActiveTab} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          contentMaxWidth ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' } : null,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isTablet ? (
          <View style={styles.tabletRow}>
            <View style={styles.tabletCol}>
              <ProfileOverview
                character={character}
                showOverviewSections={false}
                variant="hero"
                onSetAvatarStyle={setAvatarStyle}
                onReset={handleReset}
                user={user}
                slotsSynced={slotsSynced}
                onSaveGame={saveGame}
              />
            </View>
            <View style={styles.tabletCol}>
              {activeTab === "overview" && (
                <ProfileOverview
                  character={character}
                  showOverviewSections
                  variant="sections"
                  onSetAvatarStyle={setAvatarStyle}
                  onReset={handleReset}
                  user={user}
                  slotsSynced={slotsSynced}
                  onSaveGame={saveGame}
                />
              )}
              {activeTab === "stats" && <StatsTab character={character} />}
              {activeTab === "achievements" && (
                <AchievementsTab achievements={achievementIds} />
              )}
              {activeTab === "legacy" && <LegacyTab />}
            </View>
          </View>
        ) : (
          <>
            <ProfileOverview
              character={character}
              showOverviewSections={activeTab === "overview"}
              onSetAvatarStyle={setAvatarStyle}
              onReset={handleReset}
              user={user}
              slotsSynced={slotsSynced}
              onSaveGame={saveGame}
            />

            {activeTab === "stats" && <StatsTab character={character} />}

            {activeTab === "achievements" && (
              <AchievementsTab achievements={achievementIds} />
            )}

            {activeTab === "legacy" && <LegacyTab />}
          </>
        )}

        <Text style={[styles.footer, { color: colors.t4 }]}>
          LifeQuest · Built with purpose
        </Text>
        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </ScreenShell>
  );
}
