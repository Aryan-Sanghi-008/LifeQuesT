import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '@constants/theme';
import { StatBar } from '@components/StatBar';
import type { Person } from '@/types';
import { getRelationshipStageLabel } from '@utils/relationshipLabels';

interface NPCProfileSheetProps {
  person: Person;
}

export function NPCProfileSheet({ person }: NPCProfileSheetProps) {
  const personality = person.personality;

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{person.name}</Text>
      <Text style={styles.sub}>
        {person.relationType} · Age {person.age}
        {person.relationshipStage ? ` · ${getRelationshipStageLabel(person.relationshipStage)}` : ''}
      </Text>

      <View style={styles.block}>
        <Text style={styles.label}>Relationship</Text>
        <StatBar value={person.relationshipScore} color={COLORS.teal} height={6} />
        <Text style={styles.value}>{person.relationshipScore}/100</Text>
      </View>

      {person.mood && (
        <View style={styles.block}>
          <Text style={styles.label}>Mood</Text>
          <Text style={styles.value}>{person.mood}</Text>
        </View>
      )}

      {person.goals && person.goals.length > 0 && (
        <View style={styles.block}>
          <Text style={styles.label}>Goals</Text>
          <Text style={styles.value}>{person.goals.join(' · ')}</Text>
        </View>
      )}

      {person.occupation && (
        <View style={styles.block}>
          <Text style={styles.label}>Occupation</Text>
          <Text style={styles.value}>{person.occupation}</Text>
        </View>
      )}

      {personality && (
        <View style={styles.block}>
          <Text style={styles.label}>Personality</Text>
          <View style={styles.traitBars}>
            <View style={styles.traitRow}>
              <Text style={styles.traitLabel}>Openness</Text>
              <StatBar value={personality.openness} color={COLORS.sapphire} height={5} />
            </View>
            <View style={styles.traitRow}>
              <Text style={styles.traitLabel}>Conscientiousness</Text>
              <StatBar value={personality.conscientiousness} color={COLORS.emerald} height={5} />
            </View>
            <View style={styles.traitRow}>
              <Text style={styles.traitLabel}>Extraversion</Text>
              <StatBar value={personality.extraversion} color={COLORS.gold} height={5} />
            </View>
            <View style={styles.traitRow}>
              <Text style={styles.traitLabel}>Agreeableness</Text>
              <StatBar value={personality.agreeableness} color={COLORS.teal} height={5} />
            </View>
            <View style={styles.traitRow}>
              <Text style={styles.traitLabel}>Neuroticism</Text>
              <StatBar value={personality.neuroticism} color={COLORS.orchid} height={5} />
            </View>
          </View>
        </View>
      )}

      {(person.memoriesOfPlayer?.length ?? 0) > 0 && (
        <View style={styles.block}>
          <Text style={styles.label}>Remembers about you</Text>
          {person.memoriesOfPlayer!.slice(-3).map(m => (
            <Text key={`${m.age}-${m.text}`} style={styles.memory}>
              Age {m.age}: {m.text}
            </Text>
          ))}
        </View>
      )}

      {(person.discoveredSecrets?.length ?? 0) > 0 && (
        <View style={styles.block}>
          <Text style={styles.label}>Secrets discovered</Text>
          <Text style={styles.value}>{person.discoveredSecrets!.join(', ')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: SPACING.md, gap: SPACING.sm },
  heading: { fontFamily: FONTS.bodyBold, fontSize: 18, color: COLORS.t1 },
  sub: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3, marginBottom: SPACING.sm },
  block: { marginTop: SPACING.xs },
  label: { fontFamily: FONTS.bodyBold, fontSize: 11, color: COLORS.t4, textTransform: 'uppercase', letterSpacing: 0.6 },
  value: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t2, marginTop: 2 },
  memory: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3, marginTop: 2 },
  traitBars: { gap: 6, marginTop: 4 },
  traitRow: { gap: 2 },
  traitLabel: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4 },
});
