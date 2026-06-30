/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.(ts|tsx)', '**/*.(test|spec).(ts|tsx)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@components/(.*)$': '<rootDir>/src/shared/components/$1',
    '^@components$': '<rootDir>/src/shared/components/index.tsx',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@hooks/(.*)$': '<rootDir>/src/shared/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/shared/utils/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@engine/(.*)$': '<rootDir>/src/engine/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@theme/(.*)$': '<rootDir>/src/shared/theme/$1',
    '^@theme$': '<rootDir>/src/shared/theme/index.ts',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
  },
  collectCoverageFrom: [
    'src/engine/**/*.ts',
    '!src/engine/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      lines: 0,
    },
    'src/engine/': {
      lines: 50,
    },
  },
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/functions/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|immer|zustand)',
  ],
};