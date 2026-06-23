/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.(ts|tsx)', '**/*.(test|spec).(ts|tsx)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@engine/(.*)$': '<rootDir>/src/engine/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
  },
  collectCoverageFrom: [
    'src/engine/**/*.ts',
    'src/store/**/*.ts',
    '!**/__tests__/**',
  ],
};
