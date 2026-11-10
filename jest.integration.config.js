/** Integration tests against the local Supabase stack (`bun db:start`, then `bun db:reset`). */
module.exports = {
  preset: 'jest-expo/node',
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  testTimeout: 20000,
  maxWorkers: 1,
}
