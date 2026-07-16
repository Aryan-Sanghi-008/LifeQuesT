jest.mock('@shared/components/Avatars', () => ({
  NpcAvatar: () => null,
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  };
});

jest.mock('@features/career/hooks/useCareerScreen', () => ({
  useCareerScreen: () => ({
    character: require('@test/fixtures/character').createTestCharacter({
      age: 28,
      educationStage: 'bachelors',
      educationLevel: 'university',
      job: 'Software Engineer',
      career: {
        title: 'Software Engineer',
        company: 'Tech Co',
        salary: 120000,
        performance: 72,
        yearsInRole: 3,
        pathId: 'software_engineer',
      },
    }),
    classmates: [],
    workHarder: jest.fn(),
    askForRaise: jest.fn(),
    quitJob: jest.fn(),
    applyForPromotion: jest.fn(),
    takeCertificationExam: jest.fn(),
    applyForJob: jest.fn(),
  }),
}));

jest.mock('@store/gameStore', () => ({
  useGameStore: (selector: (s: { pendingPromotionOffer: null; dismissPromotionOffer: jest.Mock }) => unknown) =>
    selector({ pendingPromotionOffer: null, dismissPromotionOffer: jest.fn() }),
}));

import { CareerScreen } from '../CareerScreen';
import { renderWithProviders } from '@test/renderWithProviders';

describe('CareerScreen', () => {
  it('renders career header and education section', async () => {
    const { getByText } = await renderWithProviders(<CareerScreen />);
    expect(getByText('Career & School')).toBeTruthy();
    expect(getByText('EDUCATION')).toBeTruthy();
  });

  it('shows current job panel for employed adults', async () => {
    const { getAllByText, getByText } = await renderWithProviders(<CareerScreen />);
    expect(getAllByText('Software Engineer').length).toBeGreaterThan(0);
    expect(getByText('JOB BOARD')).toBeTruthy();
  });
});
