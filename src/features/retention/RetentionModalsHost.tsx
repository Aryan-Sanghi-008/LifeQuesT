import { useGameStore } from '@store/gameStore';
import { AchievementUnlockModal } from '@features/life/achievements/AchievementUnlockModal';
import { ReturnAbsenceModal } from '@features/retention/ReturnAbsenceModal';
import { DynastyMilestoneModal } from '@features/retention/DynastyMilestoneModal';
import { CollectionSetCompleteModal } from '@features/collections/CollectionSetCompleteModal';

/** Global retention modals mounted once at app root. */
export function RetentionModalsHost() {
  const character = useGameStore((s) => s.character);
  const queue = useGameStore((s) => s.achievementUnlockQueue);
  const dismissAchievement = useGameStore((s) => s.dismissAchievementUnlock);
  const pendingAbsence = useGameStore((s) => s.pendingAbsenceBonus);
  const claimAbsence = useGameStore((s) => s.claimAbsenceBonus);
  const dynastyQueue = useGameStore((s) => s.dynastyMilestoneQueue);
  const dismissDynasty = useGameStore((s) => s.dismissDynastyMilestone);
  const collectionQueue = useGameStore((s) => s.collectionSetCompleteQueue);
  const dismissCollection = useGameStore((s) => s.dismissCollectionSetComplete);

  return (
    <>
      <AchievementUnlockModal
        achievementId={queue[0] ?? null}
        character={character}
        queueLength={queue.length}
        visible={queue.length > 0 && !!character}
        onDismiss={dismissAchievement}
      />
      {pendingAbsence && character && (
        <ReturnAbsenceModal
          visible
          daysAway={pendingAbsence.daysAway}
          coins={pendingAbsence.coins}
          gems={pendingAbsence.gems}
          characterAge={character.age}
          projectedAge={pendingAbsence.projectedAge}
          narrativeLines={pendingAbsence.narrativeLines}
          onClaim={claimAbsence}
        />
      )}
      <DynastyMilestoneModal
        milestone={dynastyQueue[0] ?? null}
        onDismiss={dismissDynasty}
      />
      <CollectionSetCompleteModal
        collectionSet={collectionQueue[0] ?? null}
        onDismiss={dismissCollection}
      />
    </>
  );
}
