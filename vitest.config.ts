import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: [
      './src/domain/**/*.spec.ts',
      './src/core/*.spec.ts',
      './src/utils/*.spec.ts',
    ],
  },
  resolve: {
    tsconfigPaths: true,
  },
})
