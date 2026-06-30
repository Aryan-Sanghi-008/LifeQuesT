import { View, Text, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@theme";
import { FadeInView } from "@components/index";
import { ZODIACS, TRAITS } from "@data/gameData";
import { PRESTIGE_TRAITS } from "@engine/prestigeEngine";
import { getCreateStyles } from "./styles";

type StepFamilyProps = {
  zodiac: string;
  setZodiac: (v: string) => void;
  traits: string[];
  toggleTrait: (id: string) => void;
  isPremium: boolean;
};

export function StepFamily({
  zodiac,
  setZodiac,
  traits,
  toggleTrait,
  isPremium,
}: StepFamilyProps) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getCreateStyles(radii, spacing, shadows);

  return (
    <FadeInView style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.t1, fontFamily: fonts.displayBold }]}>
        Your cosmic traits
      </Text>
      <Text style={[styles.stepSub, { color: colors.t3, fontFamily: fonts.body }]}>
        Configure your zodiac alignment and choose up to two starting traits.
      </Text>

      <Text style={[styles.inputLabel, { color: colors.t4, fontFamily: fonts.bodyBold }]}>
        ZODIAC SIGN
      </Text>
      <View style={styles.zodiacGrid}>
        {ZODIACS.map((z) => {
          const active = z.id === zodiac;
          return (
            <Pressable
              key={z.id}
              onPress={() => setZodiac(z.id)}
              style={[
                styles.zodiacChip,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                },
                active && {
                  borderColor: colors.orchid,
                  backgroundColor: `${colors.orchid}10`,
                },
              ]}
            >
              <Text
                style={[
                  styles.zodiacLabel,
                  {
                    color: active ? colors.orchid : colors.t2,
                    fontFamily: active ? fonts.bodyBold : fonts.body,
                  },
                ]}
              >
                {z.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.inputLabel, { color: colors.t4, fontFamily: fonts.bodyBold, marginTop: spacing.md }]}>
        PERSONALITY TRAITS (MAX 2)
      </Text>
      <Text style={[styles.traitHint, { color: colors.t4, fontFamily: fonts.body }]}>
        Tap to select. Selected traits will influence your start metrics.
      </Text>

      <View style={styles.traitGrid}>
        {TRAITS.map((t) => {
          const active = traits.includes(t.id);
          return (
            <Pressable
              key={t.id}
              onPress={() => toggleTrait(t.id)}
              style={[
                styles.traitCard,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                },
                active && {
                  borderColor: `${colors.orchid}50`,
                  backgroundColor: `${colors.orchid}08`,
                },
              ]}
            >
              {active && (
                <View
                  style={[
                    styles.traitCheck,
                    { backgroundColor: colors.orchid },
                  ]}
                >
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path
                      stroke="#FFFFFF"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 6L9 17l-5-5"
                    />
                  </Svg>
                </View>
              )}
              <Text
                style={[
                  styles.traitLabel,
                  { color: colors.t1, fontFamily: fonts.bodyBold },
                  active && { color: colors.orchid },
                ]}
              >
                {t.label}
              </Text>
              <Text style={[styles.traitDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                {t.description}
              </Text>
            </Pressable>
          );
        })}

        {PRESTIGE_TRAITS.map((pt) => {
          const active = traits.includes(pt.id);
          const locked = !isPremium;
          return (
            <Pressable
              key={pt.id}
              disabled={locked}
              onPress={() => toggleTrait(pt.id)}
              style={[
                styles.traitCard,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                },
                { borderColor: colors.gold },
                active && {
                  borderColor: `${colors.gold}80`,
                  backgroundColor: `${colors.gold}08`,
                },
                locked && styles.traitCardLocked,
              ]}
            >
              {active && (
                <View
                  style={[
                    styles.traitCheck,
                    { backgroundColor: colors.gold },
                  ]}
                >
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path
                      stroke="#FFFFFF"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 6L9 17l-5-5"
                    />
                  </Svg>
                </View>
              )}
              <Text
                style={[
                  styles.traitLabel,
                  { color: colors.gold, fontFamily: fonts.body },
                  active && { fontFamily: fonts.bodyBold },
                ]}
              >
                {pt.label}
              </Text>
              <Text style={[styles.traitDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                {pt.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </FadeInView>
  );
}
