import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme, useThemedStyles, SPACING } from "@theme";
import { Character, RootStackParamList } from "@/types";
import {
  StatBar,
  Card,
  SectionLabel,
  Divider,
} from "@components/index";
import { ACHIEVEMENTS } from "@data/gameData";
import { ASPIRATION_MAP } from "@data/aspirations";
import { formatCurrency } from "@utils/currency";
import { getFinanceSummary } from "@utils/financeSummary";
import { formatCount } from "@utils/formatCount";
import {
  createSectionStyles,
  createLifeStatRowStyles,
  createChipStyles,
} from "./styles";

function LifeStatRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}) {
  const styles = useThemedStyles(createLifeStatRowStyles);
  const { colors, fonts, radii, spacing } = useTheme();
  const valueColor = color ?? colors.t1;
  return (
    <View style={[styles.row, { gap: spacing.md, paddingVertical: spacing.sm + 2 }]}>
      <View
        style={[
          styles.iconWrap,
          { borderRadius: radii.xs, backgroundColor: colors.bg2 },
        ]}
      >
        {icon}
      </View>
      <Text style={[styles.label, { color: colors.t3, fontFamily: fonts.body }]}>
        {label}
      </Text>
      <Text
        style={[styles.value, { color: valueColor, fontFamily: fonts.bodyBold }]}
      >
        {value}
      </Text>
    </View>
  );
}

export function FinancesSection({ character }: { character: Character }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createSectionStyles);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const cc = character.countryCode ?? "IN";
  const finance = getFinanceSummary(character);
  const bankStr = formatCurrency(character.bankBalance, cc);
  const assetsStr = formatCurrency(finance.assetValue, cc);
  const debtStr = formatCurrency(finance.totalDebt, cc);
  const netWorthStr = formatCurrency(finance.netWorth, cc);

  return (
    <View style={styles.section}>
      <SectionLabel label="Finances" />
      <Card>
        <View style={styles.financeGrid}>
          <View style={styles.financeCell}>
            <Text style={styles.financeLabel}>Bank</Text>
            <Text style={[styles.financeVal, { color: colors.wealth }]}>
              {bankStr}
            </Text>
          </View>
          <View style={styles.financeCell}>
            <Text style={styles.financeLabel}>Assets</Text>
            <Text style={[styles.financeVal, { color: colors.sapphire }]}>
              {assetsStr}
            </Text>
          </View>
          <View style={styles.financeCell}>
            <Text style={styles.financeLabel}>Debt</Text>
            <Text style={[styles.financeVal, { color: colors.crimson }]}>
              {debtStr}
            </Text>
          </View>
          <View style={styles.financeCell}>
            <Text style={styles.financeLabel}>Net Worth</Text>
            <Text style={[styles.financeVal, { color: colors.teal }]}>
              {netWorthStr}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => navigation.navigate("Shop")}
          style={[
            styles.shopBtn,
            {
              backgroundColor: `${colors.gold}12`,
              borderColor: `${colors.gold}30`,
              alignSelf: "flex-end",
              marginTop: SPACING.sm,
            },
          ]}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              stroke={colors.gold3}
              strokeWidth={2}
              strokeLinecap="round"
              d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
            />
            <Path
              stroke={colors.gold3}
              strokeWidth={2}
              strokeLinecap="round"
              d="M3 6h18M16 10a4 4 0 01-8 0"
            />
          </Svg>
          <Text style={styles.shopBtnText}>Shop</Text>
        </Pressable>
      </Card>
    </View>
  );
}

export function StatsTab({ character }: { character: Character }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createSectionStyles);

  const {
    age,
    traits,
    achievements,
    eventHistory,
    relationships,
    children,
    socialFollowers,
    aspirations,
  } = character;

  const unlockedAch = achievements.length;

  return (
    <>
      <FinancesSection character={character} />

      <View style={styles.section}>
        <SectionLabel label="Life Stats" />
        <Card style={{ gap: 0 }}>
          <LifeStatRow
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle
                  stroke={colors.sapphire}
                  strokeWidth={2}
                  cx="12"
                  cy="12"
                  r="10"
                />
                <Path
                  stroke={colors.sapphire}
                  strokeWidth={2}
                  strokeLinecap="round"
                  d="M12 6v6l4 2"
                />
              </Svg>
            }
            label="Years Lived"
            value={age}
            color={colors.t1}
          />
          <Divider />
          <LifeStatRow
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  stroke={colors.health}
                  strokeWidth={2}
                  fill="none"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </Svg>
            }
            label="Relationships"
            value={relationships}
            color={colors.health}
          />
          <Divider />
          <LifeStatRow
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle
                  stroke={colors.gold}
                  strokeWidth={2}
                  cx="9"
                  cy="7"
                  r="4"
                />
                <Path
                  stroke={colors.gold}
                  strokeWidth={2}
                  strokeLinecap="round"
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87"
                />
              </Svg>
            }
            label="Children"
            value={children}
            color={colors.gold}
          />
          <Divider />
          <LifeStatRow
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle
                  stroke={colors.social}
                  strokeWidth={2}
                  cx="9"
                  cy="7"
                  r="4"
                />
                <Path
                  stroke={colors.social}
                  strokeWidth={2}
                  strokeLinecap="round"
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87"
                />
              </Svg>
            }
            label="Followers"
            value={formatCount(socialFollowers ?? 0)}
            color={colors.social}
          />
          <Divider />
          <LifeStatRow
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  stroke={colors.orchid}
                  strokeWidth={2}
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </Svg>
            }
            label="Achievements"
            value={`${unlockedAch} / ${ACHIEVEMENTS.length}`}
            color={colors.orchid}
          />
          {aspirations && (
            <>
              <Divider />
              <LifeStatRow
                icon={
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      stroke={colors.gold}
                      strokeWidth={2}
                      strokeLinecap="round"
                      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                    />
                  </Svg>
                }
                label="Aspirations"
                value={`${ASPIRATION_MAP[aspirations.primary].label} · ${ASPIRATION_MAP[aspirations.secondary].label}`}
                color={colors.gold}
              />
            </>
          )}
          <Divider />
          <LifeStatRow
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  stroke={colors.catActivity}
                  strokeWidth={2}
                  strokeLinecap="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </Svg>
            }
            label="Life Events"
            value={eventHistory.length}
            color={colors.catActivity}
          />
        </Card>
      </View>

      {traits.length > 0 && (
        <View style={styles.section}>
          <SectionLabel label="Personality Traits" />
          <View style={styles.traitRow}>
            {traits.map((t) => (
              <View key={t} style={styles.traitChip}>
                <View
                  style={[styles.traitDot, { backgroundColor: colors.orchid }]}
                />
                <Text style={styles.traitText}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );
}

export function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const styles = useThemedStyles(createChipStyles);
  const { colors, fonts } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.val, { color, fontFamily: fonts.bodyBold }]}>
        {value}
      </Text>
      <Text style={[styles.lbl, { color: colors.t4, fontFamily: fonts.body }]}>
        {label}
      </Text>
      <StatBar value={value} color={color} height={3} />
    </View>
  );
}
