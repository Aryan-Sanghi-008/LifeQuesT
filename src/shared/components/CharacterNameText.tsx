import { Text, TextProps, StyleSheet } from 'react-native';
import { useSettingsStore } from '@store/settingsStore';
import { resolveNameFontId, getNameFontTextStyle } from '@data/nameFonts';
import { useTheme } from '@theme';

interface Props extends TextProps {
  name: string;
  color?: string;
  /** Preview override — ignore equipped font */
  forceFontId?: string | null;
}

/** Renders the player character name with equipped name-font cosmetic. */
export function CharacterNameText({ name, style, color, forceFontId, ...rest }: Props) {
  const equippedNameFontId = useSettingsStore((s) => s.equippedNameFontId);
  const { colors, fonts } = useTheme();
  const fontId = resolveNameFontId(forceFontId ?? equippedNameFontId);
  const fontStyle = getNameFontTextStyle(fontId);

  return (
    <Text
      {...rest}
      style={[
        styles.base,
        { color: color ?? colors.t1, fontFamily: fonts.body },
        fontStyle,
        style,
      ]}
    >
      {name}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {},
});
