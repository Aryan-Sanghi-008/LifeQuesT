import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { BottomSheet } from '@components/index';
import { useTheme, applyThemeSkinTokens, COLORS, DARK_COLORS, getThemeSkin } from '@theme';
import type { CosmeticItem } from '@data/cosmeticCatalog';
import { themeSkinIdFromCosmetic } from '@theme/themeSkins';
import { EVENT_SKIN_STYLES, resolveEventSkinId } from '@data/eventSkinStyles';
import { CharacterNameText } from '@shared/components/CharacterNameText';
import { TombstoneHero } from '@features/character/death/TombstoneHero';
import { playSoundPackPreview } from '@services/audio';
import { useSettingsStore } from '@store/settingsStore';
import { getPlusFrameColor } from '@data/cosmeticCatalog';
import { applyFontPack, resolveFontPackId } from '@data/fontPacks';
import { FONTS as BASE_FONTS } from '@theme/themes';
import { useToastStore } from '@store/toastStore';

interface Props {
  item: CosmeticItem | null;
  owned: boolean;
  visible: boolean;
  purchasing?: boolean;
  priceLabel?: string;
  onClose: () => void;
  onEquip: () => void;
  onBuy: () => void;
}

export function CosmeticPreviewSheet({
  item,
  owned,
  visible,
  purchasing,
  priceLabel,
  onClose,
  onEquip,
  onBuy,
}: Props) {
  const { colors, fonts, spacing, radii, isDark } = useTheme();
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const showToast = useToastStore((s) => s.showToast);

  const modeMismatch = useMemo(() => {
    if (!item || item.category !== 'theme' || !item.mode) return false;
    if (item.id === 'theme_system_default') return false;
    const effectiveDark =
      colorScheme === 'system' ? isDark : colorScheme === 'dark';
    return (item.mode === 'dark') !== effectiveDark;
  }, [item, colorScheme, isDark]);

  if (!item) return null;

  const preview = (() => {
    if (item.category === 'theme') {
      const skinId = themeSkinIdFromCosmetic(item.id);
      const skin = getThemeSkin(skinId);
      if (!skin || skinId === 'default') {
        const base = isDark ? DARK_COLORS : COLORS;
        return (
          <View style={[styles.phone, { backgroundColor: base.bg, borderColor: base.border }]}>
            <View style={[styles.phoneHeader, { backgroundColor: base.bg2 }]}>
              <Text style={{ color: base.t3, fontFamily: fonts.bodyBold, fontSize: 10 }}>HOME</Text>
            </View>
            <View style={[styles.phoneCard, { backgroundColor: base.bgCard, borderColor: base.border }]}>
              <Text style={{ color: base.t1, fontFamily: fonts.displayBold, fontSize: 16 }}>{item.label}</Text>
              <Text style={{ color: base.t2, fontFamily: fonts.body, fontSize: 12, marginTop: 4 }}>
                Built-in palette with no premium skin overlay.
              </Text>
            </View>
          </View>
        );
      }
      const wantDark = skin.mode === 'dark';
      const base = wantDark ? DARK_COLORS : COLORS;
      const tokens = applyThemeSkinTokens(base, skinId, !!wantDark);
      return (
        <View style={[styles.phone, { backgroundColor: tokens.bg, borderColor: tokens.border }]}>
          <View style={[styles.phoneHeader, { backgroundColor: tokens.bg2 }]}>
            <Text style={{ color: tokens.t3, fontFamily: fonts.bodyBold, fontSize: 10 }}>HOME</Text>
          </View>
          <View style={[styles.phoneCard, { backgroundColor: tokens.bgCard, borderColor: tokens.border }]}>
            <Text style={{ color: tokens.t1, fontFamily: fonts.displayBold, fontSize: 16 }}>{item.label}</Text>
            <Text style={{ color: tokens.t2, fontFamily: fonts.body, fontSize: 12, marginTop: 4 }}>
              Sample card text stays readable.
            </Text>
            <View style={[styles.phoneBtn, { backgroundColor: tokens.gold }]}>
              <Text style={{ color: colors.textOnInverse, fontFamily: fonts.bodyBold, fontSize: 12 }}>Age Up</Text>
            </View>
          </View>
        </View>
      );
    }
    if (item.category === 'event_skin') {
      const skin = EVENT_SKIN_STYLES[resolveEventSkinId(item.id)];
      return (
        <View style={[styles.eventSample, {
          backgroundColor: skin.cardBg === 'transparent' ? colors.bgCard : skin.cardBg,
          borderColor: skin.cardBorder === 'transparent' ? colors.border : skin.cardBorder,
        }]}>
          <View style={{ width: 4, backgroundColor: skin.accentBar ?? colors.gold, borderRadius: 2 }} />
          <View style={{ flex: 1, padding: 12, gap: 4 }}>
            <Text style={{ color: skin.titleColor ?? colors.t1, fontFamily: fonts.bodyBold, fontSize: 14 }}>
              Sample Life Event
            </Text>
            <Text style={{ color: skin.bodyColor ?? colors.t2, fontFamily: fonts.body, fontSize: 12 }}>
              This is how your feed cards will look.
            </Text>
          </View>
        </View>
      );
    }
    if (item.category === 'name_font') {
      const previewFonts = applyFontPack(BASE_FONTS, resolveFontPackId(item.id));
      return (
        <View style={{ alignItems: 'center', padding: spacing.lg, width: '100%' }}>
          <CharacterNameText
            name="Alex Rivera"
            forceFontId={item.id}
            style={{ fontSize: 28, color: colors.t1 }}
          />
          <Text
            style={{
              color: colors.t1,
              fontFamily: previewFonts.displayBold,
              fontSize: 18,
              marginTop: 12,
            }}
          >
            Age Up · Life Events
          </Text>
          <Text
            style={{
              color: colors.t3,
              fontFamily: previewFonts.body,
              fontSize: 13,
              marginTop: 6,
              textAlign: 'center',
              lineHeight: 18,
            }}
          >
            Typography updates across the app when equipped.
          </Text>
        </View>
      );
    }
    if (item.category === 'sound_pack') {
      return (
        <Pressable
          onPress={() => {
            void playSoundPackPreview(item.id).then((result) => {
              if (result.ok) {
                showToast(`Playing ${item.label} sample`, 'info');
                return;
              }
              if (result.reason === 'muted') {
                showToast('Enable sounds in Settings to preview', 'info');
                return;
              }
              showToast('Could not play sound sample', 'error');
            });
          }}
          style={[styles.soundBtn, { backgroundColor: `${item.previewColor ?? colors.teal}22`, borderColor: item.previewColor ?? colors.teal }]}
          accessibilityRole="button"
          accessibilityLabel="Play sound pack sample"
        >
          <Text style={{ color: item.previewColor ?? colors.teal, fontFamily: fonts.bodyBold, fontSize: 14 }}>
            Play sample
          </Text>
        </Pressable>
      );
    }
    if (item.category === 'tombstone') {
      return (
        <TombstoneHero
          name="Alex Rivera"
          birthYear={2000}
          deathAge={78}
          tombstoneStyleId={item.id.replace('tombstone_', '')}
          compact
        />
      );
    }
    if (item.category === 'plus_frame') {
      const frame = getPlusFrameColor(item.id) ?? colors.gold;
      return (
        <View style={[styles.framePreview, { borderColor: frame }]}>
          <View style={[styles.avatarDot, { backgroundColor: colors.bg2 }]} />
          <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, marginTop: 8 }}>{item.label}</Text>
        </View>
      );
    }
    return (
      <Text style={{ color: colors.t2, fontFamily: fonts.body, textAlign: 'center' }}>
        {item.description}
      </Text>
    );
  })();

  return (
    <BottomSheet visible={visible} onClose={onClose} title={item.label}>
      <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 13, marginBottom: spacing.md }}>
        {item.description}
      </Text>
      <View style={[styles.previewWell, { backgroundColor: colors.bg2, borderRadius: radii.md }]}>
        {preview}
      </View>
      {modeMismatch && (
        <Text style={{ color: colors.crimson, fontFamily: fonts.body, fontSize: 12, marginTop: spacing.sm }}>
          Switch to {item.mode === 'dark' ? 'Dark' : 'Light'} mode in Settings to use this theme.
        </Text>
      )}
      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        {owned ? (
          <Pressable
            onPress={onEquip}
            disabled={modeMismatch}
            accessibilityRole="button"
            accessibilityLabel={`Equip ${item.label}`}
            style={[styles.cta, {
              backgroundColor: modeMismatch ? colors.bgCard2 : colors.gold,
              opacity: modeMismatch ? 0.5 : 1,
            }]}
          >
            <Text style={{ color: colors.textOnInverse, fontFamily: fonts.displayBold, fontSize: 15 }}>Equip</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onBuy}
            disabled={!!purchasing}
            accessibilityRole="button"
            accessibilityLabel={`Buy ${item.label}`}
            style={[styles.cta, { backgroundColor: colors.gold }]}
          >
            {purchasing ? (
              <ActivityIndicator color={colors.textOnInverse} />
            ) : (
              <Text style={{ color: colors.textOnInverse, fontFamily: fonts.displayBold, fontSize: 15 }}>
                Buy{priceLabel ? ` · ${priceLabel}` : ''}
              </Text>
            )}
          </Pressable>
        )}
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close preview">
          <Text style={{ color: colors.t3, fontFamily: fonts.body, textAlign: 'center', padding: 8 }}>
            Close
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  previewWell: {
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  phone: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  phoneHeader: { padding: 10 },
  phoneCard: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  phoneBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  eventSample: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    minHeight: 72,
  },
  soundBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  framePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDot: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  cta: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
