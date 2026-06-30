import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { Character } from '@/types';

interface Props {
  character: Character;
  deathAge: number;
}

export function LifeSummaryCard({ character, deathAge }: Props) {
  const { colors, fonts, radii } = useTheme();

  const careerPeak = character.educationStage ?? 'unknown paths';
  const cause = character.deathCause ?? 'natural causes';
  const famCount = (character.people ?? []).filter(
    (p) => p.relationType === 'spouse' || p.relationType === 'child',
  ).length;

  const paragraphs = [
    `${character.name} was born in ${character.birthYear}, entering the world with ${character.familyBackground === 'wealthy' ? 'privilege' : character.familyBackground === 'poor' ? 'hardship' : 'modest beginnings'}.`,
    `A life spent ${careerPeak !== 'unknown paths' ? `working as ${careerPeak}` : "navigating life's many turns"}, ${famCount > 0 ? `surrounded by ${famCount} loved one${famCount === 1 ? '' : 's'},` : 'walking many roads alone,'} and leaving traces that won't soon fade.`,
    `At age ${deathAge}, ${character.name} passed from ${cause}. The world is quieter for it.`,
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg }]}>
      <Text style={[styles.title, { color: colors.t3, fontFamily: fonts.bodyBold }]}>LIFE STORY</Text>
      {paragraphs.map((p, i) => (
        <Text key={i} style={[styles.para, { color: colors.t2, fontFamily: fonts.body }]}>
          {p}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, borderWidth: 1, gap: 12 },
  title: { fontSize: 10, letterSpacing: 2 },
  para: { fontSize: 14, lineHeight: 22 },
});
