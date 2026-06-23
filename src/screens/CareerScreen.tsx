import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';
import { useGameStore } from '../store/gameStore';
import { NpcAvatar } from '../components/Avatars';
import { Card, StatBar, SectionLabel, Badge } from '../components/index';
import { getClassmates } from '../engine/peopleEngine';
import { JOBS } from '../data/gameData';

function EducationTrack({ current }: { current: string }) {
  const EDU_LEVELS = [
    { id: 'none', label: 'No Education', icon: '🚼' },
    { id: 'elementary', label: 'Elementary', icon: '📚' },
    { id: 'secondary', label: 'Secondary', icon: '🎒' },
    { id: 'university', label: 'University', icon: '🎓' },
    { id: 'graduate', label: 'Graduate', icon: '🏅' },
  ];
  const currentIdx = EDU_LEVELS.findIndex(l => l.id === current);

  return (
    <Card style={{ gap: SPACING.sm }}>
      <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.t4, letterSpacing: 2 }}>EDUCATION PATH</Text>
      {EDU_LEVELS.map((level, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <View key={level.id} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
            <Text style={{ fontSize: 16 }}>{done ? '✓' : level.icon}</Text>
            <Text style={{
              fontFamily: FONTS.bodySemiBold, fontSize: 14, flex: 1,
              color: done ? COLORS.teal : active ? COLORS.gold : COLORS.t4,
            }}>{level.label}</Text>
            {active && <Badge label="Current" color={COLORS.teal} />}
          </View>
        );
      })}
    </Card>
  );
}

function JobPanel() {
  const character = useGameStore(s => s.character);
  const workHarder = useGameStore(s => s.workHarder);
  const askForRaise = useGameStore(s => s.askForRaise);
  const quitJob = useGameStore(s => s.quitJob);
  const applyForPromotion = useGameStore(s => s.applyForPromotion);

  if (!character) return null;
  const { career, job } = character;
  const noJob = !career && (job === 'Unemployed' || job === 'Student');

  if (noJob) {
    return (
      <Card>
        <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t2 }}>
          {job === 'Student' ? 'Still in School' : 'Currently Unemployed'}
        </Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, marginTop: 4 }}>
          Apply for jobs below when you are ready.
        </Text>
      </Card>
    );
  }

  if (!career) return null;
  const perfColor = career.performance >= 70 ? COLORS.teal : career.performance >= 40 ? COLORS.gold : COLORS.crimson;

  return (
    <Card style={{ gap: SPACING.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 15, color: COLORS.t1 }}>{career.title}</Text>
          <Text style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3 }}>{career.company}</Text>
        </View>
        <Text style={{ fontFamily: FONTS.monoSemiBold, fontSize: 13, color: COLORS.teal }}>
          ₹{(career.salary / 1000).toFixed(0)}K/yr
        </Text>
      </View>
      <StatBar value={career.performance} color={perfColor} height={5} />
      <View style={{ flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' }}>
        {[
          { label: 'Work Harder', action: workHarder, color: COLORS.teal },
          { label: 'Ask Raise', action: () => { const r = askForRaise(); Alert.alert(r.success ? 'Raise!' : 'Denied', r.message); }, color: COLORS.gold },
          { label: 'Promotion', action: () => { const r = applyForPromotion(); Alert.alert(r.success ? 'Promoted' : 'Denied', r.message); }, color: COLORS.sapphire },
          { label: 'Quit', action: () => Alert.alert('Quit?', 'Leave your job?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Quit', style: 'destructive', onPress: quitJob }]), color: COLORS.crimson },
        ].map(btn => (
          <Pressable key={btn.label} onPress={btn.action} style={[styles.btn, { borderColor: btn.color }]}>
            <Text style={[styles.btnText, { color: btn.color }]}>{btn.label}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

function ClassRoster() {
  const people = useGameStore(s => s.character?.people ?? []);
  const classmates = getClassmates(people);

  if (classmates.length === 0) {
    return (
      <Card><Text style={{ color: COLORS.t4, fontFamily: FONTS.body, fontSize: 13 }}>No classmates yet — age up to start school.</Text></Card>
    );
  }

  return (
    <Card style={{ gap: SPACING.md }}>
      <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.t4, letterSpacing: 2 }}>YOUR CLASS</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
        {classmates.map(c => (
          <View key={c.id} style={{ width: '29%', alignItems: 'center', gap: 4 }}>
            <NpcAvatar seed={c.avatarSeed} size={40} age={c.age} gender={c.gender as 'male' | 'female'} />
            <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 11, color: COLORS.t2 }} numberOfLines={1}>{c.name.split(' ')[0]}</Text>
            <StatBar value={c.relationshipScore} color={c.relationshipScore > 50 ? COLORS.teal : COLORS.gold} height={3} />
          </View>
        ))}
      </View>
    </Card>
  );
}

function JobBoard() {
  const applyForJob = useGameStore(s => s.applyForJob);
  const character = useGameStore(s => s.character);
  if (!character || character.age < 16) return null;

  return (
    <Card style={{ gap: SPACING.sm }}>
      <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.t4, letterSpacing: 2 }}>JOB BOARD</Text>
      {JOBS.filter(j => j.id !== 'student').slice(0, 6).map(job => (
        <Pressable
          key={job.id}
          onPress={() => {
            const r = applyForJob(job.id);
            Alert.alert(r.success ? 'Hired!' : 'Rejected', r.message);
          }}
          style={styles.jobRow}
        >
          <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t1, flex: 1 }}>{job.label}</Text>
          <Text style={{ fontFamily: FONTS.monoSemiBold, fontSize: 12, color: COLORS.teal }}>₹{(job.salary / 1000).toFixed(0)}K</Text>
        </Pressable>
      ))}
    </Card>
  );
}

export function CareerScreen() {
  const character = useGameStore(s => s.character);
  if (!character) return null;

  const inSchool = character.age >= 5 && character.age <= 17;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LinearGradient colors={[COLORS.bg2, COLORS.bg]} style={styles.header}>
          <Text style={styles.headerTitle}>Career & School</Text>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.scroll}>
          <SectionLabel label="Education" style={{ marginBottom: SPACING.md }} />
          <EducationTrack current={character.educationLevel} />
          <SectionLabel label={inSchool ? 'School Life' : 'Career'} style={{ marginTop: SPACING.xl, marginBottom: SPACING.md }} />
          {inSchool ? <ClassRoster /> : <JobPanel />}
          {!inSchool && character.age >= 16 && (
            <>
              <SectionLabel label="Apply" style={{ marginTop: SPACING.xl, marginBottom: SPACING.md }} />
              <JobBoard />
            </>
          )}
          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  header: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontFamily: FONTS.displayBold, fontSize: 22, color: COLORS.t1 },
  scroll: { padding: SPACING.lg },
  btn: { paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADII.sm, borderWidth: 1.5 },
  btnText: { fontFamily: FONTS.bodySemiBold, fontSize: 12 },
  jobRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
});
