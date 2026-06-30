import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { useTheme } from "@theme";
import { useGameStore } from "../../store/gameStore";
import { NpcAvatar } from "@components/Avatars";
import { Card, StatBar, SectionLabel, Badge } from "@components/index";
import { ScreenShell } from "@components/ScreenShell";
import { TabScreenHeader } from "@components/TabScreenHeader";
import {
  getEligibleCareers,
  checkCareerEligibility,
  getCountrySalary,
  getSkillTreeProgress,
} from "../../engine/careerEngine";
import { getAllCareerPaths } from "../../data/careerPaths";
import { resolveEducationLevelForDisplay } from "../../engine/educationEngine";
import { listPursuableCertifications, getCertificationLabel } from "../../engine/certificationEngine";
import { CAREER_PATHS } from "../../data/careerPaths";
import { formatCurrency } from "@utils/currency";
import Svg, { Path, Rect } from "react-native-svg";

// ─── Education Icons and Colors Dynamic Generators ───────────────────────────

function getEduIcons(colors: any) {
  return {
    none: (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path
          stroke={colors.t4}
          strokeWidth={2}
          strokeLinecap="round"
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        />
      </Svg>
    ),
    elementary: (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path
          stroke={colors.sapphire}
          strokeWidth={2}
          strokeLinecap="round"
          d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"
        />
        <Path
          stroke={colors.sapphire}
          strokeWidth={2}
          strokeLinecap="round"
          d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"
        />
      </Svg>
    ),
    secondary: (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path
          stroke={colors.catCareer}
          strokeWidth={2}
          strokeLinecap="round"
          d="M12 14l9-5-9-5-9 5 9 5z"
        />
      </Svg>
    ),
    university: (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path
          stroke={colors.orchid}
          strokeWidth={2}
          strokeLinecap="round"
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
        <Path stroke={colors.orchid} strokeWidth={2} d="M9 22V12h6v10" />
      </Svg>
    ),
    graduate: (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill={colors.gold}>
        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </Svg>
    ),
  };
}

function getEduColors(colors: any): Record<string, string> {
  return {
    none: colors.t4,
    elementary: colors.sapphire,
    secondary: colors.catCareer,
    university: colors.orchid,
    graduate: colors.gold,
  };
}

// ─── Education Track ─────────────────────────────────────────────────────────

function EducationTrack({
  current,
}: {
  current: string;
  countryCode: string;
}) {
  const { colors, fonts, spacing } = useTheme();
  const EDU_ICONS = getEduIcons(colors);
  const EDU_COLORS = getEduColors(colors);

  const EDU_LEVELS = [
    { id: "none", label: "No Education" },
    { id: "elementary", label: "Elementary School" },
    { id: "secondary", label: "Secondary School" },
    { id: "university", label: "University" },
    { id: "graduate", label: "Graduate" },
  ];
  const currentIdx = EDU_LEVELS.findIndex((l) => l.id === current);

  return (
    <Card style={{ gap: spacing.sm }}>
      <Text
        style={{
          fontFamily: fonts.bodySemiBold,
          fontSize: 10,
          color: colors.t4,
          letterSpacing: 2,
        }}
      >
        EDUCATION PATH
      </Text>
      {EDU_LEVELS.map((level, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const color = done
          ? colors.emerald
          : active
          ? EDU_COLORS[level.id] ?? colors.sapphire
          : colors.t4;
        return (
          <View key={level.id}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
              }}
            >
              <View
                style={[
                  {
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  { backgroundColor: `${color}14` },
                ]}
              >
                {done ? (
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path
                      stroke={colors.emerald}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      d="M20 6L9 17l-5-5"
                    />
                  </Svg>
                ) : (
                  EDU_ICONS[level.id as keyof typeof EDU_ICONS]
                )}
              </View>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 14,
                  flex: 1,
                  color,
                }}
              >
                {level.label}
              </Text>
              {active && <Badge label="Current" color={color} />}
            </View>
            {i < EDU_LEVELS.length - 1 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginLeft: 46,
                  marginTop: 6,
                }}
              />
            )}
          </View>
        );
      })}
    </Card>
  );
}

// ─── Job Panel ────────────────────────────────────────────────────────────────

function JobPanel() {
  const { colors, fonts, spacing } = useTheme();
  const styles = getStyles(spacing);

  const character = useGameStore((s) => s.character);
  const workHarder = useGameStore((s) => s.workHarder);
  const askForRaise = useGameStore((s) => s.askForRaise);
  const quitJob = useGameStore((s) => s.quitJob);
  const applyForPromotion = useGameStore((s) => s.applyForPromotion);

  if (!character) return null;
  const { career, job } = character;
  const cc = character.countryCode ?? "IN";
  const noJob = !career && (job === "Unemployed" || job === "Student");

  if (noJob) {
    return (
      <Card>
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 14,
            color: colors.t2,
          }}
        >
          {job === "Student" ? "Still in School" : "Currently Unemployed"}
        </Text>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 12,
            color: colors.t4,
            marginTop: 4,
          }}
        >
          Apply for jobs below when you are ready.
        </Text>
      </Card>
    );
  }

  if (!career) return null;
  const perfColor =
    career.performance >= 70
      ? colors.emerald
      : career.performance >= 40
      ? colors.gold
      : colors.health;
  const salaryStr = formatCurrency(career.salary, cc);

  return (
    <Card style={{ gap: spacing.md }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 16,
              color: colors.t1,
            }}
          >
            {career.title}
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.t3,
              marginTop: 2,
            }}
          >
            {career.company}
          </Text>
        </View>
        <View
          style={[
            styles.salaryBadge,
            {
              backgroundColor: `${colors.wealth}12`,
              borderColor: `${colors.wealth}28`,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: fonts.monoSemiBold,
              fontSize: 13,
              color: colors.wealth,
            }}
          >
            {salaryStr}/yr
          </Text>
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={{ fontFamily: fonts.body, fontSize: 11, color: colors.t4 }}
          >
            Performance
          </Text>
          <Text
            style={{
              fontFamily: fonts.monoSemiBold,
              fontSize: 11,
              color: perfColor,
            }}
          >
            {career.performance}%
          </Text>
        </View>
        <StatBar value={career.performance} color={perfColor} height={6} />
      </View>
      <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
        {[
          { label: "Work Harder", action: workHarder, color: colors.emerald },
          {
            label: "Ask Raise",
            action: () => {
              const r = askForRaise();
              Alert.alert(r.success ? "Raise!" : "Denied", r.message);
            },
            color: colors.gold,
          },
          {
            label: "Promotion",
            action: () => {
              const r = applyForPromotion();
              Alert.alert(r.success ? "Promoted" : "Denied", r.message);
            },
            color: colors.sapphire,
          },
          {
            label: "Quit",
            action: () =>
              Alert.alert("Quit?", "Leave your job?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Quit",
                  style: "destructive",
                  onPress: quitJob,
                },
              ]),
            color: colors.crimson,
          },
        ].map((btn) => (
          <Pressable
            key={btn.label}
            onPress={btn.action}
            style={[
              styles.btn,
              { borderColor: btn.color, backgroundColor: `${btn.color}0D` },
            ]}
          >
            <Text style={[styles.btnText, { color: btn.color }]}>
              {btn.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

// ─── Class Roster ────────────────────────────────────────────────────────────

function ClassRoster() {
  const { colors, fonts, spacing } = useTheme();

  const getClassmatesFn = useGameStore((s) => s.getClassmates);
  const classmates = getClassmatesFn();

  if (classmates.length === 0) {
    return (
      <Card>
        <Text
          style={{
            color: colors.t4,
            fontFamily: fonts.body,
            fontSize: 13,
          }}
        >
          No classmates yet — age up to start school.
        </Text>
      </Card>
    );
  }

  return (
    <Card style={{ gap: spacing.md }}>
      <Text
        style={{
          fontFamily: fonts.bodySemiBold,
          fontSize: 10,
          color: colors.t4,
          letterSpacing: 2,
        }}
      >
        YOUR CLASS
      </Text>
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}
      >
        {classmates.map((c) => (
          <View
            key={c.id}
            style={{ width: "29%", alignItems: "center", gap: 4 }}
          >
            <NpcAvatar
              seed={c.avatarSeed}
              size={40}
              age={c.age}
              gender={c.gender as "male" | "female"}
            />
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 11,
                color: colors.t2,
              }}
              numberOfLines={1}
            >
              {c.name.split(" ")[0]}
            </Text>
            <StatBar
              value={c.relationshipScore}
              color={
                c.relationshipScore > 50 ? colors.teal : colors.gold
              }
              height={3}
            />
          </View>
        ))}
      </View>
    </Card>
  );
}

// ─── CertExamsPanel ───────────────────────────────────────────────────────────

function CertExamsPanel() {
  const { colors, fonts, spacing } = useTheme();
  const styles = getStyles(spacing);

  const character = useGameStore((s) => s.character);
  const takeCertificationExam = useGameStore((s) => s.takeCertificationExam);
  if (!character || character.age < 18) return null;

  const pursuable = listPursuableCertifications(character);
  if (pursuable.length === 0) return null;

  const cc = character.countryCode ?? "IN";

  return (
    <Card style={{ gap: spacing.sm }}>
      <Text
        style={{
          fontFamily: fonts.bodySemiBold,
          fontSize: 10,
          color: colors.t4,
          letterSpacing: 2,
        }}
      >
        LICENSES & EXAMS
      </Text>
      {pursuable.map(({ cert, eligibility }, i) => (
        <Pressable
          key={cert.id}
          onPress={() => {
            const fee = formatCurrency(eligibility.cost, cc);
            Alert.alert(
              cert.label,
              `Exam fee: ${fee}. Pass chance depends on intelligence.`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Take Exam",
                  onPress: () => {
                    const r = takeCertificationExam(cert.id);
                    Alert.alert(r.ok ? "Passed!" : "Failed", r.message);
                  },
                },
              ],
            );
          }}
          style={[
            styles.jobRow,
            i > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.jobIcon,
              { backgroundColor: `${colors.orchid}12` },
            ]}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                stroke={colors.orchid}
                strokeWidth={2}
                strokeLinecap="round"
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 14,
                color: colors.t1,
              }}
            >
              {cert.label}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 11,
                color: colors.t4,
              }}
            >
              Fee: {formatCurrency(eligibility.cost, cc)}
            </Text>
          </View>
        </Pressable>
      ))}
      {(character.certificationIds ?? []).length > 0 && (
        <View style={{ marginTop: spacing.sm, gap: 4 }}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 10,
              color: colors.t4,
              letterSpacing: 1,
            }}
          >
            EARNED
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.emerald,
            }}
          >
            {(character.certificationIds ?? []).map(getCertificationLabel).join(" · ")}
          </Text>
        </View>
      )}
    </Card>
  );
}

// ─── Job Board ────────────────────────────────────────────────────────────────

function JobBoard() {
  const { colors, fonts, spacing } = useTheme();
  const styles = getStyles(spacing);

  const applyForJob = useGameStore((s) => s.applyForJob);
  const character = useGameStore((s) => s.character);
  if (!character || character.age < 16) return null;
  const countryCode = character.countryCode ?? "IN";

  const eligible = getEligibleCareers(character).slice(0, 8);

  return (
    <Card style={{ gap: spacing.sm }}>
      <Text
        style={{
          fontFamily: fonts.bodySemiBold,
          fontSize: 10,
          color: colors.t4,
          letterSpacing: 2,
        }}
      >
        AVAILABLE CAREERS
      </Text>
      {eligible.length === 0 ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.t4,
          }}
        >
          No careers available yet. Finish school or meet requirements below.
        </Text>
      ) : (
        eligible.map(({ career, eligibility }, i) => {
          const localSalary = getCountrySalary(career.baseSalary, countryCode);
          const probColor =
            eligibility.hireProbability >= 70
              ? colors.emerald
              : eligibility.hireProbability >= 40
              ? colors.gold
              : colors.crimson;
          return (
            <Pressable
              key={career.id}
              onPress={() => {
                const r = applyForJob(career.id);
                Alert.alert(r.success ? "Hired!" : "Not This Time", r.message);
              }}
              style={[
                styles.jobRow,
                i > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.jobIcon,
                  { backgroundColor: `${colors.catCareer}12` },
                ]}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Rect
                    stroke={colors.catCareer}
                    strokeWidth={2}
                    x="2"
                    y="7"
                    width="20"
                    height="14"
                    rx="2"
                  />
                  <Path
                    stroke={colors.catCareer}
                    strokeWidth={2}
                    strokeLinecap="round"
                    d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
                  />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 14,
                    color: colors.t1,
                  }}
                >
                  {career.label}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 11,
                    color: colors.t4,
                  }}
                >
                  {career.company}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 2,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 3,
                      backgroundColor: colors.bg2,
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: `${eligibility.hireProbability}%` as `${number}%`,
                        height: "100%",
                        backgroundColor: probColor,
                        borderRadius: 2,
                      }}
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: fonts.monoSemiBold,
                      fontSize: 9,
                      color: probColor,
                    }}
                  >
                    {eligibility.hireProbability}%
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.salaryBadge,
                  {
                    backgroundColor: `${colors.wealth}12`,
                    borderColor: `${colors.wealth}25`,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: fonts.monoSemiBold,
                    fontSize: 12,
                    color: colors.wealth,
                  }}
                >
                  {formatCurrency(localSalary, countryCode)}/yr
                </Text>
              </View>
            </Pressable>
          );
        })
      )}
      {(() => {
        const locked = CAREER_PATHS.filter(
          (c) =>
            c.isEntryLevel && !eligible.find((e) => e.career.id === c.id),
        ).slice(0, 3);
        if (locked.length === 0) return null;
        return (
          <>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 10,
                color: colors.t4,
                letterSpacing: 2,
                marginTop: spacing.sm,
              }}
            >
              LOCKED (REQUIREMENTS NOT MET)
            </Text>
            {locked.map((career, i) => {
              const check = checkCareerEligibility(character, career.id);
              return (
                <View
                  key={career.id}
                  style={[
                    styles.jobRow,
                    { opacity: 0.4 },
                    i > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.jobIcon,
                      { backgroundColor: `${colors.t4}12` },
                    ]}
                  >
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Rect
                        stroke={colors.t4}
                        strokeWidth={2}
                        x="2"
                        y="7"
                        width="20"
                        height="14"
                        rx="2"
                      />
                      <Path
                        stroke={colors.t4}
                        strokeWidth={2}
                        strokeLinecap="round"
                        d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
                      />
                    </Svg>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: fonts.bodySemiBold,
                        fontSize: 14,
                        color: colors.t3,
                      }}
                    >
                      {career.label}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 10,
                        color: colors.t4,
                      }}
                      numberOfLines={1}
                    >
                      {check.reason ??
                        `Requires: ${career.requirements.minEducationStage}`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        );
      })()}
    </Card>
  );
}

// ─── Skill Tree Panel ────────────────────────────────────────────────────────

function SkillTreePanel() {
  const { colors, fonts, spacing } = useTheme();

  const character = useGameStore((s) => s.character);
  if (!character?.career) return null;

  const path = getAllCareerPaths().find(
    (c) => c.label === character.career!.title,
  );
  if (!path?.skillTree?.length) return null;

  const nodes = getSkillTreeProgress(path, character);

  return (
    <Card style={{ gap: spacing.sm, marginTop: spacing.md }}>
      <Text
        style={{
          fontFamily: fonts.bodySemiBold,
          fontSize: 10,
          color: colors.t4,
          letterSpacing: 2,
        }}
      >
        SKILL TREE
      </Text>
      {nodes.map((node) => (
        <View key={node.id} style={{ gap: 4 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 13,
                color: node.unlocked ? colors.emerald : colors.t2,
              }}
            >
              {node.label}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 10,
                color: colors.t4,
              }}
            >
              {node.unlocked
                ? "Unlocked"
                : `${node.minPerformance}% · ${node.minYearsInRole}yr`}
            </Text>
          </View>
          <StatBar
            value={
              node.unlocked ? 100 : Math.min(100, character.career!.performance)
            }
            color={node.unlocked ? colors.emerald : colors.gold}
            height={4}
          />
        </View>
      ))}
    </Card>
  );
}

// ─── Main Screen Component ────────────────────────────────────────────────────

export function CareerScreen() {
  const { colors, fonts, spacing } = useTheme();
  const styles = getStyles(spacing);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore((s) => s.character);
  if (!character) return null;

  const inSchool = character.age >= 5 && character.age <= 17;
  const cc = character.countryCode ?? "IN";

  return (
    <ScreenShell>
      <TabScreenHeader
        title="Career & School"
        subtitle={inSchool ? "Your education path" : character.career?.title ?? "Find your next role"}
        accent={colors.catCareer}
        icon={
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Rect stroke={colors.catCareer} strokeWidth={2} x="2" y="7" width="20" height="14" rx="2" />
            <Path stroke={colors.catCareer} strokeWidth={2} strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
          </Svg>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
          <SectionLabel label="Education" style={{ marginBottom: spacing.md }} />
          <EducationTrack
            current={resolveEducationLevelForDisplay(
              character.educationStage,
              character.educationLevel,
            )}
            countryCode={cc}
          />
          {character.age >= 13 &&
            character.age <= 24 &&
            character.educationLevel !== "graduate" && (
              <Pressable
                style={[
                  styles.btn,
                  { borderColor: colors.sapphire, marginTop: spacing.md },
                ]}
                onPress={() => navigation.navigate("Study")}
                accessibilityLabel="Start study session"
              >
                <Text style={[styles.btnText, { color: colors.sapphire, fontFamily: fonts.bodySemiBold }]}>
                  Study Session
                </Text>
              </Pressable>
            )}
          <SectionLabel
            label={inSchool ? "School Life" : "Career"}
            style={{ marginTop: spacing.xl, marginBottom: spacing.md }}
          />
          {inSchool ? (
            <ClassRoster />
          ) : (
            <>
              <JobPanel />
              <SkillTreePanel />
            </>
          )}
          {!inSchool && character.age >= 16 && (
            <>
              <SectionLabel
                label="Job Board"
                style={{ marginTop: spacing.xl, marginBottom: spacing.md }}
              />
              <JobBoard />
              <CertExamsPanel />
            </>
          )}
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
    </ScreenShell>
  );
}

const getStyles = (spacing: { lg: number; md: number; sm: number; xl: number; xxxl: number }) =>
  StyleSheet.create({
    scroll: { padding: spacing.lg },
    btn: {
      paddingHorizontal: spacing.md,
      paddingVertical: 9,
      borderRadius: 8,
      borderWidth: 1.5,
    },
    btnText: { fontSize: 12 },
    jobRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    jobIcon: {
      width: 34,
      height: 34,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    salaryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
    },
  });
