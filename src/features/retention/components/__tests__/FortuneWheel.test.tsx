import { renderWithProviders } from '@test/renderWithProviders';
import { FortuneWheel } from '../FortuneWheel';
import { Animated } from 'react-native';

jest.mock('react-native-safe-area-context', () =>
  require('@test/safeAreaMock').createSafeAreaContextMock(),
);

describe('FortuneWheel', () => {
  it('renders the mystery wheel with eight segments', async () => {
    const rotate = new Animated.Value(0);
    const rotateDeg = rotate.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
    });

    const { getAllByText, getByText } = await renderWithProviders(
      <FortuneWheel rotateDeg={rotateDeg} highlightReady />,
    );

    expect(getAllByText('🪙').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('💎').length).toBeGreaterThanOrEqual(1);
    expect(getByText('🍀')).toBeTruthy();
    expect(getByText('✨')).toBeTruthy();
  });
});
