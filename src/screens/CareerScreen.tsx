import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';
import { useGameStore } from '../store/gameStore';
import { NpcAvatar } from '../components/Avatars';
import { Card, StatBar, SectionLabel, Badge } from '../components/index';
import { getEligibleCareers, checkCareerEligibility, getCountrySalary } from '../engine/careerEngine';
import { resolveEducationLevelForDisplay } from '../engine/educationEngine';
import { listPursuableCertifications, getCertificationLabel } from '../engine/certificationEngine';
import { CAREER_PATHS } from '../data/careerPaths';
import { formatCurrency } from '../utils/currency';
import Svg, { Path, Rect } from 'react-native-svg';

const EDU_ICONS: Record<string, React.ReactNode> = {
  none:        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.t4} strokeWidth={2} strokeLinecap="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>,
  elementary:  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.sapphire} strokeWidth={2} strokeLinecap="round" d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><Path stroke={COLORS.sapphire} strokeWidth={2} strokeLinecap="round" d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></Svg>,
  secondary:   <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.catCareer} strokeWidth={2} strokeLinecap="round" d="M12 14l9-5-9-5-9 5 9 5z"/></Svg>,
  university:  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.orchid} strokeWidth={2} strokeLinecap="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><Path stroke={COLORS.orchid} strokeWidth={2} d="M9 22V12h6v10"/></Svg>,
  graduate:    <Svg width={16} height={16} viewBox="0 0 24 24" fill={COLORS.gold}><Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></Svg>,
};

const EDU_COLORS: Record<string, string> = {
  none: COLORS.t4, elementary: COLORS.sapphire, secondary: COLORS.catCareer,
  university: COLORS.orchid, graduate: COLORS.gold,
};

function EducationTrack({ current }: { current: string; countryCode: string }) {
  const EDU_LEVELS = [
    { id: 'none',       label: 'No Education' },
    { id: 'elementary', label: 'Elementary School' },
    { id: 'secondary',  label: 'Secondary School' },
    { id: 'university', label: 'University' },
    { id: 'graduate',   label: 'Graduate' },
  ];
  const currentIdx = EDU_LEVELS.findIndex(l => l.id === current);

  return (
    <Card style={{ gap: SPACING.sm }}>
      <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.t4, letterSpacing: 2 }}>EDUCATION PATH</Text>
      {EDU_LEVELS.map((level, i) => {
        const done   = i < currentIdx;
        const active = i === currentIdx;
        const color  = done ? COLORS.emerald : active ? (EDU_COLORS[level.id] ?? COLORS.sapphire) : COLORS.t4;
        return (
          <View key={level.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
              <View style={[{ width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, { backgroundColor: `${color}14` }]}>
                {done
                  ? <Svg width={14} height={14} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.emerald} strokeWidth={2.5} strokeLinecap="round" d="M20 6L9 17l-5-5"/></Svg>
                  : EDU_ICONS[level.id]}
              </View>
              <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 14, flex: 1, color }}>
                {level.label}
              </Text>
              {active && <Badge label="Current" color={color} />}
            </View>
            {i < EDU_LEVELS.length - 1 && <View style={{ height: 1, backgroundColor: COLORS.border, marginLeft: 46, marginTop: 6 }} />}
          </View>
        );
      })}
    </Card>
  );
}

function JobPanel() {
  const character       = useGameStore(s => s.character);
  const workHarder      = useGameStore(s => s.workHarder);
  const askForRaise     = useGameStore(s => s.askForRaise);
  const quitJob         = useGameStore(s => s.quitJob);
  const applyForPromotion = useGameStore(s => s.applyForPromotion);

  if (!character) return null;
  const { career, job } = character;
  const cc = character.countryCode ?? 'IN';
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
  const perfColor = career.performance >= 70 ? COLORS.emerald : career.performance >= 40 ? COLORS.gold : COLORS.health;
  const salaryStr = formatCurrency(career.salary, cc);

  return (
    <Card style={{ gap: SPACING.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 16, color: COLORS.t1 }}>{career.title}</Text>
          <Text style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3, marginTop: 2 }}>{career.company}</Text>
        </View>
        <View style={[styles.salaryBadge, { backgroundColor: `${COLORS.wealth}12`, borderColor: `${COLORS.wealth}28` }]}>
          <Text style={{ fontFamily: FONTS.monoSemiBold, fontSize: 13, color: COLORS.wealth }}>{salaryStr}/yr</Text>
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 }}>Performance</Text>
          <Text style={{ fontFamily: FONTS.monoSemiBold, fontSize: 11, color: perfColor }}>{career.performance}%</Text>
        </View>
        <StatBar value={career.performance} color={perfColor} height={6} />
      </View>
      <View style={{ flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' }}>
        {[
          { label: 'Work Harder', action: workHarder, color: COLORS.emerald },
          { label: 'Ask Raise', action: () => { const r = askForRaise(); Alert.alert(r.success ? 'Raise!' : 'Denied', r.message); }, color: COLORS.gold },
          { label: 'Promotion', action: () => { const r = applyForPromotion(); Alert.alert(r.success ? 'Promoted' : 'Denied', r.message); }, color: COLORS.sapphire },
          { label: 'Quit', action: () => Alert.alert('Quit?', 'Leave your job?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Quit', style: 'destructive', onPress: quitJob }]), color: COLORS.crimson },
        ].map(btn => (
          <Pressable key={btn.label} onPress={btn.action} style={[styles.btn, { borderColor: btn.color, backgroundColor: `${btn.color}0D` }]}>
            <Text style={[styles.btnText, { color: btn.color }]}>{btn.label}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

function ClassRoster() {
  const getClassmatesFn = useGameStore(s => s.getClassmates);
  const classmates = getClassmatesFn();

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

function CertExamsPanel() {
  const character = useGameStore(s => s.character);
  const takeCertificationExam = useGameStore(s => s.takeCertificationExam);
  if (!character || character.age < 18) return null;

  const pursuable = listPursuableCertifications(character);
  if (pursuable.length === 0) return null;

  const cc = character.countryCode ?? 'IN';

  return (
    <Card style={{ gap: SPACING.sm }}>
      <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.t4, letterSpacing: 2 }}>
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
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Take Exam',
                  onPress: () => {
                    const r = takeCertificationExam(cert.id);
                    Alert.alert(r.ok ? 'Passed!' : 'Failed', r.message);
                  },
                },
              ],
            );
          }}
          style={[styles.jobRow, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.border }]}
        >
          <View style={[styles.jobIcon, { backgroundColor: `${COLORS.orchid}12` }]}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path stroke={COLORS.orchid} strokeWidth={2} strokeLinecap="round" d="M12 14l9-5-9-5-9 5 9 5z"/>
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t1 }}>{cert.label}</Text>
            <Text style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 }}>
              Fee: {formatCurrency(eligibility.cost, cc)}
            </Text>
          </View>
        </Pressable>
      ))}
      {(character.certificationIds ?? []).length > 0 && (
        <View style={{ marginTop: SPACING.sm, gap: 4 }}>
          <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.t4, letterSpacing: 1 }}>EARNED</Text>
          <Text style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.emerald }}>
            {(character.certificationIds ?? []).map(getCertificationLabel).join(' · ')}
          </Text>
        </View>
      )}
    </Card>
  );
}

function JobBoard() {
  const applyForJob = useGameStore(s => s.applyForJob);
  const character   = useGameStore(s => s.character);
  if (!character || character.age < 16) return null;
  const countryCode = character.countryCode ?? 'IN';

  const eligible = getEligibleCareers(character).slice(0, 8);

  return (
    <Card style={{ gap: SPACING.sm }}>
      <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.t4, letterSpacing: 2 }}>AVAILABLE CAREERS</Text>
      {eligible.length === 0 ? (
        <Text style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.t4 }}>
          No careers available yet. Finish school or meet requirements below.
        </Text>
      ) : (
        eligible.map(({ career, eligibility }, i) => {
          const localSalary = getCountrySalary(career.baseSalary, countryCode);
          const probColor = eligibility.hireProbability >= 70 ? COLORS.emerald
            : eligibility.hireProbability >= 40 ? COLORS.gold : COLORS.crimson;
          return (
            <Pressable
              key={career.id}
              onPress={() => {
                const r = applyForJob(career.id);
                Alert.alert(r.success ? 'Hired!' : 'Not This Time', r.message);
              }}
              style={[styles.jobRow, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.border }]}
            >
              <View style={[styles.jobIcon, { backgroundColor: `${COLORS.catCareer}12` }]}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Rect stroke={COLORS.catCareer} strokeWidth={2} x="2" y="7" width="20" height="14" rx="2"/>
                  <Path stroke={COLORS.catCareer} strokeWidth={2} strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t1 }}>{career.label}</Text>
                <Text style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 }}>{career.company}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <View style={{ width: 40, height: 3, backgroundColor: COLORS.bg2, borderRadius: 2, overflow: 'hidden' }}>
                    <View style={{ width: `${eligibility.hireProbability}%` as `${number}%`, height: '100%', backgroundColor: probColor, borderRadius: 2 }} />
                  </View>
                  <Text style={{ fontFamily: FONTS.monoSemiBold, fontSize: 9, color: probColor }}>{eligibility.hireProbability}%</Text>
                </View>
              </View>
              <View style={[styles.salaryBadge, { backgroundColor: `${COLORS.wealth}12`, borderColor: `${COLORS.wealth}25` }]}>
                <Text style={{ fontFamily: FONTS.monoSemiBold, fontSize: 12, color: COLORS.wealth }}>
                  {formatCurrency(localSalary, countryCode)}/yr
                </Text>
              </View>
            </Pressable>
          );
        })
      )}
      {(() => {
        const locked = CAREER_PATHS
          .filter(c => c.isEntryLevel && !eligible.find(e => e.career.id === c.id))
          .slice(0, 3);
        if (locked.length === 0) return null;
        return (
          <>
            <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.t4, letterSpacing: 2, marginTop: SPACING.sm }}>LOCKED (REQUIREMENTS NOT MET)</Text>
            {locked.map((career, i) => {
              const check = checkCareerEligibility(character, career.id);
              return (
                <View key={career.id} style={[styles.jobRow, { opacity: 0.4 }, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
                  <View style={[styles.jobIcon, { backgroundColor: `${COLORS.t4}12` }]}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Rect stroke={COLORS.t4} strokeWidth={2} x="2" y="7" width="20" height="14" rx="2"/>
                      <Path stroke={COLORS.t4} strokeWidth={2} strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                    </Svg>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t3 }}>{career.label}</Text>
                    <Text style={{ fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4 }} numberOfLines={1}>
                      {check.reason ?? `Requires: ${career.requirements.minEducationStage}`}
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

export function CareerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore(s => s.character);
  if (!character) return null;

  const inSchool = character.age >= 5 && character.age <= 17;
  const cc = character.countryCode ?? 'IN';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: `${COLORS.catCareer}14` }]}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Rect stroke={COLORS.catCareer} strokeWidth={2} x="2" y="7" width="20" height="14" rx="2"/>
              <Path stroke={COLORS.catCareer} strokeWidth={2} strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              <Path stroke={COLORS.catCareer} strokeWidth={2} strokeLinecap="round" d="M12 12v5M9 14.5l3-2.5 3 2.5"/>
            </Svg>
          </View>
          <Text style={styles.headerTitle}>Career & School</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <SectionLabel label="Education" style={{ marginBottom: SPACING.md }} />
          <EducationTrack
            current={resolveEducationLevelForDisplay(character.educationStage, character.educationLevel)}
            countryCode={cc}
          />
          {character.age >= 13 && character.age <= 24 && character.educationLevel !== 'graduate' && (
            <Pressable
              style={[styles.btn, { borderColor: COLORS.sapphire, marginTop: SPACING.md }]}
              onPress={() => navigation.navigate('Study')}
              accessibilityLabel="Start study session"
            >
              <Text style={[styles.btnText, { color: COLORS.sapphire }]}>Study Session</Text>
            </Pressable>
          )}
          <SectionLabel label={inSchool ? 'School Life' : 'Career'} style={{ marginTop: SPACING.xl, marginBottom: SPACING.md }} />
          {inSchool ? <ClassRoster /> : <JobPanel />}
          {!inSchool && character.age >= 16 && (
            <>
              <SectionLabel label="Job Board" style={{ marginTop: SPACING.xl, marginBottom: SPACING.md }} />
              <JobBoard />
              <CertExamsPanel />
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
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerIcon: { width: 38, height: 38, borderRadius: RADII.sm, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.bodyBold, fontSize: 20, color: COLORS.t1 },
  scroll: { padding: SPACING.lg },
  btn: { paddingHorizontal: SPACING.md, paddingVertical: 9, borderRadius: RADII.sm, borderWidth: 1.5 },
  btnText: { fontFamily: FONTS.bodySemiBold, fontSize: 12 },
  jobRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.sm },
  jobIcon: { width: 34, height: 34, borderRadius: RADII.xs, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  salaryBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADII.sm, borderWidth: 1 },
});
