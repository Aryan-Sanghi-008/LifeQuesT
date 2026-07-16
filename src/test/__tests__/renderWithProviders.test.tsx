import { Text } from 'react-native';
import { renderWithProviders } from '@test/renderWithProviders';

describe('render harness smoke', () => {
  it('renders text inside providers', async () => {
    const { getByText } = await renderWithProviders(<Text>Harness ok</Text>);
    expect(getByText('Harness ok')).toBeTruthy();
  });
});
