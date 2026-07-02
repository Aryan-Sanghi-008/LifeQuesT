import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { CollectionSet } from '@/types';
import { CollectionSetIcon } from './CollectionSetIcon';

interface Props {
  collectionSet: CollectionSet | null;
  onDismiss: () => void;
}

export function CollectionSetCompleteModal({ collectionSet, onDismiss }: Props) {
  const { colors, fonts, radii, spacing } = useTheme();
  const navigation = useNavigation();

  if (!collectionSet) return null;

  const accent = collectionSet.accentColor ?? colors.sapphire;

  const handleViewGallery = () => {
    onDismiss();
    navigation.navigate('Collections' as never);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: `${accent}40`, borderRadius: radii.lg }]}>

          {/* Set icon */}
          <View style={[styles.iconWrap, { backgroundColor: `${accent}18`, borderColor: `${accent}35` }]}>
            <CollectionSetIcon setId={collectionSet.id} color={accent} size={36} />
          </View>

          <View style={{ gap: 4, alignItems: 'center' }}>
            <Text style={{ color: colors.t4, fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 1.2 }}>
              COLLECTION COMPLETE
            </Text>
            <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.displayBold }]}>
              {collectionSet.name}
            </Text>
            <Text style={[styles.description, { color: colors.t3, fontFamily: fonts.body }]}>
              {collectionSet.description}
            </Text>
          </View>

          {/* Rewards */}
          <View style={[styles.rewardBox, { backgroundColor: `${accent}10`, borderColor: `${accent}30`, borderRadius: radii.md }]}>
            <Text style={[styles.rewardLabel, { color: accent, fontFamily: fonts.bodySemiBold }]}>Rewards Granted</Text>
            <View style={styles.rewardRow}>
              <Text style={[styles.rewardValue, { color: colors.t2, fontFamily: fonts.monoSemiBold }]}>
                🪙 {collectionSet.coinReward.toLocaleString()}
              </Text>
              {(collectionSet.gemReward ?? 0) > 0 && (
                <Text style={[styles.rewardValue, { color: colors.t2, fontFamily: fonts.monoSemiBold }]}>
                  💎 {collectionSet.gemReward}
                </Text>
              )}
            </View>
            <View style={[styles.titleBadge, { backgroundColor: `${accent}20`, borderRadius: radii.xs, borderColor: `${accent}40` }]}>
              <Text style={{ color: accent, fontFamily: fonts.monoSemiBold, fontSize: 10, letterSpacing: 0.6 }}>
                TITLE: {collectionSet.titleReward.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={{ gap: spacing.sm, width: '100%' }}>
            <Pressable
              onPress={handleViewGallery}
              style={[styles.primaryBtn, { backgroundColor: accent, borderRadius: radii.md }]}
            >
              <Text style={{ color: '#FFF', fontFamily: fonts.bodyBold }}>View Gallery</Text>
            </Pressable>
            <Pressable
              onPress={onDismiss}
              style={[styles.secondaryBtn, { borderColor: colors.border, borderRadius: radii.md }]}
            >
              <Text style={{ color: colors.t3, fontFamily: fonts.bodySemiBold }}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    padding: 24,
    borderWidth: 1.5,
    gap: 16,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, textAlign: 'center' },
  description: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  rewardBox: { padding: 14, borderWidth: 1, alignItems: 'center', gap: 8, width: '100%' },
  rewardLabel: { fontSize: 11, letterSpacing: 0.6 },
  rewardRow: { flexDirection: 'row', gap: 16 },
  rewardValue: { fontSize: 16 },
  titleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  primaryBtn: { paddingVertical: 14, alignItems: 'center', width: '100%' },
  secondaryBtn: { paddingVertical: 12, alignItems: 'center', borderWidth: 1, width: '100%' },
});
