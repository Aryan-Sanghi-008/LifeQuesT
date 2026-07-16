import { useMemo, useCallback } from "react";
import { View, Text, Pressable, Alert, FlatList, ListRenderItem } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { useTheme } from "@theme";
import { Card } from "@components/index";
import type { Character } from "@/types";
import type { GameStore } from "@store/gameStore";
import {
  getEligibleCareers,
  getScenarioCareerBoard,
  checkCareerEligibility,
  getCountrySalary,
} from "@engine/careerEngine";
import { getAllCareerPaths } from "@data/careerPaths";
import { formatCurrency } from "@utils/currency";
import { getCareerStyles } from "@features/career/components/careerStyles";

type EligibleEntry = ReturnType<typeof getEligibleCareers>[number];
type ScenarioEntry = ReturnType<typeof getScenarioCareerBoard>[number];

export type JobBoardItem =
  | { kind: "header"; key: string; title: string; extraTop?: boolean }
  | { kind: "empty"; key: string; message: string }
  | { kind: "eligible"; key: string; entry: EligibleEntry; showBorder: boolean }
  | { kind: "scenario"; key: string; entry: ScenarioEntry; showBorder: boolean; scenarioId: string }
  | { kind: "locked"; key: string; career: ReturnType<typeof getAllCareerPaths>[number]; reason: string; showBorder: boolean };

export function buildJobBoardItems(character: Character): JobBoardItem[] {
  const allEligible = getEligibleCareers(character);
  const preferredJobs = allEligible.filter((e) => e.preferred).slice(0, 6);
  const otherJobs =
    preferredJobs.length > 0
      ? allEligible.filter((e) => !e.preferred).slice(0, 4)
      : allEligible.slice(0, 8);
  const scenarioCareers = getScenarioCareerBoard(character).slice(0, 6);
  const scenarioId = character.scenarioId ?? "classic";
  const items: JobBoardItem[] = [];

  if (preferredJobs.length > 0) {
    items.push({ kind: "header", key: "hdr_field", title: "YOUR FIELD" });
    preferredJobs.forEach((entry, i) => {
      items.push({
        kind: "eligible",
        key: `pref_${entry.career.id}`,
        entry,
        showBorder: i > 0,
      });
    });
    if (otherJobs.length > 0) {
      items.push({ kind: "header", key: "hdr_other", title: "OTHER JOBS", extraTop: true });
      otherJobs.forEach((entry, i) => {
        items.push({
          kind: "eligible",
          key: `other_${entry.career.id}`,
          entry,
          showBorder: i > 0,
        });
      });
    }
  } else if (otherJobs.length === 0) {
    items.push({ kind: "header", key: "hdr_avail", title: "AVAILABLE CAREERS" });
    items.push({
      kind: "empty",
      key: "empty_careers",
      message: "No careers available yet. Finish school or meet requirements below.",
    });
  } else {
    items.push({ kind: "header", key: "hdr_avail", title: "AVAILABLE CAREERS" });
    otherJobs.forEach((entry, i) => {
      items.push({
        kind: "eligible",
        key: `avail_${entry.career.id}`,
        entry,
        showBorder: i > 0,
      });
    });
  }

  if (scenarioCareers.length > 0) {
    items.push({
      kind: "header",
      key: "hdr_scenario",
      title: "SCENARIO CAREERS",
      extraTop: true,
    });
    scenarioCareers.forEach((entry, i) => {
      items.push({
        kind: "scenario",
        key: `scenario_${entry.career.id}`,
        entry,
        showBorder: i > 0,
        scenarioId,
      });
    });
  }

  const shownIds = new Set([
    ...preferredJobs.map((e) => e.career.id),
    ...otherJobs.map((e) => e.career.id),
  ]);
  const locked = getAllCareerPaths()
    .filter(
      (c) =>
        c.id !== "entrepreneur" &&
        c.isEntryLevel &&
        !c.requiresScenario?.length &&
        !shownIds.has(c.id),
    )
    .slice(0, 3);

  if (locked.length > 0) {
    items.push({
      kind: "header",
      key: "hdr_locked",
      title: "LOCKED (REQUIREMENTS NOT MET)",
      extraTop: true,
    });
    locked.forEach((career, i) => {
      const check = checkCareerEligibility(character, career.id);
      items.push({
        kind: "locked",
        key: `locked_${career.id}`,
        career,
        reason: check.reason ?? `Requires: ${career.requirements.minEducationStage}`,
        showBorder: i > 0,
      });
    });
  }

  return items;
}

export function JobBoard({
  character,
  applyForJob,
}: {
  character: Character;
  applyForJob: GameStore["applyForJob"];
}) {
  const { colors, fonts, spacing } = useTheme();
  const styles = getCareerStyles(spacing);

  const boardItems = useMemo(() => buildJobBoardItems(character), [character]);
  const countryCode = character.countryCode ?? "IN";

  const renderItem: ListRenderItem<JobBoardItem> = useCallback(
    ({ item }) => {
      if (item.kind === "header") {
        return (
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 10,
              color: colors.t4,
              letterSpacing: 2,
              marginTop: item.extraTop ? spacing.sm : 0,
            }}
          >
            {item.title}
          </Text>
        );
      }

      if (item.kind === "empty") {
        return (
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.t4 }}>
            {item.message}
          </Text>
        );
      }

      if (item.kind === "eligible") {
        const { career, eligibility } = item.entry;
        const localSalary = getCountrySalary(career.baseSalary, countryCode);
        const probColor =
          eligibility.hireProbability >= 70
            ? colors.emerald
            : eligibility.hireProbability >= 40
              ? colors.gold
              : colors.crimson;
        return (
          <Pressable
            onPress={() => {
              const r = applyForJob(career.id);
              Alert.alert(r.success ? "Hired!" : "Not This Time", r.message);
            }}
            style={[
              styles.jobRow,
              item.showBorder && { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
          >
            <View style={[styles.jobIcon, { backgroundColor: `${colors.catCareer}12` }]}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Rect stroke={colors.catCareer} strokeWidth={2} x="2" y="7" width="20" height="14" rx="2" />
                <Path stroke={colors.catCareer} strokeWidth={2} strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.t1 }}>
                {career.label}
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.t4 }}>
                {career.company}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                <View style={{ width: 40, height: 3, backgroundColor: colors.bg2, borderRadius: 2, overflow: "hidden" }}>
                  <View
                    style={{
                      width: `${eligibility.hireProbability}%` as `${number}%`,
                      height: "100%",
                      backgroundColor: probColor,
                      borderRadius: 2,
                    }}
                  />
                </View>
                <Text style={{ fontFamily: fonts.monoSemiBold, fontSize: 9, color: probColor }}>
                  {eligibility.hireProbability}%
                </Text>
              </View>
            </View>
            <View style={[styles.salaryBadge, { backgroundColor: `${colors.wealth}12`, borderColor: `${colors.wealth}25` }]}>
              <Text style={{ fontFamily: fonts.monoSemiBold, fontSize: 12, color: colors.wealth }}>
                {formatCurrency(localSalary, countryCode)}/yr
              </Text>
            </View>
          </Pressable>
        );
      }

      if (item.kind === "scenario") {
        const { career, eligibility } = item.entry;
        const localSalary = getCountrySalary(career.baseSalary, countryCode);
        const wrongScenario =
          career.requiresScenario?.length &&
          !career.requiresScenario.includes(item.scenarioId as import("@/types").ScenarioId);
        const isLocked = wrongScenario || !eligibility.eligible;
        const row = (
          <View
            style={[
              styles.jobRow,
              isLocked && { opacity: 0.45 },
              item.showBorder && { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
          >
            <View style={[styles.jobIcon, { backgroundColor: `${colors.catCareer}12` }]}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Rect stroke={colors.catCareer} strokeWidth={2} x="2" y="7" width="20" height="14" rx="2" />
                <Path stroke={colors.catCareer} strokeWidth={2} strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.t1 }}>
                {career.label}
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.t4 }} numberOfLines={2}>
                {wrongScenario
                  ? "Not available in this scenario."
                  : eligibility.eligible
                    ? career.company
                    : eligibility.reason ?? career.company}
              </Text>
            </View>
            <View style={[styles.salaryBadge, { backgroundColor: `${colors.wealth}12`, borderColor: `${colors.wealth}25` }]}>
              <Text style={{ fontFamily: fonts.monoSemiBold, fontSize: 12, color: colors.wealth }}>
                {formatCurrency(localSalary, countryCode)}/yr
              </Text>
            </View>
          </View>
        );
        if (isLocked) return row;
        return (
          <Pressable
            onPress={() => {
              const r = applyForJob(career.id);
              Alert.alert(r.success ? "Hired!" : "Not This Time", r.message);
            }}
          >
            {row}
          </Pressable>
        );
      }

      const { career, reason } = item;
      return (
        <View
          style={[
            styles.jobRow,
            { opacity: 0.4 },
            item.showBorder && { borderTopWidth: 1, borderTopColor: colors.border },
          ]}
        >
          <View style={[styles.jobIcon, { backgroundColor: `${colors.t4}12` }]}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Rect stroke={colors.t4} strokeWidth={2} x="2" y="7" width="20" height="14" rx="2" />
              <Path stroke={colors.t4} strokeWidth={2} strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.t3 }}>
              {career.label}
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 10, color: colors.t4 }} numberOfLines={1}>
              {reason}
            </Text>
          </View>
        </View>
      );
    },
    [applyForJob, colors, countryCode, fonts, spacing, styles],
  );

  if (character.age < 16) return null;

  return (
    <Card style={{ gap: spacing.sm }}>
      <FlatList
        data={boardItems}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        scrollEnabled={false}
        nestedScrollEnabled
        getItemLayout={undefined}
      />
    </Card>
  );
}
