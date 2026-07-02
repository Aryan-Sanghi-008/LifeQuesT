import { View, Text } from "react-native";
import { useTheme } from "@theme";
import { DiceBearAvatar } from "@components/Avatars";
import {
  BigFivePersonality,
  FamilyBackground,
  Gender,
  ScenarioId,
} from "@/types";
import {
  COUNTRIES,
  FAMILY_BACKGROUNDS,
  TRAITS,
  ZODIACS,
} from "@data/gameData";
import { PRESTIGE_TRAITS } from "@engine/prestigeEngine";
import { SCENARIOS } from "@data/scenarios";
import { DYNASTY_CREST_LABELS } from "@data/dynastyShop";
import { getCreateStyles } from "./styles";

const BIG_FIVE_LABELS: Record<keyof BigFivePersonality, string> = {
  openness: "Open",
  conscientiousness: "Disciplined",
  extraversion: "Outgoing",
  agreeableness: "Cooperative",
  neuroticism: "Sensitive",
};

type CharacterPreviewProps = {
  name: string;
  gender: Gender;
  avatarSeed: string;
  countryCode: string;
  familyBackground: FamilyBackground;
  zodiac: string;
  traits: string[];
  personality: BigFivePersonality;
  selectedScenario: ScenarioId;
  familyCrestId?: string;
};

export function CharacterPreview({
  name,
  gender,
  avatarSeed,
  countryCode,
  familyBackground,
  zodiac,
  traits,
  personality,
  selectedScenario,
  familyCrestId,
}: CharacterPreviewProps) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getCreateStyles(radii, spacing, shadows);

  const country = COUNTRIES.find((c) => c.code === countryCode);
  const family = FAMILY_BACKGROUNDS.find((f) => f.id === familyBackground);
  const zodiacInfo = ZODIACS.find((z) => z.id === zodiac);
  const scenario = SCENARIOS.find((s) => s.id === selectedScenario);
  const accentColor = scenario?.accentColor ?? colors.sapphire;

  const traitLabels = traits
    .map(
      (id) =>
        TRAITS.find((t) => t.id === id)?.label ??
        PRESTIGE_TRAITS.find((t) => t.id === id)?.label,
    )
    .filter(Boolean);

  const dominantTraits = (
    Object.entries(personality) as [keyof BigFivePersonality, number][]
  )
    .filter(([, val]) => val >= 70)
    .map(([key]) => BIG_FIVE_LABELS[key]);

  const personalitySummary = [
    traitLabels.length > 0 ? traitLabels.join(" · ") : null,
    dominantTraits.length > 0 ? dominantTraits.join(" · ") : null,
  ]
    .filter(Boolean)
    .join("  •  ");

  const displayName = name.trim() || "Unnamed";

  return (
    <View style={styles.previewWrap}>
      <View
        style={[
          styles.previewCard,
          {
            backgroundColor: colors.bgCard,
            borderColor: `${accentColor}55`,
          },
        ]}
      >
        <View
          style={[
            styles.previewAvatarFrame,
            {
              backgroundColor: `${accentColor}10`,
              borderColor: `${accentColor}66`,
            },
          ]}
        >
          <DiceBearAvatar
            seed={avatarSeed}
            lifeStage="infant"
            gender={gender}
            size={64}
            clipCircular
          />
        </View>

        <View style={styles.previewMeta}>
          <Text
            style={[
              styles.previewName,
              { color: colors.t1, fontFamily: fonts.bodyBold },
            ]}
            numberOfLines={1}
          >
            {displayName}
          </Text>

          {familyCrestId ? (
            <View
              style={[
                styles.previewChip,
                {
                  backgroundColor: `${colors.gold}14`,
                  borderWidth: 1,
                  borderColor: `${colors.gold}44`,
                  alignSelf: 'flex-start',
                  marginTop: 4,
                },
              ]}
            >
              <Text
                style={[
                  styles.previewChipText,
                  { color: colors.gold, fontFamily: fonts.bodySemiBold },
                ]}
              >
                {DYNASTY_CREST_LABELS[familyCrestId] ?? familyCrestId} Crest
              </Text>
            </View>
          ) : null}

          <View style={styles.previewRow}>
            {country && (
              <Text style={{ fontSize: 16 }}>{country.flag}</Text>
            )}
            {family && (
              <View
                style={[
                  styles.previewChip,
                  { backgroundColor: `${colors.sapphire}14` },
                ]}
              >
                <Text
                  style={[
                    styles.previewChipText,
                    { color: colors.sapphire, fontFamily: fonts.bodySemiBold },
                  ]}
                >
                  {family.label}
                </Text>
              </View>
            )}
            {zodiacInfo && (
              <View
                style={[
                  styles.previewChip,
                  { backgroundColor: `${colors.orchid}14` },
                ]}
              >
                <Text
                  style={[
                    styles.previewChipText,
                    { color: colors.orchid, fontFamily: fonts.bodySemiBold },
                  ]}
                >
                  {zodiacInfo.label}
                </Text>
              </View>
            )}
            {scenario && (
              <View
                style={[
                  styles.previewChip,
                  { backgroundColor: `${accentColor}18` },
                ]}
              >
                <Text
                  style={[
                    styles.previewChipText,
                    { color: accentColor, fontFamily: fonts.bodySemiBold },
                  ]}
                >
                  {scenario.name}
                </Text>
              </View>
            )}
          </View>

          {personalitySummary.length > 0 && (
            <Text
              style={[
                styles.previewTraitSummary,
                { color: colors.t3, fontFamily: fonts.body },
              ]}
              numberOfLines={2}
            >
              {personalitySummary}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
