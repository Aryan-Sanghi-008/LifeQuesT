import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Style, Avatar } from '@dicebear/core';
import { LifeStage, Gender, Character } from '../types';
import { getAvatarOptionsForStage } from '../utils/lifeStage';
import { COLORS } from '../theme/themes';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pixelArtDef = require('@dicebear/styles/pixel-art.json');
const pixelStyle = new Style(pixelArtDef);

interface DiceBearAvatarProps {
  seed: string;
  lifeStage: LifeStage;
  gender: Gender;
  size?: number;
  showFrame?: boolean;
}

export function DiceBearAvatar({
  seed,
  lifeStage,
  gender,
  size = 80,
  showFrame = false,
}: DiceBearAvatarProps) {
  const xml = useMemo(() => {
    try {
      const opts = getAvatarOptionsForStage(lifeStage, gender);
      const avatar = new Avatar(pixelStyle, {
        seed,
        size: 128,
        ...opts,
      });
      return avatar.toString();
    } catch {
      return null;
    }
  }, [seed, lifeStage, gender]);

  if (!xml) return <View style={[s.fallback, { width: size, height: size, borderRadius: size / 4 }]} />;

  const inner = (
    <SvgXml xml={xml} width={size} height={size} />
  );

  if (!showFrame) return inner;

  return (
    <View style={[s.frame, {
      width: size + 4,
      height: size + 4,
      borderRadius: size / 4 + 2,
      backgroundColor: COLORS.bgCard,
      borderColor: COLORS.goldBorder,
    }]}>
      {inner}
    </View>
  );
}

const s = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: COLORS.bgCard,
  },
});

// ─── Convenience wrapper using Character object ───────────────────────────────

interface AvatarByCharacterProps {
  character: Pick<Character, 'avatarSeed' | 'lifeStage' | 'gender'>;
  size?: number;
  showFrame?: boolean;
}

export function AvatarByCharacter({ character, size = 80, showFrame = false }: AvatarByCharacterProps) {
  return (
    <DiceBearAvatar
      seed={character.avatarSeed}
      lifeStage={character.lifeStage}
      gender={character.gender}
      size={size}
      showFrame={showFrame}
    />
  );
}

// ─── NPC Avatar (seed-only, no life stage) ────────────────────────────────────

interface NpcAvatarProps {
  seed: string;
  gender?: Gender;
  size?: number;
  age?: number;
}

export function NpcAvatar({ seed, gender = 'male', size = 48, age = 30 }: NpcAvatarProps) {
  const lifeStage: LifeStage = age < 13 ? 'child' : age < 18 ? 'teen' : age < 36 ? 'young_adult' : age < 60 ? 'adult' : 'senior';
  return <DiceBearAvatar seed={seed} lifeStage={lifeStage} gender={gender} size={size} />;
}

// ─── Legacy AvatarById — kept for any leftover usages ────────────────────────

import { AvatarId } from '../types';

export function AvatarById({ id, size = 80 }: { id: AvatarId; size?: number }) {
  const lifeStage: LifeStage = id === 'male_1' || id === 'female_1' ? 'young_adult' : 'adult';
  const gender: Gender = id === 'female_1' || id === 'female_2' ? 'female' : 'male';
  return <DiceBearAvatar seed={id} lifeStage={lifeStage} gender={gender} size={size} />;
}
