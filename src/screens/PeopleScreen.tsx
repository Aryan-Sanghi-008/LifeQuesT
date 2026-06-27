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
import { getRelationshipStageLabel } from '@utils/relationshipLabels';
import { getInteraction } from '@engine/peopleEngine';
import { isRelationshipDrifting } from '@engine/relationshipEngine';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

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
        <NpcAvatar seed={person.avatarSeed} gender={person.gender as 'male' | 'female'} size={44} age={person.age} relationType={person.relationType} />
        {dead && <View style={pr.deadOverlay}><Text style={pr.deadText}>†</Text></View>}
      </View>
      <View style={pr.info}>
        <Text style={[pr.name, dead && { color: COLORS.t4 }]}>{person.name}</Text>
        <Text style={pr.sub}>{relationLabel[person.relationType]} {person.age > 0 ? `· Age ${person.age}` : ''}</Text>
        {isRelationshipDrifting(person) && (
          <Text style={pr.driftChip}>Drifting</Text>
        )}
        {person.occupation && <Text style={pr.occ}>{person.occupation}</Text>}
      </View>
      <View style={pr.right}>
        <Text style={pr.score}>{person.relationshipScore}</Text>
        {person.relationshipStage && (
          <Text style={pr.stage}>{getRelationshipStageLabel(person.relationshipStage)}</Text>
        )}
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
  driftChip:  { fontFamily: FONTS.bodySemiBold, fontSize: 9, color: COLORS.crimson, marginTop: 2 },
  occ:        { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4 },
  right:      { width: 52, gap: 4, alignItems: 'flex-end' },
  score:      { fontFamily: FONTS.monoSemiBold, fontSize: 12, color: COLORS.t3 },
  stage:      { fontFamily: FONTS.body, fontSize: 9, color: COLORS.orchid },
});

// ─── SVG icons for interactions ───────────────────────────────────────────────
function IconTalk()    { return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.sapphire} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></Svg>; }
function IconGift()    { return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Rect stroke={COLORS.crimson} strokeWidth={2} x="2" y="7" width="20" height="14" rx="2"/><Path stroke={COLORS.crimson} strokeWidth={2} strokeLinecap="round" d="M16 21V7M8 21V7"/><Path stroke={COLORS.crimson} strokeWidth={2} strokeLinecap="round" d="M12 7V3M12 3c0 0-4 0-4 4h8c0-4-4-4-4-4z"/></Svg>; }
function IconWatch()   { return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Rect stroke={COLORS.orchid} strokeWidth={2} x="1" y="5" width="15" height="14" rx="2"/><Path stroke={COLORS.orchid} strokeWidth={2} strokeLinecap="round" d="M16 12l6-4v8l-6-4z"/></Svg>; }
function IconApologize(){ return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.emerald} strokeWidth={2} strokeLinecap="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></Svg>; }
function IconMoney()   { return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.gold} strokeWidth={2} strokeLinecap="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></Svg>; }
function IconInsult()  { return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Circle stroke={COLORS.crimson} strokeWidth={2} cx="12" cy="12" r="10"/><Path stroke={COLORS.crimson} strokeWidth={2} strokeLinecap="round" d="M15 9l-6 6M9 9l6 6"/></Svg>; }
function IconCut()     { return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Circle stroke={COLORS.t3} strokeWidth={2} cx="6" cy="6" r="3"/><Circle stroke={COLORS.t3} strokeWidth={2} cx="6" cy="18" r="3"/><Path stroke={COLORS.t3} strokeWidth={2} strokeLinecap="round" d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/></Svg>; }
function IconCompliment(){ return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Circle stroke={COLORS.gold} strokeWidth={2} cx="12" cy="12" r="10"/><Path stroke={COLORS.gold} strokeWidth={2} strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2"/><Circle cx="9" cy="9" r="1.2" fill={COLORS.gold}/><Circle cx="15" cy="9" r="1.2" fill={COLORS.gold}/></Svg>; }

// ─── Interaction Sheet ────────────────────────────────────────────────────────
const INTERACTIONS = [
  { id: 'compliment',   label: 'Compliment',       Icon: IconCompliment, desc: 'Say something nice' },
  { id: 'conversation', label: 'Have a Chat',       Icon: IconTalk,       desc: 'Catch up over coffee' },
  { id: 'gift',         label: 'Give a Gift',       Icon: IconGift,       desc: 'Show you care' },
  { id: 'movie',        label: 'Movie Night',       Icon: IconWatch,      desc: 'Quality time together' },
  { id: 'apologize',    label: 'Apologize',         Icon: IconApologize,  desc: 'Patch things up' },
  { id: 'ask_money',    label: 'Ask for Money',     Icon: IconMoney,      desc: 'Awkward but necessary' },
  { id: 'insult',       label: 'Insult',            Icon: IconInsult,     desc: 'Lash out — risky' },
  { id: 'cut_off',      label: 'Distance Yourself', Icon: IconCut,        desc: 'End the relationship' },
];

function InteractionSheet({
  person,
  characterAge,
  onInteract,
  onClose,
}: {
  person: Person;
  characterAge: number;
  onInteract: (id: string) => void;
  onClose: () => void;
}) {
  const onCooldown = person.lastInteractionAge === characterAge;

  return (
    <View style={is.overlay}>
      <Pressable style={is.backdrop} onPress={onClose} />
      <View style={is.sheet}>
        {/* Header */}
        <View style={is.header}>
          <NpcAvatar seed={person.avatarSeed} size={52} age={person.age} relationType={person.relationType} gender={person.gender as 'male' | 'female'} />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={is.name}>{person.name}</Text>
            <Text style={is.sub}>Relationship: {person.relationshipScore}/100</Text>
            {onCooldown && (
              <Text style={is.cooldownHint}>Already interacted this year</Text>
            )}
            <RelBar score={person.relationshipScore} />
          </View>
        </View>

        {/* Actions grid */}
        <View style={is.grid}>
          {INTERACTIONS.map(i => {
            const meta = getInteraction(i.id);
            const chancePct = meta ? Math.round(meta.successChance * 100) : 100;
            return (
            <Pressable
              key={i.id}
              onPress={() => !onCooldown && onInteract(i.id)}
              disabled={onCooldown}
              style={[is.btn, onCooldown && is.btnDisabled]}
            >
              <i.Icon />
              <Text style={is.btnLabel}>{i.label}</Text>
              <Text style={is.btnDesc}>{i.desc}</Text>
              {!onCooldown && chancePct < 100 && (
                <Text style={is.chanceHint}>{chancePct}% success</Text>
              )}
            </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const is = StyleSheet.create({
  overlay:  { position: 'absolute', inset: 0, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15,23,42,0.50)' },
  sheet:    { backgroundColor: COLORS.bgSheet, borderTopLeftRadius: RADII.xl, borderTopRightRadius: RADII.xl, padding: SPACING.xl, gap: SPACING.lg },
  header:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  name:     { fontFamily: FONTS.displayBold, fontSize: 18, color: COLORS.t1 },
  sub:      { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3 },
  cooldownHint: { fontFamily: FONTS.bodySemiBold, fontSize: 11, color: COLORS.crimson },
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  btn:      { width: '22%', alignItems: 'center', gap: 4, padding: SPACING.sm, backgroundColor: COLORS.bgCard2, borderRadius: RADII.md, borderWidth: 1, borderColor: COLORS.border },
  btnDisabled: { opacity: 0.4 },
  btnLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.t2, textAlign: 'center' },
  btnDesc:  { fontFamily: FONTS.body, fontSize: 9, color: COLORS.t4, textAlign: 'center' },
  chanceHint: { fontFamily: FONTS.monoSemiBold, fontSize: 8, color: COLORS.gold3, textAlign: 'center' },
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
            <View style={styles.emptyIconWrap}>
              <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                <Circle stroke={COLORS.t4} strokeWidth={1.5} cx="9" cy="7" r="4"/>
                <Path stroke={COLORS.t4} strokeWidth={1.5} strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </Svg>
            </View>
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

      {selected && (() => {
        const livePerson = people.find(p => p.id === selected.id) ?? selected;
        return (
        <InteractionSheet
          person={livePerson}
          characterAge={character.age}
          onInteract={handleInteract}
          onClose={() => setSelected(null)}
        />
        );
      })()}
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
  emptyIconWrap: { width: 72, height: 72, borderRadius: 22, backgroundColor: COLORS.bg2, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.t3 },
  emptyHint: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t4 },
});
