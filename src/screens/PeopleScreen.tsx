import { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';
import { useGameStore } from '../store/gameStore';
import { NpcAvatar } from '../components/Avatars';
import { Card, SectionLabel } from '../components/index';
import { Person, RelationType } from '../types';
import Svg, { Path } from 'react-native-svg';

// ─── Relationship bar ─────────────────────────────────────────────────────────
function RelBar({ score }: { score: number }) {
  const color =
    score >= 70 ? COLORS.teal :
    score >= 40 ? COLORS.gold :
    COLORS.crimson;
  return (
    <View style={rb.track}>
      <View style={[rb.fill, { width: `${score}%` as `${number}%`, backgroundColor: color }]} />
    </View>
  );
}
const rb = StyleSheet.create({
  track: { height: 4, backgroundColor: COLORS.bgCard2, borderRadius: 2, overflow: 'hidden', flex: 1 },
  fill:  { height: '100%', borderRadius: 2 },
});

// ─── Person Row ───────────────────────────────────────────────────────────────
function PersonRow({ person, onPress }: { person: Person; onPress: () => void }) {
  const relationLabel: Record<RelationType, string> = {
    mother: 'Mother', father: 'Father', sibling: 'Sibling',
    friend: 'Friend', partner: 'Partner', spouse: 'Spouse',
    child: 'Child', classmate: 'Classmate', teacher: 'Teacher',
    coworker: 'Coworker', pet: 'Pet',
  };
  const dead = !person.isAlive;

  return (
    <Pressable onPress={dead ? undefined : onPress} style={[pr.row, dead && pr.dead]}>
      <View style={pr.avatarWrap}>
        <NpcAvatar seed={person.avatarSeed} gender={person.gender as 'male' | 'female'} size={44} age={person.age} />
        {dead && <View style={pr.deadOverlay}><Text style={pr.deadText}>†</Text></View>}
      </View>
      <View style={pr.info}>
        <Text style={[pr.name, dead && { color: COLORS.t4 }]}>{person.name}</Text>
        <Text style={pr.sub}>{relationLabel[person.relationType]} {person.age > 0 ? `· Age ${person.age}` : ''}</Text>
        {person.occupation && <Text style={pr.occ}>{person.occupation}</Text>}
      </View>
      <View style={pr.right}>
        <Text style={pr.score}>{person.relationshipScore}</Text>
        <RelBar score={person.relationshipScore} />
      </View>
      {!dead && (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path stroke={COLORS.t4} strokeWidth={2} strokeLinecap="round" d="M9 18l6-6-6-6" />
        </Svg>
      )}
    </Pressable>
  );
}

const pr = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md },
  dead:       { opacity: 0.45 },
  avatarWrap: { position: 'relative' },
  deadOverlay:{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  deadText:   { color: COLORS.t1, fontSize: 14 },
  info:       { flex: 1, gap: 2 },
  name:       { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t1 },
  sub:        { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 },
  occ:        { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4 },
  right:      { width: 52, gap: 4, alignItems: 'flex-end' },
  score:      { fontFamily: FONTS.monoSemiBold, fontSize: 12, color: COLORS.t3 },
});

// ─── Interaction Sheet ────────────────────────────────────────────────────────
const INTERACTIONS = [
  { id: 'compliment',   label: 'Compliment',     icon: '😊', desc: 'Say something nice' },
  { id: 'conversation', label: 'Have a Chat',     icon: '💬', desc: 'Catch up over coffee' },
  { id: 'gift',         label: 'Give a Gift',     icon: '🎁', desc: 'Show you care' },
  { id: 'movie',        label: 'Movie Night',     icon: '🎬', desc: 'Quality time together' },
  { id: 'apologize',    label: 'Apologize',       icon: '🙏', desc: 'Patch things up' },
  { id: 'ask_money',    label: 'Ask for Money',   icon: '💰', desc: 'Awkward but necessary' },
  { id: 'insult',       label: 'Insult',          icon: '😤', desc: 'Lash out — risky' },
  { id: 'cut_off',      label: 'Distance Yourself', icon: '✂️', desc: 'End the relationship' },
];

function InteractionSheet({
  person,
  onInteract,
  onClose,
}: {
  person: Person;
  onInteract: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <View style={is.overlay}>
      <Pressable style={is.backdrop} onPress={onClose} />
      <View style={is.sheet}>
        {/* Header */}
        <View style={is.header}>
          <NpcAvatar seed={person.avatarSeed} size={52} age={person.age} />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={is.name}>{person.name}</Text>
            <Text style={is.sub}>Relationship: {person.relationshipScore}/100</Text>
            <RelBar score={person.relationshipScore} />
          </View>
        </View>

        {/* Actions grid */}
        <View style={is.grid}>
          {INTERACTIONS.map(i => (
            <Pressable key={i.id} onPress={() => onInteract(i.id)} style={is.btn}>
              <Text style={is.btnIcon}>{i.icon}</Text>
              <Text style={is.btnLabel}>{i.label}</Text>
              <Text style={is.btnDesc}>{i.desc}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const is = StyleSheet.create({
  overlay:  { position: 'absolute', inset: 0, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:    { backgroundColor: COLORS.bg2, borderTopLeftRadius: RADII.xl, borderTopRightRadius: RADII.xl, padding: SPACING.xl, gap: SPACING.lg },
  header:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  name:     { fontFamily: FONTS.displayBold, fontSize: 18, color: COLORS.t1 },
  sub:      { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3 },
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  btn:      { width: '22%', alignItems: 'center', gap: 4, padding: SPACING.sm, backgroundColor: COLORS.bgCard, borderRadius: RADII.md, borderWidth: 1, borderColor: COLORS.border },
  btnIcon:  { fontSize: 22 },
  btnLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.t2, textAlign: 'center' },
  btnDesc:  { fontFamily: FONTS.body, fontSize: 9, color: COLORS.t4, textAlign: 'center' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const GROUP_LABELS: Record<string, string> = {
  family:    'Family',
  romantic:  'Romantic',
  friends:   'Friends',
  work:      'Work & School',
  pets:      'Pets',
};

function getGroup(rt: RelationType): string {
  if (['mother','father','sibling','child'].includes(rt)) return 'family';
  if (['partner','spouse'].includes(rt)) return 'romantic';
  if (['friend'].includes(rt)) return 'friends';
  if (['classmate','teacher','coworker'].includes(rt)) return 'work';
  if (rt === 'pet') return 'pets';
  return 'friends';
}

export function PeopleScreen() {
  const character       = useGameStore(s => s.character);
  const interactWithPerson = useGameStore(s => s.interactWithPerson);
  const [selected, setSelected] = useState<Person | null>(null);

  if (!character) return null;

  const { people } = character;

  if (people.length === 0) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>People</Text>
            <Text style={styles.headerSub}>The people in your life</Text>
          </View>
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No one in your life yet.</Text>
            <Text style={styles.emptyHint}>Age up to meet people.</Text>
          </View>
        </SafeAreaView>
      </View>
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
    Alert.alert(selected.name, result.message);
    setSelected(null);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LinearGradient colors={[COLORS.bg2, COLORS.bg]} style={styles.headerBar}>
          <Text style={styles.headerTitle}>People</Text>
          <Text style={styles.headerSub}>{people.filter(p => p.isAlive).length} people in your life</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {Object.entries(grouped).map(([group, persons]) => (
            <View key={group} style={styles.section}>
              <SectionLabel label={GROUP_LABELS[group] ?? group} />
              <Card style={{ gap: 0 }}>
                {persons.map((person, i) => (
                  <View key={person.id}>
                    {i > 0 && <View style={styles.divider} />}
                    <PersonRow person={person} onPress={() => setSelected(person)} />
                  </View>
                ))}
              </Card>
            </View>
          ))}
          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>

      {selected && (
        <InteractionSheet
          person={selected}
          onInteract={handleInteract}
          onClose={() => setSelected(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.bg },
  safe:    { flex: 1 },
  headerBar: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontFamily: FONTS.displayBold, fontSize: 22, color: COLORS.t1 },
  headerSub: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3, marginTop: 2 },
  scroll:  { padding: SPACING.lg },
  section: { marginBottom: SPACING.xl },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },
  empty:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.t3 },
  emptyHint: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t4 },
});
