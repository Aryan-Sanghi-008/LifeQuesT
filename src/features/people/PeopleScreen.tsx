import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useToastStore } from "@store/toastStore";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@theme";
import { useGameStore } from "../../store/gameStore";
import { NpcAvatar } from "@components/Avatars";
import { Card, SectionLabel, ScreenShell, TabScreenHeader } from "@components/index";
import { ContextualTutorial } from "@shared/components/ContextualTutorial";
import { Person, RelationType, RootStackParamList } from "../../types";
import { getRelationshipStageLabel } from "@utils/relationshipLabels";
import { getInteraction, enrichPersonProfile } from "@engine/peopleEngine";
import { formatCurrency } from "@utils/currency";
import { NPCProfileSheet } from "@components/NPCProfileSheet";
import { isRelationshipDrifting } from "@engine/relationshipEngine";
import Svg, { Path, Circle, Rect } from "react-native-svg";

// ─── Relationship bar ─────────────────────────────────────────────────────────
function RelBar({ score }: { score: number }) {
  const { colors } = useTheme();
  const color =
    score >= 70 ? colors.teal : score >= 40 ? colors.gold : colors.crimson;
  return (
    <View style={[rb.track, { backgroundColor: colors.bgCard2 }]}>
      <View
        style={[
          rb.fill,
          { width: `${score}%` as `${number}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}
const rb = StyleSheet.create({
  track: { height: 4, borderRadius: 2, overflow: "hidden", flex: 1 },
  fill: { height: "100%", borderRadius: 2 },
});

// ─── Person Row ───────────────────────────────────────────────────────────────
function PersonRow({
  person,
  onPress,
}: {
  person: Person;
  onPress: () => void;
}) {
  const { colors, fonts, spacing } = useTheme();
  const relationLabel: Record<RelationType, string> = {
    mother: "Mother",
    father: "Father",
    sibling: "Sibling",
    friend: "Friend",
    partner: "Partner",
    spouse: "Spouse",
    child: "Child",
    classmate: "Classmate",
    teacher: "Teacher",
    coworker: "Coworker",
    pet: "Pet",
  };
  const dead = !person.isAlive;

  return (
    <Pressable
      onPress={dead ? undefined : onPress}
      style={[pr.row, dead && pr.dead, { paddingVertical: spacing.md, gap: spacing.md }]}
    >
      <View style={pr.avatarWrap}>
        <NpcAvatar
          seed={person.avatarSeed}
          gender={person.gender as "male" | "female"}
          size={44}
          age={person.age}
          relationType={person.relationType}
        />
        {dead && (
          <View style={pr.deadOverlay}>
            <Text style={[pr.deadText, { color: colors.t1 }]}>†</Text>
          </View>
        )}
      </View>
      <View style={pr.info}>
        <Text
          style={[
            pr.name,
            { color: colors.t1, fontFamily: fonts.bodySemiBold },
            dead && { color: colors.t4 },
          ]}
        >
          {person.name}
        </Text>
        <Text style={[pr.sub, { color: colors.t4, fontFamily: fonts.body }]}>
          {relationLabel[person.relationType]}{" "}
          {person.age > 0 ? `· Age ${person.age}` : ""}
        </Text>
        {isRelationshipDrifting(person) && (
          <Text style={[pr.driftChip, { color: colors.crimson, fontFamily: fonts.bodySemiBold }]}>
            Drifting
          </Text>
        )}
        {person.occupation && (
          <Text style={[pr.occ, { color: colors.t4, fontFamily: fonts.body }]}>
            {person.occupation}
          </Text>
        )}
      </View>
      <View style={pr.right}>
        <Text style={[pr.score, { color: colors.t3, fontFamily: fonts.monoSemiBold }]}>
          {person.relationshipScore}
        </Text>
        {person.relationshipStage && (
          <Text style={[pr.stage, { color: colors.orchid, fontFamily: fonts.body }]}>
            {getRelationshipStageLabel(person.relationshipStage)}
          </Text>
        )}
        <RelBar score={person.relationshipScore} />
      </View>
      {!dead && (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path
            stroke={colors.t4}
            strokeWidth={2}
            strokeLinecap="round"
            d="M9 18l6-6-6-6"
          />
        </Svg>
      )}
    </Pressable>
  );
}

const pr = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  dead: { opacity: 0.45 },
  avatarWrap: { position: "relative" },
  deadOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  deadText: { fontSize: 14 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14 },
  sub: { fontSize: 11 },
  driftChip: { fontSize: 9, marginTop: 2 },
  occ: { fontSize: 10 },
  right: { width: 52, gap: 4, alignItems: "flex-end" },
  score: { fontSize: 12 },
  stage: { fontSize: 9 },
});

// ─── SVG icons for interactions ───────────────────────────────────────────────
function IconTalk() {
  const { colors } = useTheme();
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        stroke={colors.sapphire}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      />
    </Svg>
  );
}
function IconGift() {
  const { colors } = useTheme();
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect
        stroke={colors.crimson}
        strokeWidth={2}
        x="2"
        y="7"
        width="20"
        height="14"
        rx="2"
      />
      <Path
        stroke={colors.crimson}
        strokeWidth={2}
        strokeLinecap="round"
        d="M16 21V7M8 21V7"
      />
      <Path
        stroke={colors.crimson}
        strokeWidth={2}
        strokeLinecap="round"
        d="M12 7V3M12 3c0 0-4 0-4 4h8c0-4-4-4-4-4z"
      />
    </Svg>
  );
}
function IconWatch() {
  const { colors } = useTheme();
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect
        stroke={colors.orchid}
        strokeWidth={2}
        x="1"
        y="5"
        width="15"
        height="14"
        rx="2"
      />
      <Path
        stroke={colors.orchid}
        strokeWidth={2}
        strokeLinecap="round"
        d="M16 12l6-4v8l-6-4z"
      />
    </Svg>
  );
}
function IconApologize() {
  const { colors } = useTheme();
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        stroke={colors.emerald}
        strokeWidth={2}
        strokeLinecap="round"
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
      />
    </Svg>
  );
}
function IconMoney() {
  const { colors } = useTheme();
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        stroke={colors.gold}
        strokeWidth={2}
        strokeLinecap="round"
        d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
      />
    </Svg>
  );
}
function IconInsult() {
  const { colors } = useTheme();
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={colors.crimson} strokeWidth={2} />
      <Path
        stroke={colors.crimson}
        strokeWidth={2}
        strokeLinecap="round"
        d="M15 9l-6 6M9 9l6 6"
      />
    </Svg>
  );
}
function IconCut() {
  const { colors } = useTheme();
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="6" cy="6" r="3" stroke={colors.t3} strokeWidth={2} />
      <Circle cx="6" cy="18" r="3" stroke={colors.t3} strokeWidth={2} />
      <Path
        stroke={colors.t3}
        strokeWidth={2}
        strokeLinecap="round"
        d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"
      />
    </Svg>
  );
}
function IconCompliment() {
  const { colors } = useTheme();
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={colors.gold} strokeWidth={2} />
      <Path
        stroke={colors.gold}
        strokeWidth={2}
        strokeLinecap="round"
        d="M8 14s1.5 2 4 2 4-2 4-2"
      />
      <Circle cx="9" cy="9" r="1.2" fill={colors.gold} />
      <Circle cx="15" cy="9" r="1.2" fill={colors.gold} />
    </Svg>
  );
}

// ─── Interaction Sheet ────────────────────────────────────────────────────────
const INTERACTIONS = [
  {
    id: "compliment",
    label: "Compliment",
    Icon: IconCompliment,
    desc: "Say something nice",
  },
  {
    id: "conversation",
    label: "Have a Chat",
    Icon: IconTalk,
    desc: "Catch up over coffee",
  },
  { id: "gift", label: "Give a Gift", Icon: IconGift, desc: "Show you care" },
  {
    id: "movie",
    label: "Movie Night",
    Icon: IconWatch,
    desc: "Quality time together",
  },
  {
    id: "apologize",
    label: "Apologize",
    Icon: IconApologize,
    desc: "Patch things up",
  },
  {
    id: "ask_money",
    label: "Ask for Money",
    Icon: IconMoney,
    desc: "Awkward but necessary",
  },
  { id: "insult", label: "Insult", Icon: IconInsult, desc: "Lash out — risky" },
  {
    id: "cut_off",
    label: "Distance Yourself",
    Icon: IconCut,
    desc: "End the relationship",
  },
];

function InteractionSheet({
  person,
  characterAge,
  countryCode,
  bankBalance,
  onInteract,
  onClose,
}: {
  person: Person;
  characterAge: number;
  countryCode: string;
  bankBalance: number;
  onInteract: (id: string) => void;
  onClose: () => void;
}) {
  const { colors, fonts, radii, spacing } = useTheme();
  const onCooldown = person.lastInteractionAge === characterAge;

  return (
    <View style={is.overlay}>
      <Pressable
        style={[is.backdrop, { backgroundColor: "rgba(15,23,42,0.60)" }]}
        onPress={onClose}
      />
      {/* Fixed height container so ScrollView can use flex:1 */}
      <View
        style={[
          is.sheet,
          {
            height: SCREEN_HEIGHT * 0.80,
            backgroundColor: colors.bgSheet,
            borderTopLeftRadius: radii.xl,
            borderTopRightRadius: radii.xl,
            borderTopWidth: 1,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Drag handle */}
        <View style={[is.handle, { backgroundColor: colors.border }]} />

        {/* Sticky header */}
        <View style={[is.header, { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm }]}>
          <NpcAvatar
            seed={person.avatarSeed}
            size={52}
            age={person.age}
            relationType={person.relationType}
            gender={person.gender as "male" | "female"}
          />
          <View style={{ flex: 1, gap: 3 }}>
            <Text
              style={[is.name, { color: colors.t1, fontFamily: fonts.displayBold }]}
              numberOfLines={1}
            >
              {person.name}
            </Text>
            <Text style={[is.sub, { color: colors.t3, fontFamily: fonts.body }]}>
              Bond: {person.relationshipScore}/100
            </Text>
            {onCooldown && (
              <Text style={[is.cooldownHint, { color: colors.crimson, fontFamily: fonts.bodySemiBold }]}>
                Already interacted this year
              </Text>
            )}
            <RelBar score={person.relationshipScore} />
          </View>
        </View>

        {/* Scrollable profile + actions — flex:1 fills remaining sheet height */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 40, gap: spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          <NPCProfileSheet person={enrichPersonProfile(person)} />

          {/* Actions grid */}
          <View style={[is.grid, { gap: spacing.sm }]}>
            {INTERACTIONS.map((i) => {
              const meta = getInteraction(i.id, countryCode);
              const chancePct = meta ? Math.round(meta.successChance * 100) : 100;
              const costLabel = meta?.bankDelta
                ? meta.bankDelta < 0
                  ? formatCurrency(Math.abs(meta.bankDelta), countryCode)
                  : `+${formatCurrency(meta.bankDelta, countryCode)}`
                : null;
              const canAfford = !meta?.bankDelta || meta.bankDelta >= 0 || bankBalance >= Math.abs(meta.bankDelta);
              return (
                <Pressable
                  key={i.id}
                  onPress={() => !onCooldown && onInteract(i.id)}
                  disabled={onCooldown}
                  style={[
                    is.btn,
                    {
                      backgroundColor: (colors as any).bgCard2 ?? colors.bgCard,
                      borderRadius: radii.md,
                      borderColor: colors.border,
                      padding: spacing.sm,
                    },
                    onCooldown && is.btnDisabled,
                  ]}
                >
                  <i.Icon />
                  <Text style={[is.btnLabel, { color: colors.t2, fontFamily: fonts.bodySemiBold }]}>
                    {i.label}
                  </Text>
                  <Text style={[is.btnDesc, { color: colors.t4, fontFamily: fonts.body }]}>
                    {i.desc}
                  </Text>
                  {costLabel ? (
                    <Text style={[is.chanceHint, { color: canAfford ? colors.teal : colors.crimson, fontFamily: fonts.monoSemiBold }]}>
                      {meta!.bankDelta! < 0 ? `−${costLabel}` : costLabel}
                    </Text>
                  ) : null}
                  {!onCooldown && chancePct < 100 && (
                    <Text style={[is.chanceHint, { color: colors.gold3 ?? "#D97706", fontFamily: fonts.monoSemiBold }]}>
                      {chancePct}% success
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const is = StyleSheet.create({
  overlay: { position: "absolute", inset: 0, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill },
  sheet: {},
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 8, marginBottom: 4 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontSize: 18 },
  sub: { fontSize: 12 },
  cooldownHint: { fontSize: 11 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  btn: { width: "22%", alignItems: "center", gap: 4, borderWidth: 1 },
  btnDisabled: { opacity: 0.4 },
  btnLabel: { fontSize: 10, textAlign: "center" },
  btnDesc: { fontSize: 9, textAlign: "center" },
  chanceHint: { fontSize: 8, textAlign: "center" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const GROUP_LABELS: Record<string, string> = {
  family: "Family",
  romantic: "Romantic",
  friends: "Friends",
  work: "Work & School",
  pets: "Pets",
};

function getGroup(rt: RelationType): string {
  if (["mother", "father", "sibling", "child"].includes(rt)) return "family";
  if (["partner", "spouse"].includes(rt)) return "romantic";
  if (["friend"].includes(rt)) return "friends";
  if (["classmate", "teacher", "coworker"].includes(rt)) return "work";
  if (rt === "pet") return "pets";
  return "friends";
}

export function PeopleScreen() {
  const { colors, fonts, spacing } = useTheme();
  const showToast = useToastStore((s) => s.showToast);
  const styles = StyleSheet.create({
    empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl ?? 32 },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      marginBottom: spacing.sm,
    },
    emptyText: { fontSize: 16 },
    emptyHint: { fontSize: 13 },
    scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.md },
    section: { gap: spacing.xs },
    divider: { height: StyleSheet.hairlineWidth, marginHorizontal: spacing.md },
  });

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore((s) => s.character);
  const interactWithPerson = useGameStore((s) => s.interactWithPerson);
  const [selected, setSelected] = useState<Person | null>(null);

  const handlePersonPress = (person: Person) => {
    if (!person.isAlive) return;
    if (person.relationType === "pet") {
      navigation.navigate("PetCare", { personId: person.id });
      return;
    }
    setSelected(person);
  };

  if (!character) return null;

  const { people } = character;

  if (people.length === 0) {
    return (
      <ScreenShell>
        <TabScreenHeader
          title="People"
          subtitle="The people in your life"
          accent={colors.catRelationship}
        />
        <View style={[styles.empty, { gap: spacing.md }]}>
            <View
              style={[
                styles.emptyIconWrap,
                {
                  backgroundColor: colors.bg2,
                  borderColor: colors.border,
                },
              ]}
            >
              <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                <Circle cx="9" cy="7" r="4" stroke={colors.t4} strokeWidth={1.5} />
                <Path
                  stroke={colors.t4}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                />
              </Svg>
            </View>
            <Text style={[styles.emptyText, { color: colors.t3, fontFamily: fonts.bodySemiBold }]}>
              No one in your life yet.
            </Text>
            <Text style={[styles.emptyHint, { color: colors.t4, fontFamily: fonts.body }]}>
              Age up to meet people.
            </Text>
          </View>
      </ScreenShell>
    );
  }

  const grouped = people.reduce<Record<string, Person[]>>((acc, p) => {
    const key = getGroup(p.relationType);
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const handleInteract = (interactionId: string) => {
    if (!selected) return;
    const result = interactWithPerson(selected.id, interactionId);
    showToast(`${selected.name}: ${result.message}`, result.delta >= 0 ? "success" : "error");
    setSelected(null);
  };

  return (
    <ScreenShell>
      <TabScreenHeader
        title="People"
        subtitle={`${people.filter((p) => p.isAlive).length} people in your life`}
        accent={colors.catRelationship}
      />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(grouped).map(([group, persons]) => (
            <View key={group} style={styles.section}>
              <SectionLabel label={GROUP_LABELS[group] ?? group} />
              <Card style={{ gap: 0 }}>
                {persons.map((person, i) => (
                  <View key={person.id}>
                    {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                    <PersonRow
                      person={person}
                      onPress={() => handlePersonPress(person)}
                    />
                  </View>
                ))}
              </Card>
            </View>
          ))}
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>

      {selected && (() => {
        const livePerson =
          people.find((p) => p.id === selected.id) ?? selected;
        return (
          <InteractionSheet
            person={livePerson}
            characterAge={character.age}
            countryCode={character.countryCode}
            bankBalance={character.bankBalance}
            onInteract={handleInteract}
            onClose={() => setSelected(null)}
          />
        );
      })()}
      <ContextualTutorial screenId="people" />
    </ScreenShell>
  );
}

