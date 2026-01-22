import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    include: ['./src/infra/http/controllers/*.spec.ts'],
    globals: true,
    root: './',
    environment: './tests/setup-e2e.ts',
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
