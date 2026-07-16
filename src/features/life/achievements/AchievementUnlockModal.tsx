import { useRef, useCallback } from 'react';
import { Modal, View, Text, Pressable, Share, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@theme';
import { Character } from '@/types';
import { ModalPrimaryButton } from '@components/ModalPrimaryButton';
import { ACHIEVEMENTS, ACHIEVEMENT_COIN_REWARDS, ACHIEVEMENT_GEM_REWARDS } from '@data/gameData';
import { AchievementCategoryIcon } from './AchievementCategoryIcon';
import { getAchievementIconCategory } from './achievementIconCategories';
import {
  AchievementShareCard,
  AchievementShareCardHandle,
} from './AchievementShareCard';

interface Props {
  achievementId: string | null;
  character: Character | null;
  queueLength: number;
  visible: boolean;
  onDismiss: () => void;
}

export function AchievementUnlockModal({
  achievementId,
  character,
  queueLength,
  visible,
  onDismiss,
}: Props) {
  const { colors, fonts, radii } = useTheme();
  const shareRef = useRef<AchievementShareCardHandle>(null);
  const sharingRef = useRef(false);

  const achievement = achievementId
    ? ACHIEVEMENTS.find((a) => a.id === achievementId)
    : undefined;

  const handleShare = useCallback(async () => {
    if (!achievement || !character || sharingRef.current) return;
    sharingRef.current = true;
    try {
      const uri = await shareRef.current?.capture();
      const message = `${character.name} unlocked "${achievement.label}" in LifeQuest at age ${character.age}. Play LifeQuest!`;
      if (uri) {
        await Share.share({ url: uri, message });
      } else {
        await Share.share({ message });
      }
    } catch {
      if (achievement && character) {
        await Share.share({
          message: `${character.name} unlocked "${achievement.label}" in LifeQuest at age ${character.age}. Play LifeQuest!`,
        });
      }
    } finally {
      sharingRef.current = false;
    }
  }, [achievement, character]);

  if (!achievement || !character) return null;

  const category = getAchievementIconCategory(achievement.id);
  const coins = ACHIEVEMENT_COIN_REWARDS[achievement.id] ?? 50;
  const gems = ACHIEVEMENT_GEM_REWARDS[achievement.id] ?? 1;
  const remaining = queueLength - 1;

  return (
    <>
      <AchievementShareCard
        ref={shareRef}
        achievement={achievement}
        characterName={character.name}
        characterAge={character.age}
      />

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onDismiss}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlayScrim }]}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.bgCard,
                borderRadius: radii.md,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${achievement.color}18` }]}>
              <AchievementCategoryIcon
                category={category}
                color={achievement.color}
                size={40}
              />
            </View>

            <Text style={[styles.header, { color: colors.gold, fontFamily: fonts.bodyBold }]}>
              ACHIEVEMENT UNLOCKED
            </Text>

            <Text style={[styles.label, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
              {achievement.label}
            </Text>
            <Text style={[styles.desc, { color: colors.t3, fontFamily: fonts.body }]}>
              {achievement.description}
            </Text>
            <Text style={[styles.reward, { color: colors.emerald2, fontFamily: fonts.monoSemiBold }]}>
              Reward: 🪙 +{coins} Coins{gems > 0 ? ` & 💎 +${gems} Gems` : ''}
            </Text>

            {remaining > 0 && (
              <Text style={[styles.queueHint, { color: colors.t4, fontFamily: fonts.body }]}>
                +{remaining} more achievement{remaining === 1 ? '' : 's'} waiting
              </Text>
            )}

            <Pressable
              onPress={handleShare}
              style={[
                styles.shareBtn,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                  borderRadius: radii.md,
                },
              ]}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  stroke={colors.t1}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
                />
              </Svg>
              <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 14, marginLeft: 8 }}>
                Share Achievement
              </Text>
            </Pressable>

            <ModalPrimaryButton
              label="Awesome!"
              onPress={onDismiss}
              color={colors.emerald}
              fullWidth
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    gap: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 11,
    letterSpacing: 2,
  },
  label: {
    fontSize: 20,
    textAlign: 'center',
  },
  desc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  reward: {
    fontSize: 13,
  },
  queueHint: {
    fontSize: 12,
    marginTop: -4,
  },
  shareBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    marginTop: 4,
  },
});
