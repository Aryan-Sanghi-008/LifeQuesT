import { View, Text, StyleSheet } from 'react-native';
import { useThemedStyles, useTheme } from '@theme';
import { StatBar } from '@components/StatBar';
import type { Person } from '@/types';
import { getRelationshipStageLabel } from '@utils/relationshipLabels';

interface NPCProfileSheetProps {
  person: Person;
}

export function NPCProfileSheet({ person }: NPCProfileSheetProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
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
        <StatBar value={person.relationshipScore} color={colors.teal} height={6} />
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
              <StatBar value={personality.openness} color={colors.sapphire} height={5} />
            </View>
            <View style={styles.traitRow}>
              <Text style={styles.traitLabel}>Conscientiousness</Text>
              <StatBar value={personality.conscientiousness} color={colors.emerald} height={5} />
            </View>
            <View style={styles.traitRow}>
              <Text style={styles.traitLabel}>Extraversion</Text>
              <StatBar value={personality.extraversion} color={colors.gold} height={5} />
            </View>
            <View style={styles.traitRow}>
              <Text style={styles.traitLabel}>Agreeableness</Text>
              <StatBar value={personality.agreeableness} color={colors.teal} height={5} />
            </View>
            <View style={styles.traitRow}>
              <Text style={styles.traitLabel}>Neuroticism</Text>
              <StatBar value={personality.neuroticism} color={colors.orchid} height={5} />
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

const createStyles = ({ colors, fonts, spacing }: ReturnType<typeof useTheme>) => StyleSheet.create({
  wrap: { paddingBottom: spacing.md, gap: spacing.sm },
  heading: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.t1 },
  sub: { fontFamily: fonts.body, fontSize: 12, color: colors.t3, marginBottom: spacing.sm },
  block: { marginTop: spacing.xs },
  label: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.t4, textTransform: 'uppercase', letterSpacing: 0.6 },
  value: { fontFamily: fonts.body, fontSize: 13, color: colors.t2, marginTop: 2 },
  memory: { fontFamily: fonts.body, fontSize: 12, color: colors.t3, marginTop: 2 },
  traitBars: { gap: 6, marginTop: 4 },
  traitRow: { gap: 2 },
  traitLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.t4 },
});
