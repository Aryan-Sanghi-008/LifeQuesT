import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme, MIN_TAP_TARGET, FONT_SIZES, TAB_LABEL_MAX_FONT_SCALE, clampFontScale } from '@theme';

export interface ChipTabItem<T extends string = string> {
  id: T;
  label: string;
}

export interface ChipTabColors {
  border: string;
  background: string;
  text: string;
}

interface HorizontalChipTabBarProps<T extends string> {
  tabs: ChipTabItem<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  activeColors: ChipTabColors;
  inactiveColors: ChipTabColors;
  accessibilityRole?: 'tab';
}

export function HorizontalChipTabBar<T extends string>({
  tabs,
  activeId,
  onSelect,
  activeColors,
  inactiveColors,
}: HorizontalChipTabBarProps<T>) {
  const { fonts, radii, spacing, fontScale } = useTheme();
  const tabScale = Math.min(TAB_LABEL_MAX_FONT_SCALE, clampFontScale(fontScale));
  const labelSize = Math.round(FONT_SIZES.sm * tabScale);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bar}
      contentContainerStyle={[
        styles.content,
        { paddingHorizontal: spacing.md, gap: spacing.sm, paddingVertical: spacing.sm },
      ]}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        const palette = active ? activeColors : inactiveColors;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelect(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            style={[
              styles.chip,
              {
                minHeight: MIN_TAP_TARGET,
                borderRadius: radii.sm,
                borderColor: palette.border,
                backgroundColor: palette.background,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            <Text
              style={{
                color: palette.text,
                fontFamily: active ? fonts.bodySemiBold : fonts.body,
                fontSize: labelSize,
              }}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: { flexGrow: 0 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexShrink: 0,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
