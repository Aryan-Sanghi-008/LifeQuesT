import { Text, TextProps, StyleSheet } from 'react-native';
import { useSettingsStore } from '@store/settingsStore';
import { useTheme } from '@theme';
import { applyFontPack, resolveFontPackId, FONT_PACK_PROFILES } from '@data/fontPacks';
import { FONTS } from '@theme/themes';

interface Props extends TextProps {
  name: string;
  color?: string;
  /** Preview override — ignore equipped font pack */
  forceFontId?: string | null;
}

/** Renders the player character name with the active (or preview) font pack. */
export function CharacterNameText({ name, style, color, forceFontId, ...rest }: Props) {
  const { colors, fonts } = useTheme();
  const equippedNameFontId = useSettingsStore((s) => s.equippedNameFontId);
  const cosmeticId = forceFontId !== undefined ? forceFontId : equippedNameFontId;
  const packId = resolveFontPackId(cosmeticId);
  const packFonts =
    forceFontId !== undefined ? applyFontPack(FONTS, packId) : fonts;
  const letterSpacing = FONT_PACK_PROFILES[packId]?.letterSpacing;

  return (
    <Text
      {...rest}
      style={[
        styles.base,
        style,
        {
          color: color ?? colors.t1,
          fontFamily: packFonts.displayBold,
          letterSpacing,
        },
      ]}
    >
      {name}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {},
});
