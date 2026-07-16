import { View, Text, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@theme";
import { FadeInView } from "@components/index";
import { ZODIACS } from "@data/gameData";
import { TRAITS_WITH_DESCRIPTIONS } from "@data/traitCatalog";
import type { TraitWithDescription } from "@data/traitCatalog";
import { PRESTIGE_TRAITS } from "@engine/prestigeEngine";
import { DYNASTY_TRAIT_POOL } from "@data/dynastyShop";
import { isPremiumTrait } from "@engine/traitEngine";
import { getCreateStyles } from "./styles";

type StepFamilyProps = {
  zodiac: string;
  setZodiac: (v: string) => void;
  traits: string[];
  toggleTrait: (id: string) => void;
  isPremium: boolean;
  unlockedPrestigeTraitIds: string[];
  hasDynastyTraitExpansion?: boolean;
  onPremiumUpsell?: () => void;
};

export function StepFamily({
  zodiac,
  setZodiac,
  traits,
  toggleTrait,
  isPremium,
  unlockedPrestigeTraitIds,
  hasDynastyTraitExpansion = false,
  onPremiumUpsell,
}: StepFamilyProps) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getCreateStyles(radii, spacing, shadows);

  const freeTraits = TRAITS_WITH_DESCRIPTIONS.filter(
    (t) => !t.premiumOnly && (!hasDynastyTraitExpansion || !(DYNASTY_TRAIT_POOL as readonly string[]).includes(t.id)),
  );
  const premiumTraits = TRAITS_WITH_DESCRIPTIONS.filter((t) => t.premiumOnly);

  const handleTraitPress = (traitId: string) => {
    if (isPremiumTrait(traitId) && !isPremium) {
      onPremiumUpsell?.();
      return;
    }
    toggleTrait(traitId);
  };

  const renderTraitCard = (t: TraitWithDescription, accent: string, premiumLocked: boolean) => {
    const active = traits.includes(t.id);
    return (
      <Pressable
        key={t.id}
        onPress={() => handleTraitPress(t.id)}
        style={[
          styles.traitCard,
          { backgroundColor: colors.bgCard, borderColor: colors.border },
          { borderColor: accent },
          active && { borderColor: `${accent}80`, backgroundColor: `${accent}08` },
          premiumLocked && styles.traitCardLocked,
        ]}
      >
        {premiumLocked && (
          <Text style={{ color: colors.gold, fontFamily: fonts.monoSemiBold, fontSize: 10, marginBottom: 4 }}>
            LIFEQUEST PLUS · Tap to unlock
          </Text>
        )}
        {active && (
          <View style={[styles.traitCheck, { backgroundColor: accent }]}>
            <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
              <Path stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
            </Svg>
          </View>
        )}
        <Text style={[styles.traitLabel, { color: colors.t1, fontFamily: fonts.bodyBold }, active && { color: accent }]}>
          {t.label}
        </Text>
        <Text style={[styles.traitDesc, { color: colors.t3, fontFamily: fonts.body }]}>
          {t.description}
        </Text>
      </Pressable>
    );
  };

  return (
    <FadeInView style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.t1, fontFamily: fonts.displayBold }]}>
        Your cosmic traits
      </Text>
      <Text style={[styles.stepSub, { color: colors.t3, fontFamily: fonts.body }]}>
        Choose up to two traits. Each affects stats at birth and gameplay every year.
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
                { backgroundColor: colors.bgCard, borderColor: colors.border },
                active && { borderColor: colors.orchid, backgroundColor: `${colors.orchid}10` },
              ]}
            >
              <Text style={[styles.zodiacLabel, { color: active ? colors.orchid : colors.t2, fontFamily: active ? fonts.bodyBold : fonts.body }]}>
                {z.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.inputLabel, { color: colors.gold, fontFamily: fonts.bodyBold, marginTop: spacing.md }]}>
        LIFEQUEST PLUS TRAITS
      </Text>
      <Text style={[styles.traitHint, { color: colors.t4, fontFamily: fonts.body }]}>
        Massive passives — unlocked with LifeQuest Plus.
      </Text>
      <View style={styles.traitGrid}>
        {premiumTraits.map((t) => renderTraitCard(t, colors.gold, !isPremium))}
      </View>

      <Text style={[styles.inputLabel, { color: colors.t4, fontFamily: fonts.bodyBold, marginTop: spacing.md }]}>
        STARTER TRAITS (MAX 2 TOTAL)
      </Text>
      <View style={styles.traitGrid}>
        {freeTraits.map((t) => renderTraitCard(t, colors.orchid, false))}

        {PRESTIGE_TRAITS.map((pt) => {
          const active = traits.includes(pt.id);
          const unlocked = isPremium || unlockedPrestigeTraitIds.includes(pt.id);
          const locked = !unlocked;
          return (
            <Pressable
              key={pt.id}
              disabled={locked}
              onPress={() => toggleTrait(pt.id)}
              style={[
                styles.traitCard,
                { backgroundColor: colors.bgCard, borderColor: colors.gold },
                active && { borderColor: `${colors.gold}80`, backgroundColor: `${colors.gold}08` },
                locked && styles.traitCardLocked,
              ]}
            >
              <Text style={[styles.traitLabel, { color: colors.gold, fontFamily: fonts.bodyBold }]}>
                {pt.label}
              </Text>
              <Text style={[styles.traitDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                {pt.description}
              </Text>
            </Pressable>
          );
        })}

        {hasDynastyTraitExpansion &&
          TRAITS_WITH_DESCRIPTIONS.filter((t) => (DYNASTY_TRAIT_POOL as readonly string[]).includes(t.id)).map((t) =>
            renderTraitCard(t, colors.gold, Boolean(t.premiumOnly) && !isPremium),
          )}
      </View>
    </FadeInView>
  );
}
