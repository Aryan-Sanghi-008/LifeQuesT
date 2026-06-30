import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme, useThemedStyles, RADII } from "@theme";
import { AvatarStyleId, AppUser, Character, RootStackParamList } from "@/types";
import { AvatarByCharacter } from "@components/Avatars";
import { Badge, Card, SectionLabel } from "@components/index";
import { FeedbackPressable } from "@components/FeedbackPressable";
import { SeasonPassCard } from "./SeasonPassCard";
import { FinancesSection, StatChip } from "./StatsTab";
import { createHeroStyles, createSectionStyles } from "./styles";

const AVATAR_STYLE_LABELS: Record<AvatarStyleId, string> = {
  adventurer: "Adventurer",
  "adventurer-neutral": "Adventurer N",
  lorelei: "Lorelei",
  "lorelei-neutral": "Lorelei N",
  bottts: "Bottts",
  notionists: "Notionists",
  "big-smile": "Big Smile",
};

const AVATAR_STYLE_OPTIONS: AvatarStyleId[] = [
  "adventurer",
  "lorelei",
  "bottts",
  "notionists",
  "big-smile",
];

type ProfileOverviewProps = {
  character: Character;
  showOverviewSections: boolean;
  onSetAvatarStyle: (style: AvatarStyleId) => void;
  onReset: () => void;
  user: AppUser | null;
  slotsSynced: boolean;
  onSaveGame: () => Promise<void>;
};

export function ProfileOverview({
  character,
  showOverviewSections,
  onSetAvatarStyle,
  onReset,
  user,
  slotsSynced,
  onSaveGame,
}: ProfileOverviewProps) {
  const { colors, fonts } = useTheme();
  const heroStyles = useThemedStyles(createHeroStyles);
  const sectionStyles = useThemedStyles(createSectionStyles);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    stats,
    name,
    age,
    country,
    countryFlag,
    job,
    zodiac,
    karma,
    isPremium,
    coins,
    gems,
    avatarStyle,
    unlockedAvatarStyles,
  } = character;

  const karmaLabel =
    karma < 0
      ? "Villain"
      : karma < 50
        ? "Neutral"
        : karma < 150
          ? "Decent"
          : karma < 250
            ? "Virtuous"
            : "Saint";

  const karmaColor =
    karma < 0
      ? colors.health
      : karma < 100
        ? colors.t3
        : karma < 200
          ? colors.emerald
          : colors.gold;

  const lifeStage =
    age < 13
      ? "Childhood"
      : age < 18
        ? "Teenager"
        : age < 30
          ? "Young Adult"
          : age < 60
            ? "Adult"
            : "Golden Years";

  const avatarRingColor =
    age < 13
      ? colors.emerald
      : age < 18
        ? colors.sapphire
        : age < 30
          ? colors.catCareer
          : age < 60
            ? colors.gold
            : colors.orchid;

  return (
    <>
      <View style={heroStyles.hero}>
        <LinearGradient
          colors={[
            `${avatarRingColor}18`,
            `${avatarRingColor}04`,
            colors.bg,
          ]}
          style={StyleSheet.absoluteFill}
        />

        <View style={heroStyles.avatarContainer}>
          <View
            style={[
              heroStyles.avatarRing,
              { borderColor: `${avatarRingColor}60` },
            ]}
          >
            <AvatarByCharacter character={character} size={88} />
          </View>
          {isPremium && (
            <View style={heroStyles.premiumBadge}>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill={colors.gold}>
                <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </Svg>
            </View>
          )}
        </View>

        <View style={heroStyles.avatarStyleRow}>
          {AVATAR_STYLE_OPTIONS.map((style) => {
            const unlocked = (
              unlockedAvatarStyles ?? [avatarStyle ?? "adventurer"]
            ).includes(style);
            const active = (avatarStyle ?? "adventurer") === style;
            return (
              <Pressable
                key={style}
                disabled={!unlocked}
                onPress={() => onSetAvatarStyle(style)}
                style={[
                  heroStyles.avatarStyleChip,
                  active && heroStyles.avatarStyleChipActive,
                  !unlocked && { opacity: 0.35 },
                ]}
              >
                <Text
                  style={[
                    heroStyles.avatarStyleChipText,
                    active && { color: colors.gold },
                  ]}
                >
                  {AVATAR_STYLE_LABELS[style]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[heroStyles.heroName, { color: colors.t1 }]}>{name}</Text>
        <Text style={heroStyles.heroSub}>
          {job} · {countryFlag} {country}
        </Text>

        <View style={heroStyles.heroBadges}>
          <View
            style={[
              heroStyles.lifeStagePill,
              {
                backgroundColor: `${avatarRingColor}15`,
                borderColor: `${avatarRingColor}30`,
              },
            ]}
          >
            <View
              style={[
                heroStyles.lifeStageDot,
                { backgroundColor: avatarRingColor },
              ]}
            />
            <Text
              style={[heroStyles.lifeStageText, { color: avatarRingColor }]}
            >
              {lifeStage}
            </Text>
          </View>
          <Badge
            label={zodiac.charAt(0).toUpperCase() + zodiac.slice(1)}
            color={colors.orchid}
          />
          <Badge label={karmaLabel} color={karmaColor} />
        </View>

        <Pressable
          onPress={() => navigation.navigate("Stats")}
          style={[
            heroStyles.miniStats,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
          ]}
        >
          <StatChip label="Health" value={stats.health} color={colors.health} />
          <View
            style={[
              heroStyles.miniDivider,
              { backgroundColor: colors.border },
            ]}
          />
          <StatChip
            label="Joy"
            value={stats.happiness}
            color={colors.gold}
          />
          <View
            style={[
              heroStyles.miniDivider,
              { backgroundColor: colors.border },
            ]}
          />
          <StatChip
            label="Mind"
            value={stats.intelligence}
            color={colors.intelligence}
          />
          <View
            style={[
              heroStyles.miniDivider,
              { backgroundColor: colors.border },
            ]}
          />
          <StatChip label="Wealth" value={stats.wealth} color={colors.wealth} />
        </Pressable>
      </View>

      {showOverviewSections && (
        <>
          <View style={sectionStyles.section}>
            <SeasonPassCard
              xp={character.seasonXp ?? 0}
              level={Math.floor((character.seasonXp ?? 0) / 1000) + 1}
              isPremium={character.hasSeasonPass ?? false}
            />
          </View>

          <View style={sectionStyles.section}>
            <SectionLabel label="Collections" />
            <Pressable
              onPress={() => navigation.navigate("Collections" as never)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.bgCard,
              }}
            >
              <View style={{ gap: 4 }}>
                <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
                  Life Moments Gallery
                </Text>
                <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>
                  {character.unlockedTitles?.length
                    ? `Titles: ${character.unlockedTitles.join(', ')}`
                    : 'Collect 150 illustrated life moments across 15 sets'}
                </Text>
              </View>
              <Text style={{ color: colors.sapphire, fontSize: 18 }}>→</Text>
            </Pressable>
          </View>

          <FinancesSection character={character} />

          <View style={sectionStyles.section}>
            <SectionLabel label="Wallet" />
            <Card>
              <View style={sectionStyles.walletRow}>
                <View style={sectionStyles.walletItem}>
                  <View
                    style={[
                      sectionStyles.walletIcon,
                      { backgroundColor: `${colors.gold}15` },
                    ]}
                  >
                    <Svg
                      width={22}
                      height={22}
                      viewBox="0 0 24 24"
                      fill={colors.gold}
                    >
                      <Circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill={`${colors.gold}20`}
                        stroke={colors.gold}
                        strokeWidth={2}
                      />
                      <Path
                        fill={colors.gold}
                        d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V8h-3v.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
                      />
                    </Svg>
                  </View>
                  <Text style={sectionStyles.walletVal}>
                    {coins.toLocaleString()}
                  </Text>
                  <Text style={sectionStyles.walletLbl}>Coins</Text>
                </View>
                <View style={sectionStyles.walletDivider} />
                <View style={sectionStyles.walletItem}>
                  <View
                    style={[
                      sectionStyles.walletIcon,
                      { backgroundColor: `${colors.orchid}12` },
                    ]}
                  >
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path
                        fill={colors.orchid}
                        d="M12 2L2 9l10 13L22 9z"
                        opacity={0.9}
                      />
                    </Svg>
                  </View>
                  <Text
                    style={[sectionStyles.walletVal, { color: colors.orchid }]}
                  >
                    {gems}
                  </Text>
                  <Text style={sectionStyles.walletLbl}>Gems</Text>
                </View>
              </View>
            </Card>
          </View>

          <View style={sectionStyles.section}>
            <Card style={{ gap: 0 }}>
              <FeedbackPressable
                onPress={() => navigation.navigate("Settings")}
                style={sectionStyles.settingsNavRow}
              >
                <View
                  style={[
                    sectionStyles.settingsNavIcon,
                    { backgroundColor: `${colors.sapphire}12` },
                  ]}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      stroke={colors.sapphire}
                      strokeWidth={2}
                      strokeLinecap="round"
                      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                    />
                    <Path
                      stroke={colors.sapphire}
                      strokeWidth={2}
                      strokeLinecap="round"
                      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                    />
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      sectionStyles.settingsNavLabel,
                      { color: colors.t1 },
                    ]}
                  >
                    Settings
                  </Text>
                  <Text
                    style={[
                      sectionStyles.settingsNavDesc,
                      { color: colors.t3 },
                    ]}
                  >
                    Sound, haptics, appearance, account & legal
                  </Text>
                </View>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    stroke={colors.t4}
                    strokeWidth={2}
                    strokeLinecap="round"
                    d="M9 18l6-6-6-6"
                  />
                </Svg>
              </FeedbackPressable>
            </Card>
          </View>

          {!isPremium && (
            <View style={sectionStyles.section}>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    "Get Premium",
                    "Remove ads, get 5 luck boosts, and cloud save priority.",
                    [
                      { text: "Not Now", style: "cancel" },
                      {
                        text: "Get Premium",
                        onPress: () => navigation.navigate("Shop"),
                      },
                    ],
                  )
                }
              >
                <LinearGradient
                  colors={[`${colors.gold2}30`, `${colors.gold}18`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    sectionStyles.premiumCard,
                    { borderColor: `${colors.gold}30` },
                  ]}
                >
                  <View
                    style={[
                      sectionStyles.premiumIcon,
                      { backgroundColor: `${colors.gold}20` },
                    ]}
                  >
                    <Svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill={colors.gold}
                    >
                      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </Svg>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={sectionStyles.premiumTitle}>Get Premium</Text>
                    <Text style={sectionStyles.premiumSub}>
                      No ads · 5 luck boosts · Cloud save priority
                    </Text>
                  </View>
                  <View
                    style={[
                      sectionStyles.premiumPriceTag,
                      { backgroundColor: colors.gold, borderRadius: RADII.sm },
                    ]}
                  >
                    <Text style={sectionStyles.premiumPrice}>Premium</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {user && !user.isGuest && (
            <View style={sectionStyles.section}>
              <SectionLabel label="Cloud Sync Status" />
              <Card>
                <View style={sectionStyles.syncRow}>
                  <View style={sectionStyles.syncStatusWrap}>
                    <View
                      style={[
                        sectionStyles.syncDot,
                        {
                          backgroundColor: slotsSynced
                            ? colors.emerald
                            : colors.gold,
                        },
                      ]}
                    />
                    <Text style={sectionStyles.syncStatusText}>
                      {slotsSynced
                        ? "Saves Synced to Cloud"
                        : "Changes Pending Sync"}
                    </Text>
                  </View>
                  <Pressable
                    onPress={async () => {
                      try {
                        await onSaveGame();
                        Alert.alert(
                          "Cloud Sync",
                          "Successfully synced your progress to the cloud!",
                        );
                      } catch {
                        Alert.alert(
                          "Cloud Sync",
                          "Sync failed. Check your internet connection.",
                        );
                      }
                    }}
                    style={({ pressed }) => [
                      sectionStyles.syncNowBtn,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={sectionStyles.syncNowBtnText}>Sync Now</Text>
                  </Pressable>
                </View>
              </Card>
            </View>
          )}

          <View style={sectionStyles.section}>
            <SectionLabel label="Danger Zone" />
            <Pressable
              onPress={onReset}
              style={sectionStyles.resetBtn}
              android_ripple={{ color: `${colors.health}18` }}
            >
              <View
                style={[
                  sectionStyles.resetIcon,
                  { backgroundColor: `${colors.health}12` },
                ]}
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    stroke={colors.health}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                  />
                </Svg>
              </View>
              <Text style={sectionStyles.resetText}>
                End This Life & Start Over
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </>
  );
}
