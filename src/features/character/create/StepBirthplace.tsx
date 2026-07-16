import { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { useTheme } from "@theme";
import { FadeInView } from "@components/index";
import { FamilyBackground } from "@/types";
import { COUNTRIES, FAMILY_BACKGROUNDS } from "@data/gameData";
import { CHALLENGES } from "@engine/challengeEngine";
import { getLifeExpectancy, getStartingBalance, getMaxPersonalDebt } from "@data/countryEconomy";
import { getPlayabilityMetrics } from "@engine/countryScaleEngine";
import { formatCurrency } from "@utils/currency";
import { WorldMapPicker } from "./WorldMapPicker";
import { OriginsSection } from "./OriginsSection";
import { CountryEconomySheet } from "./CountryEconomySheet";
import { getCreateStyles } from "./styles";

function getBgColors(colors: {
  health: string;
  sapphire: string;
  catFinancial: string;
  gold: string;
}) {
  return {
    poor: colors.health,
    middle: colors.sapphire,
    wealthy: colors.catFinancial,
    royalty: colors.gold,
  };
}

function getBgIcons(colors: {
  health: string;
  sapphire: string;
  catFinancial: string;
  gold: string;
}) {
  return {
    poor: (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          stroke={colors.health}
          strokeWidth={2}
          strokeLinecap="round"
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </Svg>
    ),
    middle: (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Rect stroke={colors.sapphire} strokeWidth={2} x="3" y="3" width="18" height="18" rx="2" />
        <Path stroke={colors.sapphire} strokeWidth={2} strokeLinecap="round" d="M9 12l2 2 4-4" />
      </Svg>
    ),
    wealthy: (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          stroke={colors.catFinancial}
          strokeWidth={2}
          strokeLinecap="round"
          d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
        />
      </Svg>
    ),
    royalty: (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill={colors.gold}>
        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </Svg>
    ),
  };
}

type StepBirthplaceProps = {
  country: string;
  setCountry: (v: string) => void;
  background: FamilyBackground;
  setBackground: (v: FamilyBackground) => void;
  activeChallengeId?: string;
  setActiveChallengeId: (id?: string) => void;
};

export function StepBirthplace({
  country,
  setCountry,
  background,
  setBackground,
  activeChallengeId,
  setActiveChallengeId,
}: StepBirthplaceProps) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getCreateStyles(radii, spacing, shadows);
  const BG_COLORS = getBgColors(colors);
  const BG_ICONS = getBgIcons(colors);
  const [economySheetOpen, setEconomySheetOpen] = useState(false);

  const countryPreview = useMemo(() => {
    if (!country) return null;
    const lifeExp = getLifeExpectancy(country);
    const startBal = getStartingBalance(background, country);
    const maxDebt = getMaxPersonalDebt(country, background);
    const { engineerSalary, stockMin, minInvestment, hatchbackPrice } = getPlayabilityMetrics(country);
    return {
      lifeExp,
      startBal,
      maxDebt,
      engineerSalary,
      stockMin,
      minInvestment,
      hatchbackPrice,
    };
  }, [country, background]);

  const inlineEconomyRows = countryPreview
    ? [
        { label: "Life expectancy", value: `~${countryPreview.lifeExp} years` },
        { label: "Starting balance", value: formatCurrency(countryPreview.startBal, country) },
        { label: "Max personal debt", value: formatCurrency(countryPreview.maxDebt, country) },
      ]
    : [];

  const selectedCountryName = COUNTRIES.find((c) => c.code === country)?.name ?? country;

  return (
    <FadeInView style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.t1, fontFamily: fonts.displayBold }]}>
        Where are you born?
      </Text>
      <Text style={[styles.stepSub, { color: colors.t3, fontFamily: fonts.body }]}>
        Select your home country and starting family circumstances.
      </Text>

      <OriginsSection title="BIRTHPLACE" defaultExpanded>
        <WorldMapPicker selectedCode={country} onSelect={setCountry} />
      </OriginsSection>

      {countryPreview && (
        <View style={[styles.economyPreviewCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.bgLabel, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
            Country snapshot
          </Text>
          {inlineEconomyRows.map((row) => (
            <View key={row.label} style={styles.economyPreviewRow}>
              <Text style={[styles.bgDesc, { color: colors.t4, fontFamily: fonts.body, flex: 1, marginTop: 0 }]}>
                {row.label}
              </Text>
              <Text style={[styles.bgDesc, { color: colors.t2, fontFamily: fonts.monoSemiBold, marginTop: 0 }]}>
                {row.value}
              </Text>
            </View>
          ))}
          <Pressable
            onPress={() => setEconomySheetOpen(true)}
            style={styles.economyDetailsLink}
            accessibilityRole="button"
            accessibilityLabel="View economy details"
          >
            <Text style={{ color: colors.teal, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>
              View economy details →
            </Text>
          </Pressable>
        </View>
      )}

      {Object.values(CHALLENGES).length > 0 && (
        <OriginsSection title="ACTIVE CHALLENGE" defaultExpanded={false}>
          <View style={styles.zodiacGrid}>
            <Pressable
              onPress={() => setActiveChallengeId(undefined)}
              style={[
                styles.countryChip,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
                activeChallengeId === undefined && {
                  borderColor: colors.t3,
                  backgroundColor: `${colors.t3}10`,
                },
              ]}
            >
              <Text
                style={[
                  styles.countryName,
                  { color: colors.t3, fontFamily: fonts.body },
                  activeChallengeId === undefined && { color: colors.t1, fontFamily: fonts.bodyBold },
                ]}
              >
                Classic Mode
              </Text>
            </Pressable>

            {Object.values(CHALLENGES).map((ch) => {
              const active = ch.id === activeChallengeId;
              return (
                <Pressable
                  key={ch.id}
                  onPress={() => setActiveChallengeId(ch.id)}
                  style={[
                    styles.countryChip,
                    { backgroundColor: colors.bgCard, borderColor: colors.border },
                    active && { borderColor: colors.teal, backgroundColor: `${colors.teal}10` },
                  ]}
                >
                  <Text
                    style={[
                      styles.countryName,
                      { color: colors.t3, fontFamily: fonts.body },
                      active && { color: colors.teal, fontFamily: fonts.bodyBold },
                    ]}
                  >
                    {ch.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </OriginsSection>
      )}

      <OriginsSection title="FAMILY BACKGROUND" defaultExpanded>
        <View style={styles.bgGrid}>
          {FAMILY_BACKGROUNDS.map((item) => {
            const active = item.id === background;
            const tintColor = BG_COLORS[item.id] || colors.sapphire;
            return (
              <Pressable
                key={item.id}
                onPress={() => setBackground(item.id)}
                style={[
                  styles.bgCard,
                  { backgroundColor: colors.bgCard, borderColor: colors.border },
                  active && { borderColor: tintColor },
                ]}
              >
                <View style={[styles.bgIconWrap, { backgroundColor: `${tintColor}12` }]}>
                  {BG_ICONS[item.id]}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bgLabel, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.bgDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                    {item.description}
                  </Text>
                </View>
                <View style={[styles.wealthPill, { backgroundColor: `${tintColor}12` }]}>
                  <Text style={[styles.wealthText, { color: tintColor, fontFamily: fonts.monoSemiBold }]}>
                    {item.wealthStart}
                  </Text>
                </View>

                {active && (
                  <View style={[styles.activeTick, { backgroundColor: tintColor }]}>
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
              </Pressable>
            );
          })}
        </View>
      </OriginsSection>

      {countryPreview && (
        <CountryEconomySheet
          visible={economySheetOpen}
          countryCode={country}
          countryName={selectedCountryName}
          details={{
            engineerSalary: countryPreview.engineerSalary,
            minInvestment: countryPreview.minInvestment,
            stockMin: countryPreview.stockMin,
            hatchbackPrice: countryPreview.hatchbackPrice,
          }}
          onClose={() => setEconomySheetOpen(false)}
        />
      )}
    </FadeInView>
  );
}
