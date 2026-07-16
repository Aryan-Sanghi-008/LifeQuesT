import { verifyAppStorePurchase, getAppleConfig } from '../verifyAppStore';

const ORIGINAL_ENV = process.env;

describe('getAppleConfig', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns null when secrets are missing', () => {
    delete process.env.APPLE_ISSUER_ID;
    delete process.env.APPLE_KEY_ID;
    delete process.env.APPLE_BUNDLE_ID;
    delete process.env.APPLE_PRIVATE_KEY;
    expect(getAppleConfig()).toBeNull();
  });

  it('returns config when all secrets are set', () => {
    process.env.APPLE_ISSUER_ID = 'issuer';
    process.env.APPLE_KEY_ID = 'key';
    process.env.APPLE_BUNDLE_ID = 'com.lifequest.app';
    process.env.APPLE_PRIVATE_KEY = 'private-key';
    expect(getAppleConfig()).toEqual({
      issuerId: 'issuer',
      keyId: 'key',
      bundleId: 'com.lifequest.app',
      privateKey: 'private-key',
    });
  });
});

describe('verifyAppStorePurchase', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.APPLE_ISSUER_ID;
    delete process.env.APPLE_KEY_ID;
    delete process.env.APPLE_BUNDLE_ID;
    delete process.env.APPLE_PRIVATE_KEY;
    delete process.env.IAP_ALLOW_UNVERIFIED;
    delete process.env.FUNCTIONS_EMULATOR;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('throws when not configured and emulator bypass is off', async () => {
    await expect(
      verifyAppStorePurchase('season_pass', 'tx-1'),
    ).rejects.toThrow('not configured');
  });

  it('allows bypass in emulator when IAP_ALLOW_UNVERIFIED is set', async () => {
    process.env.IAP_ALLOW_UNVERIFIED = 'true';
    process.env.FUNCTIONS_EMULATOR = 'true';
    await expect(
      verifyAppStorePurchase('season_pass', 'tx-1'),
    ).resolves.toBeUndefined();
  });

  it('does not allow bypass when IAP_ALLOW_UNVERIFIED is set outside emulator', async () => {
    process.env.IAP_ALLOW_UNVERIFIED = 'true';
    delete process.env.FUNCTIONS_EMULATOR;
    await expect(
      verifyAppStorePurchase('season_pass', 'tx-1'),
    ).rejects.toThrow('not configured');
  });

  it('throws not implemented when config is present', async () => {
    process.env.APPLE_ISSUER_ID = 'issuer';
    process.env.APPLE_KEY_ID = 'key';
    process.env.APPLE_BUNDLE_ID = 'com.lifequest.app';
    process.env.APPLE_PRIVATE_KEY = 'private-key';
    await expect(
      verifyAppStorePurchase('season_pass', 'tx-1'),
    ).rejects.toThrow('not implemented');
  });
});
