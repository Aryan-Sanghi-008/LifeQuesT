// ─── LifeQuest Avatar System ─────────────────────────────────────────────────
// Modern illustration-based avatars using DiceBear adventurer/lorelei/bottts.
// NO pixel art. All avatars are gender & life-stage aware.

import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Style, Avatar } from '@dicebear/core';
import { LifeStage, Gender, Character, AvatarStyleId } from '@/types';
import { getAvatarOptionsForStage, getDefaultAvatarStyle, getStyleFileName, resolveAvatarStyleForGender } from '@utils/lifeStage';
import { useGameStore } from '@store/gameStore';
import { useThemedStyles, useTheme } from '@theme';

// ─── Load all modern DiceBear style JSON defs ─────────────────────────────────
// Only illustration / character styles — no pixel art

// eslint-disable-next-line @typescript-eslint/no-var-requires
const adventurerDef        = require('@dicebear/styles/dist/adventurer.min.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const adventurerNeutralDef = require('@dicebear/styles/dist/adventurer-neutral.min.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const loreleiDef           = require('@dicebear/styles/dist/lorelei.min.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const loreleiNeutralDef    = require('@dicebear/styles/dist/lorelei-neutral.min.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const botttsDef            = require('@dicebear/styles/dist/bottts.min.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notionistsDef        = require('@dicebear/styles/dist/notionists.min.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bigSmileDef          = require('@dicebear/styles/dist/big-smile.min.json');

const STYLE_MAP: Record<string, Style> = {
  'adventurer':         new Style(adventurerDef),
  'adventurer-neutral': new Style(adventurerNeutralDef),
  'lorelei':            new Style(loreleiDef),
  'lorelei-neutral':    new Style(loreleiNeutralDef),
  'bottts':             new Style(botttsDef),
  'notionists':         new Style(notionistsDef),
  'big-smile':          new Style(bigSmileDef),
};

// ─── Core Avatar Component ────────────────────────────────────────────────────

interface DiceBearAvatarProps {
  seed: string;
  lifeStage: LifeStage;
  gender: Gender;
  avatarStyle?: AvatarStyleId | string;
  size?: number;
  showFrame?: boolean;
  frameColor?: string;
  clipCircular?: boolean;
}

export function DiceBearAvatar({
  seed,
  lifeStage,
  gender,
  avatarStyle,
  size = 80,
  showFrame = false,
  frameColor,
  clipCircular = false,
}: DiceBearAvatarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const xml = useMemo(() => {
    try {
      const opts = getAvatarOptionsForStage(lifeStage, gender);

      // Use chosen pack for all genders — gender variation comes from seed options,
      // not from switching art packs. This keeps the whole game visually consistent.
      const packName = avatarStyle ? getStyleFileName(avatarStyle) : getDefaultAvatarStyle(gender);
      const resolvedStyleName = resolveAvatarStyleForGender(packName, gender);

      const style = STYLE_MAP[resolvedStyleName] ?? STYLE_MAP['adventurer'];

      const avatar = new Avatar(style, {
        seed,
        size: 256,
        ...opts,
      });
      return avatar.toString();
    } catch (e) {
      // Fallback gracefully
      console.warn('[Avatar] render error:', e);
      return null;
    }
  }, [seed, lifeStage, gender, avatarStyle]);

  if (!xml) {
    return (
      <View style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 4 },
      ]} />
    );
  }

  const inner = <SvgXml xml={xml} width={size} height={size} />;

  const clipped = clipCircular ? (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
      {inner}
    </View>
  ) : inner;

  if (!showFrame) return clipped;

  const borderCol = frameColor ?? colors.goldBorder;

  return (
    <View style={[styles.frame, {
      width: size + 6,
      height: size + 6,
      borderRadius: size / 2 + 3,
      backgroundColor: colors.bgCard,
      borderColor: borderCol,
    }]}>
      {clipped}
    </View>
  );
}

// ─── Character Avatar (uses Character data directly) ─────────────────────────

interface AvatarByCharacterProps {
  character: Pick<Character, 'avatarSeed' | 'lifeStage' | 'gender' | 'avatarStyle'>;
  size?: number;
  showFrame?: boolean;
  frameColor?: string;
  clipCircular?: boolean;
}

export function AvatarByCharacter({
  character, size = 80, showFrame = false, frameColor, clipCircular = false,
}: AvatarByCharacterProps) {
  return (
    <DiceBearAvatar
      seed={character.avatarSeed}
      lifeStage={character.lifeStage}
      gender={character.gender}
      avatarStyle={character.avatarStyle}
      size={size}
      showFrame={showFrame}
      frameColor={frameColor}
      clipCircular={clipCircular}
    />
  );
}

// ─── NPC / Person Avatar ──────────────────────────────────────────────────────

interface NpcAvatarProps {
  seed: string;
  gender?: Gender;
  size?: number;
  age?: number;
  relationType?: string;
}

export function NpcAvatar({
  seed, gender = 'male', size = 48, age = 30, relationType,
}: NpcAvatarProps) {
  // Inherit the player's chosen avatar pack so all characters share the same visual style
  const playerAvatarStyle = useGameStore((s) => s.character?.avatarStyle);

  const lifeStage: LifeStage =
    age < 2  ? 'infant'      :
    age < 5  ? 'toddler'     :
    age < 13 ? 'child'       :
    age < 18 ? 'teen'        :
    age < 36 ? 'young_adult' :
    age < 51 ? 'adult'       :
    age < 66 ? 'middle_aged' : 'senior';

  // Normalize to pack root so soft gender mapping applies (adventurer-neutral → adventurer pack)
  const packRoot = (() => {
    const style = playerAvatarStyle ?? 'adventurer';
    if (style.startsWith('adventurer')) return 'adventurer';
    if (style.startsWith('lorelei')) return 'lorelei';
    return style;
  })();

  // Pets always use bottts style regardless of player pack
  const avatarStyle = (relationType === 'pet' || gender === 'animal')
    ? 'bottts'
    : packRoot;

  return (
    <DiceBearAvatar
      seed={seed}
      lifeStage={lifeStage}
      gender={gender}
      avatarStyle={avatarStyle}
      size={size}
    />
  );
}

// ─── Pet Avatar ───────────────────────────────────────────────────────────────

interface PetAvatarProps {
  seed: string;
  size?: number;
}

export function PetAvatar({ seed, size = 48 }: PetAvatarProps) {
  return (
    <DiceBearAvatar
      seed={seed}
      lifeStage="young_adult"
      gender="animal"
      avatarStyle="bottts"
      size={size}
    />
  );
}

// ─── Legacy AvatarById (backward compat) ─────────────────────────────────────

import { AvatarId } from '@/types';

export function AvatarById({ id, size = 80 }: { id: AvatarId; size?: number }) {
  const lifeStage: LifeStage = id === 'male_1' || id === 'female_1' ? 'young_adult' : 'adult';
  const gender: Gender = id === 'female_1' || id === 'female_2' ? 'female' : 'male';
  return <DiceBearAvatar seed={id} lifeStage={lifeStage} gender={gender} size={size} />;
}

// ─── Avatar style chooser (for shop / settings) ───────────────────────────────

export const AVATAR_STYLE_OPTIONS: Array<{
  id: AvatarStyleId;
  label: string;
  description: string;
  gender: 'male' | 'female' | 'any';
}> = [
  { id: 'adventurer',          label: 'Explorer',     description: 'Adventurous illustration style',  gender: 'male'   },
  { id: 'lorelei',             label: 'Lorelei',      description: 'Elegant feminine illustration',   gender: 'female' },
  { id: 'adventurer-neutral',  label: 'Wanderer',     description: 'Gender-neutral explorer style',   gender: 'any'    },
  { id: 'lorelei-neutral',     label: 'Mystic',       description: 'Gender-neutral elegant style',    gender: 'any'    },
  { id: 'notionists',          label: 'Professional', description: 'Clean professional look',         gender: 'any'    },
  { id: 'big-smile',           label: 'Joyful',       description: 'Fun, expressive characters',      gender: 'any'    },
  { id: 'bottts',              label: 'Robo',         description: 'Quirky robot style for fun',      gender: 'any'    },
];

const createStyles = ({ colors }: ReturnType<typeof useTheme>) => StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: colors.bg2,
  },
});
