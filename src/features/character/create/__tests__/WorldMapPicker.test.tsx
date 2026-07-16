import { fireEvent } from '@testing-library/react-native';
import { WorldMapPicker } from '../WorldMapPicker';
import { renderWithProviders } from '@test/renderWithProviders';

describe('WorldMapPicker', () => {
  it('renders region tabs', async () => {
    const { getByText } = await renderWithProviders(
      <WorldMapPicker selectedCode="IN" onSelect={jest.fn()} />,
    );
    expect(getByText('Asia')).toBeTruthy();
    expect(getByText('Europe')).toBeTruthy();
    expect(getByText('Americas')).toBeTruthy();
  });

  it('shows India on Asia tab, not USA', async () => {
    const { getAllByText, queryByText } = await renderWithProviders(
      <WorldMapPicker selectedCode="IN" onSelect={jest.fn()} />,
    );
    expect(getAllByText('India').length).toBeGreaterThanOrEqual(1);
    expect(queryByText('USA')).toBeNull();
  });

  it('shows USA when Americas tab is selected', async () => {
    const { getByText, getAllByText, queryAllByText } = await renderWithProviders(
      <WorldMapPicker selectedCode="US" onSelect={jest.fn()} />,
    );
    await fireEvent.press(getByText('Americas'));
    expect(getAllByText('USA').length).toBeGreaterThanOrEqual(1);
    expect(queryAllByText('India').length).toBe(0);
  });

  it('filters countries within active region when searching', async () => {
    const { getByPlaceholderText, getAllByText, queryAllByText } = await renderWithProviders(
      <WorldMapPicker selectedCode="JP" onSelect={jest.fn()} />,
    );
    await fireEvent.changeText(getByPlaceholderText('Search in region…'), 'Japan');
    expect(getAllByText('Japan').length).toBeGreaterThanOrEqual(1);
    expect(queryAllByText('India').length).toBe(0);
  });
});
