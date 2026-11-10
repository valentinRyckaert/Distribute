/** Unit and component tests (API mocked). Integration tests have their own config. */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts?(x)'],
  setupFiles: ['<rootDir>/tests/setup.tsx'],
  collectCoverageFrom: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', '!src/lib/database.types.ts'],
  coverageThreshold: { global: { statements: 75, branches: 75, functions: 75, lines: 75 } },
}
