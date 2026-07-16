import type { ReactNode } from 'react';

/** RNTL-safe mock — never wrap renderWithProviders in real SafeAreaProvider. */
export function createSafeAreaContextMock() {
  const React = require('react') as typeof import('react');
  const { View } = require('react-native') as typeof import('react-native');

  return {
    SafeAreaProvider: ({ children }: { children: ReactNode }) =>
      React.createElement(View, null, children),
    SafeAreaView: ({ children }: { children: ReactNode }) =>
      React.createElement(View, null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
}
