import { RelationshipStage } from '@/types';

export function getRelationshipStageLabel(stage?: RelationshipStage): string {
  if (!stage || stage === 'single') return 'Single';
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}
