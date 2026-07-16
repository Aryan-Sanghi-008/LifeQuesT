import { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, Alert } from "react-native";
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
import { groupLedgerByAge } from "@engine/financeLedgerEngine";
import { useGameStore } from "@store/gameStore";
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
  const { colors, fonts, spacing, radii } = useTheme();
  const styles = useThemedStyles(createSectionStyles);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const repayDebt = useGameStore((s) => s.repayDebt);

  const cc = character.countryCode ?? "IN";
  const finance = useMemo(() => getFinanceSummary(character), [character]);
  const bankStr = formatCurrency(character.bankBalance, cc);
  const assetsStr = formatCurrency(finance.assetValue, cc);
  const personalDebt = character.debt ?? 0;
  const debtStr = formatCurrency(finance.totalDebt, cc);
  const netWorthStr = formatCurrency(finance.netWorth, cc);
  const yearSummaries = useMemo(
    () => groupLedgerByAge(character.financeLedger ?? []).slice(0, 8),
    [character.financeLedger],
  );
  const [expandedAge, setExpandedAge] = useState<number | null>(null);
  const [repayInput, setRepayInput] = useState("");

  const maxRepayable = Math.min(personalDebt, character.bankBalance);
  const runRepay = (amount: number) => {
    const result = repayDebt(amount);
    Alert.alert(result.ok ? "Debt repaid" : "Could not repay", result.message);
    if (result.ok) setRepayInput("");
  };

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

        {personalDebt > 0 ? (
          <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 12,
                color: colors.t3,
              }}
            >
              Personal debt: {formatCurrency(personalDebt, cc)} · Bank does not auto-pay debt
            </Text>
            <TextInput
              value={repayInput}
              onChangeText={setRepayInput}
              keyboardType="numeric"
              placeholder="Repay amount"
              placeholderTextColor={colors.t4}
              accessibilityLabel="Debt repayment amount"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.sm,
                paddingHorizontal: spacing.md,
                paddingVertical: 10,
                color: colors.t1,
                fontFamily: fonts.mono,
              }}
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
              {[0.25, 0.5, 1].map((pct) => (
                <Pressable
                  key={pct}
                  onPress={() =>
                    setRepayInput(String(Math.floor(maxRepayable * pct)))
                  }
                  style={{
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 6,
                    borderRadius: radii.sm,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.t2 }}>
                    {pct === 1 ? "100%" : `${pct * 100}%`}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => setRepayInput(String(maxRepayable))}
                style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 6,
                  borderRadius: radii.sm,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.t2 }}>
                  Pay all
                </Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => {
                const amount = Number(repayInput.replace(/[^0-9.]/g, ""));
                runRepay(amount);
              }}
              disabled={maxRepayable <= 0}
              style={{
                backgroundColor: colors.sapphire,
                borderRadius: radii.sm,
                paddingVertical: 10,
                alignItems: "center",
                opacity: maxRepayable <= 0 ? 0.45 : 1,
              }}
            >
              <Text style={{ fontFamily: fonts.bodyBold, color: "#FFF" }}>
                Repay from bank
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 10,
              color: colors.t4,
              letterSpacing: 2,
            }}
          >
            EARNINGS & EXPENSES
          </Text>
          {yearSummaries.length === 0 ? (
            <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.t4 }}>
              Cashflow lines appear after Age Up, activities, tuition, and repayments.
            </Text>
          ) : (
            yearSummaries.map((year) => {
              const open = expandedAge === year.age;
              return (
                <View key={year.age}>
                  <Pressable
                    onPress={() => setExpandedAge(open ? null : year.age)}
                    accessibilityLabel={`Age ${year.age} finance summary`}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text style={{ fontFamily: fonts.bodySemiBold, color: colors.t1, fontSize: 13 }}>
                      Age {year.age}
                    </Text>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: year.net >= 0 ? colors.emerald : colors.crimson }}>
                      {year.net >= 0 ? "+" : ""}
                      {formatCurrency(year.net, cc)}
                      {year.debtChange > 0
                        ? ` · debt +${formatCurrency(year.debtChange, cc)}`
                        : year.debtChange < 0
                          ? ` · debt ${formatCurrency(year.debtChange, cc)}`
                          : ""}
                    </Text>
                  </Pressable>
                  {open ? (
                    <View style={{ gap: 6, paddingVertical: spacing.sm }}>
                      <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.t3 }}>
                        In {formatCurrency(year.income, cc)} · Out {formatCurrency(Math.abs(year.expense), cc)}
                      </Text>
                      {year.entries.map((e) => (
                        <View
                          key={e.id}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            gap: spacing.sm,
                          }}
                        >
                          <Text
                            style={{
                              flex: 1,
                              fontFamily: fonts.body,
                              fontSize: 12,
                              color: colors.t2,
                            }}
                            numberOfLines={2}
                          >
                            {e.label}
                            {e.debtDelta > 0 ? " (raised debt)" : ""}
                          </Text>
                          <Text
                            style={{
                              fontFamily: fonts.mono,
                              fontSize: 12,
                              color: e.amount >= 0 ? colors.emerald : colors.crimson,
                            }}
                          >
                            {e.amount >= 0 ? "+" : ""}
                            {formatCurrency(e.amount, cc)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
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
  const globalPrestige = useGameStore((s) => s.globalPrestige);
  const user = useGameStore((s) => s.user);

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
      <View style={styles.section}>
        <SectionLabel label="Account" />
        <Card style={{ gap: 0 }}>
          <LifeStatRow
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle stroke={colors.gold} strokeWidth={2} cx="12" cy="12" r="10" />
              </Svg>
            }
            label="Player"
            value={user?.displayName ?? 'Guest'}
          />
          <Divider />
          <LifeStatRow
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  stroke={colors.orchid}
                  strokeWidth={2}
                  strokeLinecap="round"
                  d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"
                />
              </Svg>
            }
            label="Prestige level"
            value={globalPrestige?.prestigeLevel ?? 0}
          />
          <Divider />
          <LifeStatRow
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  stroke={colors.sapphire}
                  strokeWidth={2}
                  strokeLinecap="round"
                  d="M4 19V5M4 19h16M8 15v4M12 11v8M16 7v12"
                />
              </Svg>
            }
            label="Lives lived (account)"
            value={globalPrestige?.totalLivesLived ?? 0}
          />
          <Divider />
          <LifeStatRow
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle stroke={colors.teal} strokeWidth={2} cx="12" cy="12" r="10" />
              </Svg>
            }
            label="Lifetime followers (this life)"
            value={formatCount(socialFollowers ?? 0)}
          />
        </Card>
      </View>

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
