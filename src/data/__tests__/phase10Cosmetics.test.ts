import { resolveEventSkinId, EVENT_SKIN_STYLES } from '../eventSkinStyles';
import { resolveNameFontId, getNameFontTextStyle } from '../nameFonts';
import { resolveSoundPackId } from '../soundPacks';
import { COSMETIC_IAP_TO_ID } from '../cosmeticCatalog';

describe('eventSkinStyles', () => {
  it('maps cosmetic ids to skin styles', () => {
    expect(resolveEventSkinId('event_skin_neon')).toBe('neon');
    expect(EVENT_SKIN_STYLES.neon.cardBorder).toBe('#06B6D4');
  });
});

describe('nameFonts', () => {
  it('maps font cosmetic to font family style', () => {
    expect(resolveNameFontId('font_mono')).toBe('mono');
    expect(getNameFontTextStyle('mono').fontFamily).toBeTruthy();
  });
});

describe('soundPacks', () => {
  it('maps sound pack cosmetic ids', () => {
    expect(resolveSoundPackId('sound_pack_lofi')).toBe('minimal');
  });
});

describe('cosmetic IAP parity', () => {
  it('has IAP mapping for each priced cosmetic', () => {
    expect(COSMETIC_IAP_TO_ID.cosmetic_event_vintage).toBe('event_skin_vintage');
    expect(COSMETIC_IAP_TO_ID.cosmetic_font_serif).toBe('font_serif');
    expect(COSMETIC_IAP_TO_ID.cosmetic_sound_jazz).toBe('sound_pack_jazz');
  });
});
