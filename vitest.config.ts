import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    env: {
      TZ: 'America/Sao_Paulo',
    },
    root: './',
    include: [
      './src/domain/**/*.spec.ts',
      './src/core/*.spec.ts',
      './src/utils/*.spec.ts',
      './src/infra/mail/*.spec.ts',
      './src/env.spec.ts',
    ],
  },
  resolve: {
    tsconfigPaths: true,
  },
})
