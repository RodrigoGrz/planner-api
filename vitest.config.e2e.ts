import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      './src/infra/http/controllers/*.spec.ts',
      './src/infra/database/**/*.spec.ts',
    ],
    globals: true,
    env: {
      NODE_ENV: 'test',
      TZ: 'America/Sao_Paulo',
    },
    root: './',
    pool: 'threads',
    environment: './tests/setup-e2e.ts',
    isolate: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
})
