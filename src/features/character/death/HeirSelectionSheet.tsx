import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { Character } from '@/types';

interface Props {
  character: Character;
  onSelectHeir: (personId: string) => void;
}

export function HeirSelectionSheet({ character, onSelectHeir }: Props) {
  const { colors, fonts, radii, spacing } = useTheme();
  const heirs = (character.people ?? []).filter(
    (p) => p.relationType === 'child' && p.isAlive !== false,
  );

  if (heirs.length === 0) return null;

  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={{ color: colors.t3, fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2 }}>
        CHOOSE YOUR HEIR
      </Text>
      <FlatList
        horizontal
        data={heirs}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelectHeir(item.id)}
            style={[styles.card, {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
              borderRadius: radii.md,
            }]}
          >
            <View style={[styles.avatar, { backgroundColor: `${colors.sapphire}20` }]}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
            <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>{item.name}</Text>
            <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 11 }}>Child</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 110, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
